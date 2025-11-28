# KFC CLI

KFC 文档管理平台命令行工具

## 特性

- 🚀 跨平台支持（macOS、Linux、Windows）
- 🔐 双认证方式（SSH 公钥 + API Token）
- 🎯 智能引导（首次使用自动配置）
- 📦 简单易用（命令行操作，支持脚本集成）

## 快速开始

### 安装

```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

### 初始化

```bash
# 首次使用，初始化配置
npm run dev init
```

### 基本使用

```bash
# 上传文件
npm run dev upload ./file.pdf --title "标题" --tags "标签1,标签2"

# 查看文件列表
npm run dev list

# 下载文件
npm run dev download 123

# 查看用户信息
npm run dev info
```

## 文档

- 📖 [完整使用手册](./USER_MANUAL.md) - 详细的使用说明和示例
- 📋 [设计文档](../docs/PRD/kfc-cli-design.md) - 技术设计和架构说明

## 命令列表

| 命令 | 描述 |
|------|------|
| `init` | 初始化配置（首次使用引导） |
| `upload` | 上传文件或目录 |
| `list` | 查看文件列表 |
| `download` | 下载文件 |
| `config` | 管理配置 |
| `auth` | 认证管理 |
| `info` | 查看用户信息 |

## 开发

```bash
# 开发模式（使用 tsx）
npm run dev <command>

# 构建
npm run build

# 运行构建后的版本
npm start <command>
```

## 打包

### 快速打包

```bash
# 使用打包脚本（推荐）
./scripts/package.sh

# 或手动打包
npm run build
npm run package:all
```

打包后的文件在 `release/` 目录。

### 打包选项

- `npm run package` - 打包当前平台
- `npm run package:all` - 打包所有平台（macOS、Linux、Windows）
- `npm run pack` - 创建 npm 包（.tgz 文件）

详细说明请查看 [BUILD.md](./BUILD.md)

## 环境变量

```bash
# 设置 API Token
export KFC_TOKEN="kfc_cli_xxx..."

# 设置服务器地址
export KFC_API_URL="http://47.93.26.241"

# 启用调试模式
export KFC_DEBUG=true
```

## 许可证

MIT

---

更多信息请查看 [使用手册](./USER_MANUAL.md)

