#!/bin/bash

# KFC CLI 快速打包脚本

set -e

echo "🚀 开始打包 KFC CLI..."
echo ""

# 清理旧的构建
echo "🧹 清理旧文件..."
rm -rf dist release dist-release

# 构建 TypeScript
echo "📦 构建 TypeScript..."
npm run build

# 检查是否安装了 pkg
if ! command -v pkg &> /dev/null; then
    echo "📥 安装 pkg..."
    npm install -g pkg
fi

# 打包所有平台
echo "📦 打包可执行文件..."
npm run package:all

# 重命名文件为 kfc-* 格式
echo "📝 重命名文件..."
if [ -f "scripts/rename-release.sh" ]; then
    ./scripts/rename-release.sh
fi

# 创建发布目录
echo "📁 创建发布包..."
mkdir -p dist-release

# 复制可执行文件
cp release/kfc-* dist-release/ 2>/dev/null || true
cp release/*.exe dist-release/ 2>/dev/null || true

# 复制文档
cp README.md USER_MANUAL.md INSTALL.md BUILD.md dist-release/ 2>/dev/null || true

# 显示结果
echo ""
echo "✅ 打包完成！"
echo ""
echo "📦 可执行文件位置:"
ls -lh dist-release/ | grep -E "kfc-|\.exe" || ls -lh dist-release/
echo ""
echo "💡 提示:"
echo "  - 可执行文件在 dist-release/ 目录"
echo "  - 可以创建压缩包: cd dist-release && tar -czf ../kfc-cli-v1.0.0.tar.gz *"
echo "  - 或上传到 GitHub Releases"

