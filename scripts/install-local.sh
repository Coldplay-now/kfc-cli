#!/bin/bash

# KFC CLI 本地安装脚本
# 从本地构建的可执行文件安装

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RELEASE_DIR="$PROJECT_DIR/release"

# 检测操作系统和架构
detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"
    
    case "$OS" in
        Linux*)
            PLATFORM="linux"
            ;;
        Darwin*)
            PLATFORM="macos"
            ;;
        *)
            echo "❌ 不支持的操作系统: $OS"
            exit 1
            ;;
    esac
    
    case "$ARCH" in
        x86_64)
            ARCH="x64"
            ;;
        arm64|aarch64)
            ARCH="arm64"
            ;;
        *)
            echo "❌ 不支持的架构: $ARCH"
            exit 1
            ;;
    esac
    
    BINARY_NAME="kfc-${PLATFORM}-${ARCH}"
}

# 检查可执行文件是否存在
check_binary() {
    BINARY_PATH="$RELEASE_DIR/$BINARY_NAME"
    
    if [ ! -f "$BINARY_PATH" ]; then
        echo "❌ 未找到可执行文件: $BINARY_PATH"
        echo ""
        echo "请先构建项目:"
        echo "  cd $PROJECT_DIR"
        echo "  npm install"
        echo "  npm run build"
        echo "  npm run package"
        exit 1
    fi
    
    echo "$BINARY_PATH"
}

# 安装二进制文件
install_binary() {
    BINARY_PATH=$1
    INSTALL_DIR="/usr/local/bin"
    
    # 检查是否有写入权限
    if [ ! -w "$INSTALL_DIR" ]; then
        echo "⚠️  需要管理员权限来安装到 $INSTALL_DIR"
        echo "请输入密码:"
        sudo mkdir -p "$INSTALL_DIR"
        sudo cp "$BINARY_PATH" "$INSTALL_DIR/kfc"
        sudo chmod +x "$INSTALL_DIR/kfc"
    else
        mkdir -p "$INSTALL_DIR"
        cp "$BINARY_PATH" "$INSTALL_DIR/kfc"
        chmod +x "$INSTALL_DIR/kfc"
    fi
    
    echo "✅ 安装成功！"
}

# 验证安装
verify_installation() {
    if command -v kfc >/dev/null 2>&1; then
        VERSION_OUTPUT=$(kfc --version 2>&1 || echo "unknown")
        echo "✅ KFC CLI 已安装: $VERSION_OUTPUT"
        echo ""
        echo "运行 'kfc --help' 查看使用说明"
    else
        echo "⚠️  安装可能失败，请检查 PATH 设置"
        echo "   确保 $INSTALL_DIR 在 PATH 中"
    fi
}

# 主函数
main() {
    echo "🚀 KFC CLI 本地安装程序"
    echo ""
    
    detect_platform
    echo "📍 检测到平台: ${PLATFORM}-${ARCH}"
    echo ""
    
    BINARY_PATH=$(check_binary)
    echo "📦 找到可执行文件: $BINARY_PATH"
    echo ""
    
    install_binary "$BINARY_PATH"
    verify_installation
}

main

