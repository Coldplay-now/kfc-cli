#!/bin/bash

# KFC CLI 使用 Token 创建 GitHub Release 脚本
# 适用于 CI/CD 或不想交互式登录的场景

set -e

VERSION=$1
GITHUB_TOKEN=$2

if [ -z "$VERSION" ]; then
    echo "用法: ./scripts/create-release-with-token.sh <version> <github_token>"
    echo "示例: ./scripts/create-release-with-token.sh v1.0.0 ghp_xxxxx"
    exit 1
fi

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 需要提供 GitHub Token"
    echo ""
    echo "获取 Token:"
    echo "  1. 访问 https://github.com/settings/tokens"
    echo "  2. 点击 'Generate new token (classic)'"
    echo "  3. 选择权限: repo (完整仓库访问权限)"
    echo "  4. 复制 Token"
    echo ""
    echo "使用方法:"
    echo "  export GITHUB_TOKEN=ghp_xxxxx"
    echo "  ./scripts/create-release-with-token.sh v1.0.0 \$GITHUB_TOKEN"
    exit 1
fi

echo "🚀 创建 GitHub Release: $VERSION"
echo ""

# 检查 release 目录
if [ ! -d "release" ]; then
    echo "❌ release 目录不存在"
    echo "请先打包: npm run package:all"
    exit 1
fi

# 检查文件是否存在
FILES=(
    "release/kfc-macos-x64"
    "release/kfc-macos-arm64"
    "release/kfc-linux-x64"
    "release/kfc-linux-arm64"
    "release/kfc-win-x64.exe"
)

MISSING_FILES=()
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ 缺少以下文件:"
    printf '  - %s\n' "${MISSING_FILES[@]}"
    echo ""
    echo "请先打包: npm run package:all"
    exit 1
fi

# 显示文件信息
echo "📦 准备上传的文件:"
for file in "${FILES[@]}"; do
    SIZE=$(ls -lh "$file" | awk '{print $5}')
    echo "  ✓ $(basename $file) ($SIZE)"
done
echo ""

# 读取 Release Notes
NOTES=""
if [ -f "RELEASE_NOTES.md" ]; then
    NOTES=$(cat RELEASE_NOTES.md)
else
    NOTES="KFC CLI $VERSION

## 主要功能
- ✅ 文件上传、下载、列表查看
- ✅ SSH 和 API Token 双认证
- ✅ 跨平台支持（macOS、Linux、Windows）

## 安装方式

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
\`\`\`

详细文档请查看 [README.md](https://github.com/Coldplay-now/kfc-cli#readme)"
fi

# 使用 GitHub API 创建 Release
echo "📤 创建 GitHub Release..."

# 先创建 Release（获取 upload_url）
RELEASE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Coldplay-now/kfc-cli/releases \
  -d "{
    \"tag_name\": \"$VERSION\",
    \"name\": \"$VERSION\",
    \"body\": $(echo "$NOTES" | jq -Rs .),
    \"draft\": false,
    \"prerelease\": false
  }")

# 检查是否创建成功
if echo "$RELEASE_RESPONSE" | grep -q "upload_url"; then
    UPLOAD_URL=$(echo "$RELEASE_RESPONSE" | jq -r '.upload_url' | sed 's/{?name,label}//')
    RELEASE_ID=$(echo "$RELEASE_RESPONSE" | jq -r '.id')
    
    echo "✅ Release 创建成功！"
    echo ""
    
    # 上传文件
    echo "📤 上传文件..."
    for file in "${FILES[@]}"; do
        FILENAME=$(basename "$file")
        echo "  上传: $FILENAME"
        
        curl -s -X POST \
          -H "Authorization: token $GITHUB_TOKEN" \
          -H "Accept: application/vnd.github.v3+json" \
          -H "Content-Type: application/octet-stream" \
          --data-binary "@$file" \
          "${UPLOAD_URL}?name=$FILENAME" > /dev/null
        
        if [ $? -eq 0 ]; then
            echo "    ✓ $FILENAME 上传成功"
        else
            echo "    ✗ $FILENAME 上传失败"
        fi
    done
    
    echo ""
    echo "✅ Release 创建并上传完成！"
    echo ""
    echo "🔗 访问 Release:"
    echo "   https://github.com/Coldplay-now/kfc-cli/releases/tag/$VERSION"
    echo ""
    echo "🧪 测试安装脚本:"
    echo "   curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash"
else
    ERROR_MSG=$(echo "$RELEASE_RESPONSE" | jq -r '.message // .errors[0].message // "未知错误"')
    echo "❌ Release 创建失败: $ERROR_MSG"
    echo ""
    echo "可能的原因:"
    echo "  1. Token 权限不足（需要 repo 权限）"
    echo "  2. Release 已存在，请先删除: gh release delete $VERSION"
    echo "  3. 网络问题，请重试"
    exit 1
fi

