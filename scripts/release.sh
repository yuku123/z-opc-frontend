#!/usr/bin/env bash
# 本地一键升级所有公开子包版本号 + git commit + tag
# 推荐：直接用 GitHub Actions → release workflow（无需本地 push）
#
# 用法：
#   bash scripts/release.sh patch   # 0.1.0 → 0.1.1
#   bash scripts/release.sh minor   # 0.1.0 → 0.2.0
#   bash scripts/release.sh major   # 0.1.0 → 1.0.0

set -euo pipefail

LEVEL=${1:-patch}

if [[ "$LEVEL" != "patch" && "$LEVEL" != "minor" && "$LEVEL" != "major" ]]; then
  echo "❌ LEVEL 必须是 patch / minor / major 之一，got: $LEVEL"
  exit 1
fi

# 收集所有 public workspace 包
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
      .sort()
      .join('\n')
  );
")

if [ -z "$PACKAGES" ]; then
  echo "❌ 没找到任何公开包"
  exit 1
fi

echo "=== 目标版本：bump $LEVEL ==="
echo "涉及的包："
echo "$PACKAGES" | sed 's/^/  - /'
echo ""

read -p "确认升级以上所有公开包？ [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "已取消"
  exit 0
fi

echo ""
echo "=== bump $LEVEL for all public packages ==="
for pkg in $PACKAGES; do
  echo "--- $pkg ---"
  (cd "$pkg" && npm version "$LEVEL" --no-git-tag-version)
done

echo ""
echo "=== git commit + tag ==="
git add packages/*/package.json packages/*/package-lock.json package-lock.json 2>/dev/null || true

# 取任意一个包的版本号作为统一版本（所有包是 lockstep 一起 bump 的）
NEW_VER=$(node -e "
  const fs=require('fs'),path=require('path');
  const vers=fs.readdirSync('packages',{withFileTypes:true})
    .filter(d=>d.isDirectory())
    .map(d=>require(path.resolve('packages',d.name,'package.json')).version)
    .filter(Boolean);
  process.stdout.write(vers[0]||'0.0.0');
")

if git diff --cached --quiet; then
  echo "⚠️ 没有 staged 改动，可能版本号已是目标值"
else
  git commit -m "release: v$NEW_VER"
  git tag "v$NEW_VER"
  echo ""
  echo "✓ 升级到 v$NEW_VER"
  echo ""
  echo "下一步（二选一）："
  echo "  - 推荐：直接去 GitHub Actions 跑 release workflow（无需本地 push）"
  echo "  - 或本地推送："
  echo "      git push origin main --tags"
  echo "    推送 tag 后 publish.yml 会自动 build + publish 全部公开包"
fi