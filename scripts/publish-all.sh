#!/usr/bin/env bash
# 一键发 4 个包到 npmjs.com
# 用法：
#   1) 确认已 npm login
#   2) bash scripts/publish-all.sh
# 或：
#   NPM_TOKEN=npm_xxx bash scripts/publish-all.sh

set -e

PACKAGES=(
  "z-frontend-common"
  "z-wf-frontend-component"
  "z-ctc-frontend-component"
  "z-task-frontend-component"
)

# build 每个包
echo "=== 1/2 build all packages ==="
for pkg in "${PACKAGES[@]}"; do
  echo "--- building $pkg ---"
  (cd "packages/$pkg" && npm run build)
done

# publish
echo ""
echo "=== 2/2 publish all packages ==="
for pkg in "${PACKAGES[@]}"; do
  echo "--- publishing $pkg ---"
  (cd "packages/$pkg" && npm publish --access public)
done

echo ""
echo "✓ 全部 publish 完成"
