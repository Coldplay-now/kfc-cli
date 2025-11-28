# KFC CLI 使用手册

## 目录

- [简介](#简介)
- [安装](#安装)
- [快速开始](#快速开始)
- [命令详解](#命令详解)
- [配置管理](#配置管理)
- [认证方式](#认证方式)
- [使用示例](#使用示例)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

---

## 简介

KFC CLI 是 KFC 文档管理平台的命令行工具，支持跨平台使用（macOS、Linux、Windows），提供文件上传、下载、列表查看等功能。

### 主要特性

- 🚀 **跨平台支持**：macOS、Linux、Windows
- 🔐 **双认证方式**：SSH 公钥 + API Token
- 🎯 **智能引导**：首次使用自动配置
- 📦 **简单易用**：命令行操作，支持脚本集成

---

## 安装

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装步骤

1. **克隆或下载项目**

```bash
cd /path/to/kfc-cli
```

2. **安装依赖**

```bash
npm install
```

3. **构建项目**

```bash
npm run build
```

4. **（可选）全局安装**

```bash
# 方式1：使用 npm link
npm link

# 方式2：添加到 PATH
export PATH="$PATH:/path/to/kfc-cli/dist"
```

### 开发模式

开发模式下可以直接使用 `tsx` 运行：

```bash
npm run dev <command>
```

---

## 快速开始

### 1. 初始化配置

首次使用需要初始化配置：

```bash
npm run dev init
```

或使用构建后的版本：

```bash
kfc init
```

初始化流程会引导您：
- 选择认证方式（SSH 或 API Token）
- 配置认证信息
- 验证连接

### 2. 上传文件

```bash
# 基本上传
kfc upload ./document.pdf

# 带标题和标签
kfc upload ./document.pdf --title "项目文档" --tags "项目,重要"

# 上传整个目录
kfc upload ./docs/ -r
```

### 3. 查看文件列表

```bash
# 查看文件列表
kfc list

# 搜索文件
kfc list --search "设计"

# JSON 格式输出
kfc list --json
```

### 4. 下载文件

```bash
# 下载文件（使用文件 ID）
kfc download 123

# 指定保存路径
kfc download 123 -o ./downloads/
```

---

## 命令详解

### `kfc init`

初始化配置，首次使用引导。

```bash
kfc init
```

**功能：**
- 检测操作系统和 Shell 类型
- 选择认证方式（SSH 或 API Token）
- 配置认证信息
- 验证连接并保存配置

**示例：**

```bash
$ kfc init

🎉 欢迎使用 KFC CLI！

📍 系统信息:
操作系统: macOS
Shell: zsh

请选择认证方式:
[1] 🔑 SSH 公钥认证
[2] 🎫 API Token 认证
```

---

### `kfc upload`

上传文件或目录到平台。

```bash
kfc upload <file> [options]
```

**参数：**
- `<file>` - 文件或文件夹路径（必需）

**选项：**
- `-t, --title <title>` - 文件标题
- `-d, --desc <description>` - 文件描述
- `--tags <tags>` - 标签（逗号分隔）
- `-r, --recursive` - 递归上传文件夹

**示例：**

```bash
# 上传单个文件
kfc upload ./report.pdf

# 上传带元数据
kfc upload ./report.pdf \
  --title "月度报告" \
  --desc "2025年11月月度报告" \
  --tags "报告,月度,重要"

# 上传整个目录
kfc upload ./documents/ -r

# 上传目录并设置默认标签
kfc upload ./docs/ -r --tags "文档,项目"
```

**输出示例：**

```
→ 上传文件: report.pdf
上传进度: 100%
✓ 上传成功！
ℹ 文件 ID: 123
ℹ 文件名: report.pdf
ℹ 大小: 2.3 MB
ℹ 创建时间: 2025-11-28T10:00:00
```

---

### `kfc list`

查看文件列表。

```bash
kfc list [options]
```

**选项：**
- `--page <number>` - 页码（默认：1）
- `--page-size <number>` - 每页数量（默认：20）
- `-s, --search <keyword>` - 搜索关键词
- `--type <type>` - 文件类型筛选
- `--json` - 以 JSON 格式输出

**示例：**

```bash
# 查看第一页
kfc list

# 查看第二页
kfc list --page 2

# 搜索文件
kfc list --search "设计"

# 筛选 PDF 文件
kfc list --type pdf

# JSON 格式输出
kfc list --json
```

**输出示例：**

```
文件列表 (第 1/3 页，共 50 个文件)

[123] 月度报告
    文件名: report.pdf
    大小: 2.3 MB
    描述: 2025年11月月度报告
    创建时间: 2025-11-28T10:00:00

[124] 设计文档
    文件名: design.pdf
    大小: 1.5 MB
    创建时间: 2025-11-27T09:00:00

使用 --page 2 查看下一页
```

---

### `kfc download`

下载文件。

```bash
kfc download <file-id> [options]
```

**参数：**
- `<file-id>` - 文件 ID（必需）

**选项：**
- `-o, --output <path>` - 保存路径（默认：当前目录）

**示例：**

```bash
# 下载到当前目录
kfc download 123

# 下载到指定目录
kfc download 123 -o ./downloads/

# 下载到指定文件
kfc download 123 -o ./my-file.pdf
```

**输出示例：**

```
→ 获取文件信息...
→ 下载文件: report.pdf
✓ 下载完成！
ℹ 文件保存到: ./report.pdf
ℹ 大小: 2.3 MB
```

---

### `kfc config`

管理配置。

```bash
kfc config <action> [key] [value]
```

**操作：**
- `list` - 显示所有配置
- `get <key>` - 获取配置项
- `set <key> <value>` - 设置配置项
- `reset` - 重置配置

**示例：**

```bash
# 查看所有配置
kfc config list

# 获取邮箱配置
kfc config get email

# 设置服务器地址
kfc config set server http://example.com

# 重置配置
kfc config reset
```

**输出示例：**

```
当前配置:

全局配置: /Users/username/.kfc/config.json
项目配置: /path/to/project/.kfc/config.json

  email: user@example.com
  server: http://47.93.26.241
  auth_method: token
  api_token: kfc_cli_xxx...
```

---

### `kfc auth`

认证管理。

```bash
kfc auth [action]
```

**操作：**
- `status` - 查看认证状态（默认）
- `switch` - 切换认证方式
- `refresh` - 刷新 Token（提示）
- `logout` - 清除认证信息

**示例：**

```bash
# 查看认证状态
kfc auth status

# 切换认证方式
kfc auth switch

# 清除认证信息
kfc auth logout
```

**输出示例：**

```
认证状态

✓ 已认证
ℹ 用户名: username
ℹ 邮箱: user@example.com
ℹ 角色: user

认证方式: API Token
Token: kfc_cli_xxx...
```

---

### `kfc info`

查看当前用户信息（快捷命令）。

```bash
kfc info
```

**示例：**

```bash
$ kfc info

用户信息
ℹ 用户名: username
ℹ 邮箱: user@example.com
ℹ 角色: user
```

---

## 配置管理

### 配置优先级

配置按以下优先级生效（高 → 低）：

1. **命令行参数**
   ```bash
   kfc upload --token=xxx
   ```

2. **环境变量**
   ```bash
   export KFC_TOKEN="kfc_cli_xxx"
   export KFC_API_URL="http://47.93.26.241"
   ```

3. **项目配置** (`./.kfc/config.json`)
   ```json
   {
     "email": "project@example.com",
     "default_tags": ["项目文档"]
   }
   ```

4. **全局配置** (`~/.kfc/config.json`)
   ```json
   {
     "email": "user@example.com",
     "server": "http://47.93.26.241",
     "auth_method": "token"
   }
   ```

5. **默认值**
   - `server`: `http://47.93.26.241`
   - `auth_method`: `token`

### 配置文件位置

| 平台 | 全局配置 | 项目配置 |
|------|----------|----------|
| macOS/Linux | `~/.kfc/config.json` | `./.kfc/config.json` |
| Windows | `%USERPROFILE%\.kfc\config.json` | `.\\.kfc\\config.json` |

### 配置文件结构

```json
{
  "email": "user@example.com",
  "username": "myname",
  "auth_method": "token",
  "ssh_key_path": "~/.ssh/id_ed25519",
  "api_token": "kfc_cli_xxx...",
  "default_tags": ["我的文档"],
  "server": "http://47.93.26.241",
  "created_at": "2025-11-28",
  "last_used": "2025-11-28"
}
```

### 环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `KFC_TOKEN` | API Token | `kfc_cli_xxx...` |
| `KFC_EMAIL` | 用户邮箱 | `user@example.com` |
| `KFC_AUTH_METHOD` | 认证方式 | `ssh` / `token` |
| `KFC_SSH_KEY` | SSH 密钥路径 | `~/.ssh/id_ed25519` |
| `KFC_API_URL` | 服务器地址 | `http://47.93.26.241` |
| `KFC_DEBUG` | 调试模式 | `true` / `false` |

---

## 认证方式

### API Token 认证

**适用场景：**
- 临时使用
- 新手用户
- CI/CD 集成

**特点：**
- 简单快捷
- 有效期：CLI Token 90 天，API Token 30 天
- 需要邮箱验证码

**使用流程：**

1. 运行 `kfc init` 选择 Token 认证
2. 输入邮箱地址
3. 输入收到的验证码
4. 选择 Token 类型（CLI 或 API）
5. 输入 Token 名称
6. Token 自动保存到配置

**手动获取 Token：**

1. 访问 Web 界面：http://47.93.26.241
2. 登录后进入「个人设置」
3. 找到「API Token 管理」
4. 创建新的 Token
5. 复制 Token 并设置环境变量：

```bash
export KFC_TOKEN="kfc_cli_xxx..."
```

### SSH 公钥认证

**适用场景：**
- 长期使用
- 开发者
- 需要更高安全性

**特点：**
- 配置一次，长期使用
- 无需定期更新
- 更安全

**使用流程：**

1. 运行 `kfc init` 选择 SSH 认证
2. 检测现有 SSH 密钥或生成新密钥
3. 复制公钥到剪贴板
4. 在 Web 界面添加 SSH 公钥
5. 验证连接

**自动生成 SSH 密钥：**

```bash
# 工具会自动生成，或手动生成：
ssh-keygen -t ed25519 -C "user@example.com" -f ~/.ssh/id_ed25519
```

**手动添加 SSH 公钥：**

1. 查看公钥：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. 访问 Web 界面：http://47.93.26.241
3. 进入「个人设置」→「SSH 公钥管理」
4. 点击「添加公钥」
5. 粘贴公钥内容并保存

---

## 使用示例

### 示例 1：上传项目文档

```bash
# 设置环境变量
export KFC_TOKEN="kfc_cli_xxx..."
export KFC_API_URL="http://47.93.26.241"

# 上传设计文档
kfc upload ./docs/design.md \
  --title "产品设计文档" \
  --desc "2025年产品设计文档" \
  --tags "设计,产品,重要"

# 上传整个文档目录
kfc upload ./docs/ -r --tags "项目文档"
```

### 示例 2：批量下载文件

```bash
# 获取文件列表（JSON 格式）
kfc list --json > files.json

# 使用脚本批量下载
cat files.json | jq -r '.items[].id' | while read id; do
  kfc download $id -o ./downloads/
done
```

### 示例 3：CI/CD 集成

```yaml
# GitHub Actions 示例
name: Upload Documents

on:
  push:
    branches: [ main ]

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install KFC CLI
        run: |
          cd kfc-cli
          npm install
          npm run build
      
      - name: Upload Documents
        env:
          KFC_TOKEN: ${{ secrets.KFC_TOKEN }}
          KFC_API_URL: ${{ secrets.KFC_API_URL }}
        run: |
          cd kfc-cli
          npm run dev upload ../docs/ -r --tags "CI,自动上传"
```

### 示例 4：定期备份脚本

```bash
#!/bin/bash
# backup.sh - 定期备份脚本

export KFC_TOKEN="kfc_cli_xxx..."
export KFC_API_URL="http://47.93.26.241"

# 上传备份文件
kfc upload /backup/database.sql \
  --title "数据库备份 $(date +%Y%m%d)" \
  --tags "备份,数据库,自动"

# 上传日志文件
kfc upload /var/log/app.log \
  --title "应用日志 $(date +%Y%m%d)" \
  --tags "日志,应用,自动"
```

---

## 常见问题

### Q1: 如何切换认证方式？

```bash
# 查看当前认证方式
kfc auth status

# 切换认证方式
kfc auth switch
```

### Q2: Token 过期了怎么办？

Token 过期后需要重新获取：

1. **方式1：通过 Web 界面**
   - 访问 http://47.93.26.241
   - 进入「个人设置」→「API Token 管理」
   - 创建新 Token 或刷新现有 Token

2. **方式2：重新初始化**
   ```bash
   kfc init
   ```

### Q3: 如何查看上传进度？

上传时会自动显示进度条：

```
→ 上传文件: large-file.pdf
上传进度: 45%
```

### Q4: 支持哪些文件类型？

支持所有文件类型，包括：
- 文档：PDF, DOC, DOCX, TXT, MD
- 图片：JPG, PNG, GIF, SVG
- 压缩包：ZIP, RAR, TAR.GZ
- 其他：任意文件类型

### Q5: 如何批量上传？

使用 `-r` 选项递归上传目录：

```bash
kfc upload ./documents/ -r
```

### Q6: 配置文件在哪里？

- **macOS/Linux**: `~/.kfc/config.json`
- **Windows**: `%USERPROFILE%\.kfc\config.json`
- **项目配置**: `./.kfc/config.json`

### Q7: 如何调试问题？

启用调试模式：

```bash
export KFC_DEBUG=true
kfc upload ./file.pdf
```

---

## 故障排除

### 问题 1: 网络连接错误

**症状：**
```
✗ 网络错误：无法连接到服务器
```

**解决方案：**
1. 检查服务器地址是否正确：
   ```bash
   kfc config get server
   ```

2. 设置正确的服务器地址：
   ```bash
   export KFC_API_URL="http://47.93.26.241"
   ```

3. 检查网络连接：
   ```bash
   curl http://47.93.26.241/api/auth/me
   ```

### 问题 2: 认证失败

**症状：**
```
✗ 认证失败：Token 无效或已过期
```

**解决方案：**
1. 检查 Token 是否正确：
   ```bash
   kfc auth status
   ```

2. 重新获取 Token：
   ```bash
   kfc init
   ```

3. 或手动设置 Token：
   ```bash
   export KFC_TOKEN="kfc_cli_xxx..."
   ```

### 问题 3: 文件上传失败

**症状：**
```
✗ 上传失败
```

**解决方案：**
1. 检查文件是否存在：
   ```bash
   ls -l ./file.pdf
   ```

2. 检查文件权限：
   ```bash
   chmod 644 ./file.pdf
   ```

3. 检查磁盘空间：
   ```bash
   df -h
   ```

4. 启用调试模式查看详细错误：
   ```bash
   export KFC_DEBUG=true
   kfc upload ./file.pdf
   ```

### 问题 4: SSH 密钥未找到

**症状：**
```
⚠ 未检测到 SSH 密钥
```

**解决方案：**
1. 检查 SSH 密钥是否存在：
   ```bash
   ls -la ~/.ssh/
   ```

2. 生成新的 SSH 密钥：
   ```bash
   ssh-keygen -t ed25519 -C "user@example.com"
   ```

3. 或在初始化时选择自动生成

### 问题 5: 权限不足

**症状：**
```
✗ 权限不足
```

**解决方案：**
1. 检查用户角色：
   ```bash
   kfc info
   ```

2. 联系管理员提升权限

3. 确保使用正确的 Token（CLI Token 或 API Token）

---

## 获取帮助

- **查看命令帮助**：
  ```bash
  kfc --help
  kfc <command> --help
  ```

- **查看版本信息**：
  ```bash
  kfc --version
  ```

- **报告问题**：请提交 Issue 到项目仓库

---

## 更新日志

### v1.0.0 (2025-11-28)

- ✨ 初始版本发布
- ✨ 支持文件上传、下载、列表查看
- ✨ 支持 SSH 和 API Token 双认证
- ✨ 支持跨平台（macOS、Linux、Windows）
- ✨ 首次使用引导功能

---

*最后更新：2025-11-28*

