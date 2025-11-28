# 安装方式总结

## 🚀 快速安装（推荐）

### 一键安装脚本

**macOS/Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
```

**Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.ps1" | Invoke-Expression
```

> ⚠️ **注意**: 此方式需要先在 [GitHub Releases](https://github.com/Coldplay-now/kfc-cli/releases) 中发布可执行文件。

---

## 📦 其他安装方式

### 方式 1: 从 GitHub Releases 直接下载

访问 [GitHub Releases](https://github.com/Coldplay-now/kfc-cli/releases)，下载对应平台的可执行文件。

### 方式 2: 从源码构建

```bash
git clone https://github.com/Coldplay-now/kfc-cli.git
cd kfc-cli
npm install
npm run build
npm run package
./scripts/install-local.sh
```

### 方式 3: 使用 npm

```bash
npm install -g kfc-cli
```

---

## 📚 详细文档

- [完整安装指南](./INSTALL.md)
- [快速开始](./QUICKSTART.md)
- [使用手册](./USER_MANUAL.md)

