# 发布说明

## v1.0.0 (2025-11-28)

### 🎉 首次发布

KFC CLI 命令行工具正式发布！

### ✨ 主要功能

- **文件管理**
  - ✅ 上传文件（支持单文件和目录批量上传）
  - ✅ 下载文件
  - ✅ 查看文件列表（支持分页、搜索、筛选）
  
- **认证方式**
  - ✅ SSH 公钥认证（推荐，长期使用）
  - ✅ API Token 认证（简单快捷）
  
- **配置管理**
  - ✅ 全局配置和项目配置
  - ✅ 环境变量支持
  - ✅ 配置优先级管理

- **跨平台支持**
  - ✅ macOS (Intel & Apple Silicon)
  - ✅ Linux (x64 & ARM64)
  - ✅ Windows (x64)

### 📦 安装方式

#### 方式 1: 使用安装脚本（推荐）

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash

# Windows (PowerShell)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.ps1" | Invoke-Expression
```

#### 方式 2: 从源码构建

```bash
git clone https://github.com/Coldplay-now/kfc-cli.git
cd kfc-cli
npm install
npm run build
npm run package
./scripts/install-local.sh
```

#### 方式 3: 使用 npm

```bash
npm install -g kfc-cli
```

### 📚 文档

- [README.md](./README.md) - 项目介绍和快速开始
- [USER_MANUAL.md](./USER_MANUAL.md) - 完整使用手册
- [INSTALL.md](./INSTALL.md) - 详细安装指南
- [BUILD.md](./BUILD.md) - 打包和构建指南
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始指南

### 🚀 快速开始

```bash
# 初始化配置
kfc init

# 上传文件
kfc upload ./document.pdf --title "我的文档"

# 查看文件列表
kfc list

# 下载文件
kfc download 123
```

### 🔧 系统要求

- Node.js 18+ (如果从源码构建)
- macOS 10.15+ / Linux / Windows 10+

### 📝 命令列表

- `kfc init` - 初始化配置
- `kfc upload` - 上传文件
- `kfc list` - 查看文件列表
- `kfc download` - 下载文件
- `kfc config` - 配置管理
- `kfc auth` - 认证管理
- `kfc info` - 查看用户信息

### 🐛 已知问题

暂无

### 🙏 致谢

感谢所有贡献者和用户的支持！

---

**仓库地址**: https://github.com/Coldplay-now/kfc-cli

**问题反馈**: https://github.com/Coldplay-now/kfc-cli/issues

