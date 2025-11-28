#!/bin/bash

# KFC CLI 安装脚本
# 适用于 macOS 和 Linux

set -e

# 配置：如果从 GitHub 安装，请设置正确的仓库地址
# 或者使用本地安装脚本: ./scripts/install-local.sh

VERSION="1.0.0"
# 请替换为实际的 GitHub 仓库地址
REPO_URL="${KFC_CLI_REPO_URL:-https://github.com/Coldplay-now/kfc-cli}"
RELEASE_URL="${REPO_URL}/releases/download/v${VERSION}"

# 如果设置了本地路径，使用本地安装
if [ -n "$KFC_CLI_LOCAL_PATH" ]; then
    echo "📦 使用本地路径安装: $KFC_CLI_LOCAL_PATH"
    if [ -f "$KFC_CLI_LOCAL_PATH" ]; then
        INSTALL_DIR="/usr/local/bin"
        if [ ! -w "$INSTALL_DIR" ]; then
            sudo cp "$KFC_CLI_LOCAL_PATH" "$INSTALL_DIR/kfc"
            sudo chmod +x "$INSTALL_DIR/kfc"
        else
            cp "$KFC_CLI_LOCAL_PATH" "$INSTALL_DIR/kfc"
            chmod +x "$INSTALL_DIR/kfc"
        fi
        echo "✅ 安装成功！"
        exit 0
    else
        echo "❌ 文件不存在: $KFC_CLI_LOCAL_PATH"
        exit 1
    fi
fi

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

# 下载二进制文件
download_binary() {
    echo "📥 下载 KFC CLI v${VERSION}..."
    echo "   从: ${RELEASE_URL}/${BINARY_NAME}"
    
    DOWNLOAD_URL="${RELEASE_URL}/${BINARY_NAME}"
    TEMP_FILE=$(mktemp)
    
    if command -v curl >/dev/null 2>&1; then
        if ! curl -L -f -o "$TEMP_FILE" "$DOWNLOAD_URL" 2>/dev/null; then
            echo ""
            echo "❌ 下载失败！可能的原因："
            echo "   1. GitHub Releases 中还没有发布此版本"
            echo "   2. 仓库地址不正确"
            echo ""
            echo "💡 解决方案："
            echo "   方式1: 使用本地安装脚本"
            echo "     cd kfc-cli && ./scripts/install-local.sh"
            echo ""
            echo "   方式2: 手动指定本地文件路径"
            echo "     KFC_CLI_LOCAL_PATH=./release/kfc-macos-x64 ./scripts/install.sh"
            echo ""
            echo "   方式3: 设置正确的仓库地址"
            echo "     KFC_CLI_REPO_URL=https://github.com/Coldplay-now/kfc-cli ./scripts/install.sh"
            exit 1
        fi
    elif command -v wget >/dev/null 2>&1; then
        if ! wget -O "$TEMP_FILE" "$DOWNLOAD_URL" 2>/dev/null; then
            echo ""
            echo "❌ 下载失败！请参考上面的解决方案"
            exit 1
        fi
    else
        echo "❌ 需要 curl 或 wget 来下载文件"
        exit 1
    fi
    
    echo "$TEMP_FILE"
}

# 安装二进制文件
install_binary() {
    TEMP_FILE=$1
    INSTALL_DIR="/usr/local/bin"
    
    # 检查是否有写入权限
    if [ ! -w "$INSTALL_DIR" ]; then
        echo "⚠️  需要管理员权限来安装到 $INSTALL_DIR"
        echo "请输入密码:"
        sudo mkdir -p "$INSTALL_DIR"
        sudo mv "$TEMP_FILE" "$INSTALL_DIR/kfc"
        sudo chmod +x "$INSTALL_DIR/kfc"
    else
        mkdir -p "$INSTALL_DIR"
        mv "$TEMP_FILE" "$INSTALL_DIR/kfc"
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
    fi
}

# 主函数
main() {
    echo "🚀 KFC CLI 安装程序"
    echo ""
    
    detect_platform
    echo "📍 检测到平台: ${PLATFORM}-${ARCH}"
    echo ""
    
    TEMP_FILE=$(download_binary)
    install_binary "$TEMP_FILE"
    verify_installation
}

main

