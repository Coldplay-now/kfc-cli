# KFC CLI 安装指南

本文档介绍如何安装和使用 KFC CLI 工具。

## 安装方式

### 方式 1: 使用预编译可执行文件（推荐）

#### macOS

```bash
# Intel 芯片
curl -L https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-macos-x64 -o /usr/local/bin/kfc
chmod +x /usr/local/bin/kfc

# Apple Silicon (M1/M2)
curl -L https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-macos-arm64 -o /usr/local/bin/kfc
chmod +x /usr/local/bin/kfc
```

#### Linux

```bash
# x64
curl -L https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-linux-x64 -o /usr/local/bin/kfc
chmod +x /usr/local/bin/kfc

# ARM64
curl -L https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-linux-arm64 -o /usr/local/bin/kfc
chmod +x /usr/local/bin/kfc
```

#### Windows

1. 下载 `kfc-win-x64.exe`
2. 重命名为 `kfc.exe`
3. 将文件移动到 `C:\Windows\System32` 或添加到 PATH

或使用 PowerShell：

```powershell
# 下载到当前目录
Invoke-WebRequest -Uri "https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-win-x64.exe" -OutFile "kfc.exe"

# 移动到 PATH 目录
Move-Item kfc.exe $env:USERPROFILE\AppData\Local\Microsoft\WindowsApps\kfc.exe
```

### 方式 2: 使用 npm 全局安装

```bash
# 从本地安装
npm install -g ./kfc-cli

# 或从 npm registry（如果已发布）
npm install -g kfc-cli
```

### 方式 3: 从源码构建

```bash
# 克隆仓库
git clone https://github.com/Coldplay-now/kfc-cli.git
cd kfc-cli

# 安装依赖
npm install

# 构建
npm run build

# 全局链接
npm link
```

### 方式 4: 使用安装脚本

#### 从 GitHub Releases 安装（需要先发布）

```bash
# 设置仓库地址（如果与默认不同）
export KFC_CLI_REPO_URL="https://github.com/Coldplay-now/kfc-cli"

# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
```

#### 本地安装（推荐，无需 GitHub）

```bash
# 1. 先构建和打包
cd kfc-cli
npm install
npm run build
npm run package

# 2. 使用本地安装脚本
./scripts/install-local.sh
```

或手动指定本地文件：

```bash
# 从本地文件安装
KFC_CLI_LOCAL_PATH=./release/kfc-macos-x64 ./scripts/install.sh
```

#### Windows

```powershell
# 下载并运行安装脚本
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.ps1" -OutFile install.ps1
.\install.ps1
```

## 验证安装

安装完成后，验证是否成功：

```bash
kfc --version
```

应该输出：

```
1.0.0
```

## 快速开始

1. **初始化配置**

```bash
kfc init
```

2. **上传文件**

```bash
kfc upload ./document.pdf --title "我的文档"
```

3. **查看帮助**

```bash
kfc --help
```

## 卸载

### 方式 1: 删除可执行文件

```bash
# macOS/Linux
rm /usr/local/bin/kfc

# Windows
# 删除 kfc.exe 文件
```

### 方式 2: npm 卸载

```bash
npm uninstall -g kfc-cli
```

## 故障排除

### 问题：命令未找到

**macOS/Linux:**
```bash
# 检查 PATH
echo $PATH

# 手动添加到 PATH（临时）
export PATH="$PATH:/usr/local/bin"

# 永久添加到 PATH（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export PATH="$PATH:/usr/local/bin"' >> ~/.bashrc
source ~/.bashrc
```

**Windows:**
1. 打开"系统属性" → "环境变量"
2. 在"系统变量"中找到 `Path`
3. 添加 kfc.exe 所在目录

### 问题：权限不足

```bash
# macOS/Linux: 使用 sudo
sudo chmod +x /usr/local/bin/kfc

# 或安装到用户目录
mkdir -p ~/.local/bin
cp kfc ~/.local/bin/
export PATH="$PATH:~/.local/bin"
```

## 更新

### 使用可执行文件

重新下载最新版本的可执行文件并替换旧文件。

### 使用 npm

```bash
npm update -g kfc-cli
```

## 系统要求

- **macOS**: 10.15+ (Intel) 或 11.0+ (Apple Silicon)
- **Linux**: 大多数现代发行版（Ubuntu 18.04+, Debian 10+, CentOS 7+）
- **Windows**: Windows 10+ 或 Windows Server 2016+

## 获取帮助

- 查看使用手册: `kfc --help`
- 查看完整文档: [USER_MANUAL.md](./USER_MANUAL.md)
- 报告问题: [GitHub Issues](https://github.com/Coldplay-now/kfc-cli/issues)

