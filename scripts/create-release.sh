#!/bin/bash

# KFC CLI 创建 GitHub Release 脚本

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "用法: ./scripts/create-release.sh <version>"
    echo "示例: ./scripts/create-release.sh v1.0.0"
    exit 1
fi

echo "🚀 创建 GitHub Release: $VERSION"
echo ""

# 检查是否已登录
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI 未安装"
    echo ""
    echo "请先安装 GitHub CLI:"
    echo "  macOS: brew install gh"
    echo "  Linux: 查看 https://cli.github.com/"
    echo "  Windows: 从 https://cli.github.com/ 下载"
    exit 1
fi

if ! gh auth status &>/dev/null; then
    echo "❌ 请先登录 GitHub CLI:"
    echo "   gh auth login"
    exit 1
fi

# 检查 release 目录
if [ ! -d "release" ]; then
    echo "❌ release 目录不存在"
    echo ""
    echo "请先打包:"
    echo "  npm run package:all"
    exit 1
fi

# 检查文件是否存在（pkg 生成的文件名格式）
FILES=(
    "release/kfc-cli-macos-x64"
    "release/kfc-cli-macos-arm64"
    "release/kfc-cli-linux-x64"
    "release/kfc-cli-linux-arm64"
    "release/kfc-cli-win-x64.exe"
)

# 如果文件不存在，尝试不带 kfc-cli- 前缀的名称
if [ ! -f "${FILES[0]}" ]; then
    FILES=(
        "release/kfc-macos-x64"
        "release/kfc-macos-arm64"
        "release/kfc-linux-x64"
        "release/kfc-linux-arm64"
        "release/kfc-win-x64.exe"
    )
fi

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

# 创建 Release
echo "📤 上传文件到 GitHub Releases..."
if gh release create "$VERSION" \
    "${FILES[@]}" \
    --title "$VERSION" \
    --notes "$NOTES"; then
    echo ""
    echo "✅ Release 创建成功！"
    echo ""
    echo "🔗 访问 Release:"
    echo "   https://github.com/Coldplay-now/kfc-cli/releases/tag/$VERSION"
    echo ""
    echo "🧪 测试安装脚本:"
    echo "   curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash"
else
    echo ""
    echo "❌ Release 创建失败"
    echo ""
    echo "可能的原因:"
    echo "  1. Release 已存在，请先删除: gh release delete $VERSION"
    echo "  2. 网络问题，请重试"
    echo "  3. 权限不足，请检查 GitHub token"
    exit 1
fi

