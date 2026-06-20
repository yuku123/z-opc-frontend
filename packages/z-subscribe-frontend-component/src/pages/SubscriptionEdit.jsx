import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    message,
    Radio,
    Select,
    Space,
    Spin
} from 'antd'
import {ArrowLeftOutlined, ApiOutlined, SaveOutlined} from '@ant-design/icons'
import request from '../utils/request'

const EXTRACTOR_OPTIONS = [
    {value: 'STANDARD_JSON', label: '标准 JSON (按统一契约返回的 JSON)'},
    {value: 'RSS_XML', label: 'RSS 2.0 (XML feed)'},
    {value: 'ATOM_XML', label: 'Atom 1.0 (XML feed)'},
    {value: 'CUSTOM_SCRIPT', label: '自定义脚本 (z-script 平台)'},
    {value: 'INTERNAL_BEAN', label: '内部 Bean (我们自己的模块, 暂未启用)'},
]

const AUTH_TYPE_OPTIONS = [
    {value: 'NONE', label: '无鉴权'},
    {value: 'BEARER', label: 'Bearer (Authorization: Bearer xxx)'},
    {value: 'API_KEY', label: 'API Key (Authorization: xxx)'},
    {value: 'BASIC', label: 'Basic (user:password base64)'},
]

const CRON_PRESETS = [
    {label: '每 5 分钟', value: '0 */5 * * * ?'},
    {label: '每 15 分钟', value: '0 */15 * * * ?'},
    {label: '每小时', value: '0 0 * * * ?'},
    {label: '每 6 小时', value: '0 0 */6 * * ?'},
    {label: '每天 8 点', value: '0 0 8 * * ?'},
]

