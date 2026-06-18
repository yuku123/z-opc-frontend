#!/usr/bin/env bash
# 本地一键发所有公开子包到 npmjs.com（调试/回退用）
# 推荐：直接用 GitHub Actions → release / publish workflow
#
# 用法：
#   1) 确认已 npm login（或提供 NPM_TOKEN 环境变量）
#   2) bash scripts/publish-all.sh
#   或：
#     NPM_TOKEN=npm_xxx bash scripts/publish-all.sh
#   仅 dry-run 不实际构建/发布：
#     bash scripts/publish-all.sh --dry-run

set -euo pipefail

DRY_RUN="false"
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="true" ;;
    *) echo "❌ 未知参数: $arg"; exit 1 ;;
  esac
done

# 自动收集所有 public workspace 包（private 字段 !== true 的）
PACKAGES=$(node -e "
  const fs=require('fs'),path=require('path');
  process.stdout.write(
    fs.readdirSync('packages',{withFileTypes:true})
      .filter(d=>d.isDirectory())
      .filter(d=>{
        const p=require(path.resolve('packages',d.name,'package.json'));
        return p.private!==true && p.name && p.version;
      })
      .map(d=>'packages/'+d.name)
      .sort((a,b)=>{
        // z-frontend-common 必须先发（有包 peer-deps 它）
        const ax=a.includes('z-frontend-common')?0:1;
        const bx=b.includes('z-frontend-common')?0:1;
        return ax-bx || a.localeCompare(b);
      })
      .join('\n')
  );
")

if [ -z "$PACKAGES" ]; then
  echo "❌ 没找到任何可发布的包"
  exit 1
fi

echo "=== 待发布包清单 ==="
echo "$PACKAGES"
echo ""

if [ "$DRY_RUN" = "true" ]; then
  echo "✓ dry-run: 不实际 build / publish"
  echo "  在 GitHub Actions 上跑 release workflow 即可一键升级 + 发布"
  exit 0
fi

# build 每个包
echo "=== 1/2 build all packages ==="
for pkg in $PACKAGES; do
  echo "--- building $pkg ---"
  (cd "$pkg" && npm run build)
done

# publish
echo ""
echo "=== 2/2 publish all packages ==="
for pkg in $PACKAGES; do
  echo "--- publishing $pkg ---"
  if [ -n "${NPM_TOKEN:-}" ]; then
    # Use provided token via .npmrc
    NPM_CONFIG_USERCONFIG="$(mktemp)" node -e "
      const fs=require('fs');
      fs.writeFileSync(process.env.NPM_CONFIG_USERCONFIG,
        '//registry.npmjs.org/:_authToken='+process.env.NPM_TOKEN+'\n');
    "
    (cd "$pkg" && NPM_CONFIG_USERCONFIG="$NPM_CONFIG_USERCONFIG" npm publish --access public --provenance)
  else
    (cd "$pkg" && npm publish --access public --provenance)
  fi
done

echo ""
echo "✓ 全部 publish 完成"