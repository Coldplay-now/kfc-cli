# KFC CLI 安装脚本说明

## 脚本列表

### install-local.sh
**本地安装脚本**（推荐）

从本地构建的可执行文件安装，无需 GitHub Releases。

**使用方法：**
```bash
# 1. 先构建和打包
cd kfc-cli
npm install
npm run build
npm run package

# 2. 运行安装脚本
./scripts/install-local.sh
```

**特点：**
- ✅ 无需 GitHub Releases
- ✅ 无需网络连接（构建后）
- ✅ 自动检测平台
- ✅ 自动选择正确的可执行文件

---

### install.sh
**远程安装脚本**

从 GitHub Releases 下载并安装。

**使用方法：**
```bash
# 方式1: 使用默认仓库地址
curl -fsSL https://raw.githubusercontent.com/your-repo/kfc-cli/main/scripts/install.sh | bash

# 方式2: 设置自定义仓库地址
export KFC_CLI_REPO_URL="https://github.com/Coldplay-now/kfc-cli"
curl -fsSL https://raw.githubusercontent.com/your-repo/kfc-cli/main/scripts/install.sh | bash

# 方式3: 使用本地文件（无需下载）
KFC_CLI_LOCAL_PATH=./release/kfc-macos-x64 ./scripts/install.sh
```

**环境变量：**
- `KFC_CLI_REPO_URL` - GitHub 仓库地址
- `KFC_CLI_LOCAL_PATH` - 本地可执行文件路径（如果设置，将跳过下载）

---

### install.ps1
**Windows PowerShell 安装脚本**

从 GitHub Releases 下载并安装（Windows）。

**使用方法：**
```powershell
# 下载并运行
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-repo/kfc-cli/main/scripts/install.ps1" | Invoke-Expression
```

---

### package.sh
**一键打包脚本**

自动构建和打包所有平台。

**使用方法：**
```bash
./scripts/package.sh
```

**功能：**
- 清理旧文件
- 构建 TypeScript
- 打包所有平台
- 创建发布目录

---

## 推荐安装流程

### 开发者/本地使用

```bash
# 1. 克隆或下载项目
git clone https://github.com/Coldplay-now/kfc-cli.git
cd kfc-cli

# 2. 安装依赖
npm install

# 3. 构建和打包
npm run build
npm run package

# 4. 本地安装
./scripts/install-local.sh
```

### 用户安装（已发布到 GitHub Releases）

```bash
# 直接使用安装脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/kfc-cli/main/scripts/install.sh | bash
```

### 用户安装（本地文件）

```bash
# 如果有本地可执行文件
KFC_CLI_LOCAL_PATH=./kfc-macos-x64 ./scripts/install.sh
```

---

## 故障排除

### 问题：install.sh 返回 404

**原因：** GitHub Releases 中还没有发布此版本，或仓库地址不正确。

**解决方案：**
1. 使用本地安装脚本：`./scripts/install-local.sh`
2. 手动指定本地文件：`KFC_CLI_LOCAL_PATH=./release/kfc-macos-x64 ./scripts/install.sh`
3. 设置正确的仓库地址：`export KFC_CLI_REPO_URL="https://github.com/Coldplay-now/kfc-cli"`

### 问题：找不到可执行文件

**原因：** 还没有构建和打包。

**解决方案：**
```bash
cd kfc-cli
npm install
npm run build
npm run package
```

### 问题：权限不足

**解决方案：**
```bash
# macOS/Linux: 使用 sudo
sudo ./scripts/install-local.sh

# 或安装到用户目录
mkdir -p ~/.local/bin
cp release/kfc-macos-x64 ~/.local/bin/kfc
chmod +x ~/.local/bin/kfc
export PATH="$PATH:~/.local/bin"
```

