#!/usr/bin/env bash
# 一键升级 4 个包版本号 + git tag
# 用法：
#   bash scripts/release.sh patch   # 0.1.0 → 0.1.1
#   bash scripts/release.sh minor   # 0.1.0 → 0.2.0
#   bash scripts/release.sh major   # 0.1.0 → 1.0.0

set -e

LEVEL=${1:-patch}
PACKAGES=(
  "z-frontend-common"
  "z-wf-frontend-component"
  "z-ctc-frontend-component"
  "z-task-frontend-component"
)

echo "=== bump $LEVEL for all packages ==="
for pkg in "${PACKAGES[@]}"; do
  echo "--- $pkg ---"
  (cd "packages/$pkg" && npm version "$LEVEL" --no-git-tag-version)
done

echo ""
echo "=== git commit + tag ==="
git add packages/*/package.json packages/*/package-lock.json
NEW_VER=$(grep '"version"' "packages/z-frontend-common/package.json" | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
git commit -m "release: v$NEW_VER"
git tag "v$NEW_VER"
echo ""
echo "✓ 升级到 v$NEW_VER"
echo "下一步：git push origin main --tags → 触发 GitHub Actions 自动 publish"