function SubscriptionEdit() {
    const {id} = useParams()
    const navigate = useNavigate()
    const isEdit = !!id
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [secrets, setSecrets] = useState([])
    const [scripts, setScripts] = useState([])

    // 动态值
    const sourceType = Form.useWatch('sourceType', form)
    const extractorType = Form.useWatch('extractorType', form)
    const authType = Form.useWatch('authType', form)

    useEffect(() => {
        loadSecrets()
        loadScripts()
        if (isEdit) loadSubscription()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const loadSecrets = async () => {
        try {
            const res = await request.get('/secret/list')
            const data = res?.data ?? res ?? []
            setSecrets(Array.isArray(data) ? data : [])
        } catch (e) {
            // z-mist 不可用时静默
        }
    }

    const loadScripts = async () => {
        try {
            const res = await request.get('/script/list')
            const data = res?.data ?? res ?? []
            setScripts(Array.isArray(data) ? data.filter(s => s.status === 1) : [])
        } catch (e) {
            // z-script 不可用时静默
        }
    }

    const loadSubscription = async () => {
        setLoading(true)
        try {
            const res = await request.get(`/subscribe/subscription/${id}`)
            const data = res?.data ?? res
            if (data) {
                form.setFieldsValue({
                    ...data,
                    enabled: data.enabled === 1 || data.enabled === true,
                })
            }
        } catch (e) {
            message.error('加载订阅失败: ' + (e?.message || ''))
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            setSaving(true)
            const payload = {
                ...values,
                enabled: values.enabled ? 1 : 0,
            }
            let res
            if (isEdit) {
                res = await request.put('/subscribe/subscription', payload)
            } else {
                res = await request.post('/subscribe/subscription', payload)
            }
            if (res && (res.success === false)) {
                message.error(res.message || '保存失败')
                return
            }
            message.success(isEdit ? '已更新 (注意: 修改 cron / url / 抽取器后会自动重置为 PENDING_VERIFY)' : '已创建, 已自动验证')
            navigate('/subscribe/list')
        } catch (e) {
            if (e?.errorFields) {
                message.warning('请检查表单')
            } else {
                message.error('保存失败: ' + (e?.message || ''))
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{padding: 24}}>
            <Card
                title={
                    <Space>
                        <Button type="text" icon={<ArrowLeftOutlined/>} onClick={() => navigate('/subscribe/list')}/>
                        <ApiOutlined/>
                        {isEdit ? `编辑订阅 #${id}` : '新建订阅'}
                    </Space>
                }
                extra={
                    <Space>
                        <Button onClick={() => navigate('/subscribe/list')}>取消</Button>
                        <Button type="primary" icon={<SaveOutlined/>} loading={saving} onClick={handleSave}>
                            保存 (自动验证)
                        </Button>
                    </Space>
                }
            >
                <Spin spinning={loading}>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            sourceType: 'HTTP',
                            httpMethod: 'GET',
                            authType: 'NONE',
                            extractorType: 'STANDARD_JSON',
                            enabled: true,
                            minIntervalSec: 60,
                            maxItemsPerRun: 1000,
                            timeoutMs: 15000,
                        }}
                    >
                        <Card type="inner" title="基本信息" style={{marginBottom: 16}}>
                            <Form.Item label="名称" name="name" rules={[{required: true, message: '请输入名称'}]}>
                                <Input placeholder="例如: GitHub PR 通知"/>
                            </Form.Item>
                            <Form.Item label="说明" name="description">
                                <Input.TextArea rows={2} placeholder="(可选)"/>
                            </Form.Item>
                        </Card>

                        <Card type="inner" title="数据源" style={{marginBottom: 16}}>
                            <Form.Item label="数据源形态" name="sourceType" rules={[{required: true}]}>
                                <Radio.Group>
                                    <Radio.Button value="HTTP">HTTP / HTTPS</Radio.Button>
                                    <Radio.Button value="INTERNAL" disabled>内部 Bean (TODO)</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            {sourceType === 'HTTP' && (
                                <>
                                    <Form.Item label="目标 URL" name="targetUrl"
                                               rules={[{required: true, message: '请输入 URL'}]}>
                                        <Input placeholder="https://api.github.com/repos/.../pulls?state=open"/>
                                    </Form.Item>
                                    <Space size="large" style={{width: '100%'}}>
                                        <Form.Item label="HTTP 方法" name="httpMethod">
                                            <Select style={{width: 120}} options={[
                                                {value: 'GET', label: 'GET'},
                                                {value: 'POST', label: 'POST'},
                                                {value: 'PUT', label: 'PUT'},
                                            ]}/>
                                        </Form.Item>
                                        <Form.Item label="超时 (ms)" name="timeoutMs">
                                            <InputNumber min={1000} max={120000} step={1000}/>
                                        </Form.Item>
                                    </Space>
                                    <Form.Item label="自定义 HTTP 头 (JSON)" name="httpHeaders">
                                        <Input.TextArea rows={2} placeholder='{"X-Trace-Id":"abc"}'/>
                                    </Form.Item>
                                    <Form.Item label="请求体 (POST/PUT)" name="requestBody">
                                        <Input.TextArea rows={3} placeholder="(可选)"/>
                                    </Form.Item>
                                </>
                            )}
                        </Card>

                        <Card type="inner" title="鉴权 (从 z-mist 拉取 secret)" style={{marginBottom: 16}}>
                            <Form.Item label="鉴权方式" name="authType">
                                <Select options={AUTH_TYPE_OPTIONS}/>
                            </Form.Item>
                            {authType && authType !== 'NONE' && (
                                <Form.Item label="z-mist 凭据引用" name="authSecretKey"
                                           extra="从密钥中心 (z-mist) 选一个 secret; secret 的解密值会作为 secret 注入">
                                    <Select
                                        showSearch
                                        allowClear
                                        placeholder="选择 secret (key)"
                                        options={secrets.map(s => ({
                                            value: s.secretKey,
                                            label: `${s.secretKey}${s.secretName ? ' (' + s.secretName + ')' : ''}`,
                                        }))}
                                    />
                                </Form.Item>
                            )}
                        </Card>

                        <Card type="inner" title="抽取器" style={{marginBottom: 16}}>
                            <Form.Item label="抽取器类型" name="extractorType" rules={[{required: true}]}
                                       extra="STANDARD_JSON/RSS_XML/ATOM_XML 直接解析; CUSTOM_SCRIPT 调 z-script 平台">
                                <Select options={EXTRACTOR_OPTIONS}/>
                            </Form.Item>
                            {extractorType === 'CUSTOM_SCRIPT' && (
                                <Form.Item label="z-script 脚本" name="extractorScriptCode"
                                           rules={[{required: true, message: '请选择脚本'}]}
                                           extra="在 智能中心 > 脚本中心 维护脚本. 脚本返回 { items: [...], nextCursor: '...' }">
                                    <Select
                                        showSearch
                                        placeholder="选择已启用的脚本"
                                        options={scripts.map(s => ({
                                            value: s.scriptCode,
                                            label: `${s.scriptCode} (${s.dslType})${s.scriptName ? ' - ' + s.scriptName : ''}`,
                                        }))}
                                    />
                                </Form.Item>
                            )}
                        </Card>

                        <Card type="inner" title="调度" style={{marginBottom: 16}}>
                            <Form.Item label="Cron 表达式" name="cronExpr"
                                       rules={[{required: true, message: '请输入 Cron'}]}
                                       extra="Quartz 兼容, 例如 0 */5 * * * ? = 每 5 分钟">
                                <Input addonAfter={
                                    <Select
                                        style={{width: 140}}
                                        placeholder="常用"
                                        options={CRON_PRESETS}
                                        onChange={(v) => form.setFieldValue('cronExpr', v)}
                                        value={null}
                                    />
                                }/>
                            </Form.Item>
                            <Space size="large">
                                <Form.Item label="启用" name="enabled" valuePropName="checked">
                                    <Radio.Group>
                                        <Radio.Button value={true}>启用</Radio.Button>
                                        <Radio.Button value={false}>停用</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item label="最小间隔 (秒)" name="minIntervalSec"
                                           extra="距上次 run 至少 N 秒">
                                    <InputNumber min={0} max={3600}/>
                                </Form.Item>
                                <Form.Item label="单次最多条数" name="maxItemsPerRun">
                                    <InputNumber min={1} max={10000}/>
                                </Form.Item>
                            </Space>
                        </Card>

                        <Alert
                            type="success"
                            showIcon
                            message="保存后会自动 dry-run: 真实 HTTP 一次, 把响应喂给抽取器, 失败时订阅进入 INVALID_AUTH 状态, 不会自动调度."
                        />
                    </Form>
                </Spin>
            </Card>
        </div>
    )
}

export default SubscriptionEdit
