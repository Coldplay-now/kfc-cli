# 快速创建 Release 指南

## 当前状态

✅ GitHub CLI 已安装
✅ 所有可执行文件已打包完成
❌ 需要登录 GitHub CLI

## 两种登录方式

### 方式 A: 交互式登录（推荐）

在终端运行：

```bash
gh auth login
```

按提示操作：
1. 选择 `GitHub.com`
2. 选择登录方式：
   - `Login with a web browser`（推荐，最简单）
   - `Paste an authentication token`（如果有 Token）
3. 选择协议：`HTTPS`（推荐）

登录完成后，运行：

```bash
./scripts/create-release.sh v1.0.0
```

### 方式 B: 使用 Token（适合 CI/CD）

1. **获取 GitHub Token**
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo`（完整仓库访问权限）
   - 复制 Token（格式：`ghp_xxxxx`）

2. **使用 Token 创建 Release**

```bash
export GITHUB_TOKEN=ghp_xxxxx
./scripts/create-release-with-token.sh v1.0.0 $GITHUB_TOKEN
```

## 登录后执行

登录完成后，直接运行：

```bash
cd /Users/xt/LXT/code/trae/1126-kfc/kfc-cli
./scripts/create-release.sh v1.0.0
```

脚本会自动：
- ✅ 验证所有文件
- ✅ 创建 GitHub Release
- ✅ 上传所有 5 个平台的可执行文件
- ✅ 使用 RELEASE_NOTES.md 作为发布说明

## 验证

Release 创建成功后，访问：
https://github.com/Coldplay-now/kfc-cli/releases/tag/v1.0.0

测试安装脚本：
```bash
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
```

