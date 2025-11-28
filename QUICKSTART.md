# KFC CLI 快速开始

## 快速打包

### 一键打包所有平台

```bash
./scripts/package.sh
```

打包后的文件在 `release/` 目录：
- `kfc-macos-x64` - macOS Intel
- `kfc-macos-arm64` - macOS Apple Silicon  
- `kfc-linux-x64` - Linux x64
- `kfc-linux-arm64` - Linux ARM64
- `kfc-win-x64.exe` - Windows x64

### 手动打包

```bash
# 1. 安装依赖
npm install

# 2. 构建
npm run build

# 3. 打包（需要先安装 pkg）
npm install -g pkg
npm run package:all
```

## 快速安装

### 方式 1: 本地安装（推荐，无需 GitHub）

**macOS/Linux:**
```bash
# 1. 构建和打包
cd kfc-cli
npm install
npm run build
npm run package

# 2. 安装
./scripts/install-local.sh
```

### 方式 2: 使用安装脚本（需要 GitHub Releases）

**macOS/Linux:**
```bash
# 设置仓库地址（如果与默认不同）
export KFC_CLI_REPO_URL="https://github.com/Coldplay-now/kfc-cli"

# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/kfc-cli/main/scripts/install.sh | bash
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-repo/kfc-cli/main/scripts/install.ps1" | Invoke-Expression
```

### 方式 2: 直接下载可执行文件

1. 从 [GitHub Releases](https://github.com/Coldplay-now/kfc-cli/releases) 下载对应平台的文件
2. 重命名为 `kfc` (macOS/Linux) 或 `kfc.exe` (Windows)
3. 移动到 PATH 目录或添加到 PATH

**macOS/Linux:**
```bash
# 下载
curl -L https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-macos-x64 -o kfc

# 安装
chmod +x kfc
sudo mv kfc /usr/local/bin/
```

**Windows:**
```powershell
# 下载
Invoke-WebRequest -Uri "https://github.com/Coldplay-now/kfc-cli/releases/download/v1.0.0/kfc-win-x64.exe" -OutFile "kfc.exe"

# 移动到 PATH
Move-Item kfc.exe $env:USERPROFILE\AppData\Local\Microsoft\WindowsApps\kfc.exe
```

### 方式 3: 使用 npm

```bash
# 从本地安装
npm install -g ./kfc-cli

# 或从 npm registry（如果已发布）
npm install -g kfc-cli
```

## 验证安装

```bash
kfc --version
```

应该输出版本号，例如：`1.0.0`

## 首次使用

```bash
# 初始化配置
kfc init

# 上传文件
kfc upload ./document.pdf --title "我的文档"

# 查看文件列表
kfc list

# 查看帮助
kfc --help
```

## 更多信息

- 📖 [完整使用手册](./USER_MANUAL.md)
- 🔧 [安装指南](./INSTALL.md)
- 📦 [打包指南](./BUILD.md)

