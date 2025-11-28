# GitHub Releases 发布指南

本文档介绍如何将 KFC CLI 打包并发布到 GitHub Releases。

## 步骤 1: 打包可执行文件

### 方式 1: 使用打包脚本（推荐）

```bash
cd kfc-cli
./scripts/package.sh
```

### 方式 2: 手动打包

```bash
cd kfc-cli

# 1. 安装依赖（如果还没有）
npm install

# 2. 构建 TypeScript
npm run build

# 3. 打包所有平台
npm run package:all
```

打包完成后，可执行文件会在 `release/` 目录下：

```
release/
├── kfc-macos-x64        # macOS Intel
├── kfc-macos-arm64      # macOS Apple Silicon
├── kfc-linux-x64        # Linux x64
├── kfc-linux-arm64      # Linux ARM64
└── kfc-win-x64.exe      # Windows x64
```

## 步骤 2: 创建 GitHub Release

### 方式 1: 使用 GitHub CLI（推荐，自动化）

#### 安装 GitHub CLI

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Windows:**
从 https://cli.github.com/ 下载安装

#### 登录 GitHub

```bash
gh auth login
```

#### 创建 Release 并上传文件

```bash
cd kfc-cli

# 创建 Release（会自动上传 release/ 目录下的所有文件）
gh release create v1.0.0 \
  release/kfc-macos-x64 \
  release/kfc-macos-arm64 \
  release/kfc-linux-x64 \
  release/kfc-linux-arm64 \
  release/kfc-win-x64.exe \
  --title "v1.0.0" \
  --notes "KFC CLI v1.0.0 首次发布

## 主要功能
- ✅ 文件上传、下载、列表查看
- ✅ SSH 和 API Token 双认证
- ✅ 跨平台支持（macOS、Linux、Windows）

## 安装方式

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
\`\`\`

详细文档请查看 [README.md](https://github.com/Coldplay-now/kfc-cli#readme)"
```

或者使用脚本自动创建：

```bash
# 使用自动化脚本
./scripts/create-release.sh v1.0.0
```

### 方式 2: 使用 GitHub Web 界面（手动）

1. **访问 Releases 页面**
   - 打开 https://github.com/Coldplay-now/kfc-cli/releases
   - 点击 "Draft a new release"

2. **填写 Release 信息**
   - **Tag**: 输入 `v1.0.0`（或点击 "Choose a tag" 创建新标签）
   - **Title**: `v1.0.0`
   - **Description**: 复制下面的内容

   ```markdown
   # KFC CLI v1.0.0

   ## 主要功能
   - ✅ 文件上传、下载、列表查看
   - ✅ SSH 和 API Token 双认证
   - ✅ 跨平台支持（macOS、Linux、Windows）

   ## 安装方式

   ```bash
   curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
   ```

   ## 下载

   请根据您的平台下载对应的可执行文件：
   - macOS Intel: `kfc-macos-x64`
   - macOS Apple Silicon: `kfc-macos-arm64`
   - Linux x64: `kfc-linux-x64`
   - Linux ARM64: `kfc-linux-arm64`
   - Windows: `kfc-win-x64.exe`

   详细文档请查看 [README.md](https://github.com/Coldplay-now/kfc-cli#readme)
   ```

3. **上传文件**
   - 在 "Attach binaries" 区域，拖拽或选择 `release/` 目录下的所有文件：
     - `kfc-macos-x64`
     - `kfc-macos-arm64`
     - `kfc-linux-x64`
     - `kfc-linux-arm64`
     - `kfc-win-x64.exe`

4. **发布**
   - 点击 "Publish release" 按钮

## 步骤 3: 验证 Release

发布后，验证安装脚本是否可以正常工作：

```bash
# 测试安装脚本
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
```

## 自动化脚本

### 创建 Release 脚本

创建 `scripts/create-release.sh`:

```bash
#!/bin/bash

VERSION=$1
if [ -z "$VERSION" ]; then
    echo "用法: ./scripts/create-release.sh <version>"
    echo "示例: ./scripts/create-release.sh v1.0.0"
    exit 1
fi

echo "🚀 创建 GitHub Release: $VERSION"
echo ""

# 检查是否已登录
if ! gh auth status &>/dev/null; then
    echo "❌ 请先登录 GitHub CLI: gh auth login"
    exit 1
fi

# 检查 release 目录
if [ ! -d "release" ]; then
    echo "❌ release 目录不存在，请先打包: npm run package:all"
    exit 1
fi

# 检查文件是否存在
FILES=(
    "release/kfc-macos-x64"
    "release/kfc-macos-arm64"
    "release/kfc-linux-x64"
    "release/kfc-linux-arm64"
    "release/kfc-win-x64.exe"
)

MISSING_FILES=()
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ 缺少以下文件:"
    printf '  - %s\n' "${MISSING_FILES[@]}"
    echo ""
    echo "请先打包: npm run package:all"
    exit 1
fi

# 创建 Release
echo "📦 上传文件到 GitHub Releases..."
gh release create "$VERSION" \
    "${FILES[@]}" \
    --title "$VERSION" \
    --notes "KFC CLI $VERSION

## 主要功能
- ✅ 文件上传、下载、列表查看
- ✅ SSH 和 API Token 双认证
- ✅ 跨平台支持（macOS、Linux、Windows）

## 安装方式

\`\`\`bash
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
\`\`\`

详细文档请查看 [README.md](https://github.com/Coldplay-now/kfc-cli#readme)"

echo ""
echo "✅ Release 创建成功！"
echo "   访问: https://github.com/Coldplay-now/kfc-cli/releases/tag/$VERSION"
```

## 完整流程示例

```bash
# 1. 进入项目目录
cd kfc-cli

# 2. 确保依赖已安装
npm install

# 3. 打包所有平台
npm run package:all

# 4. 验证文件
ls -lh release/

# 5. 创建 Release（使用 GitHub CLI）
gh release create v1.0.0 \
  release/kfc-macos-x64 \
  release/kfc-macos-arm64 \
  release/kfc-linux-x64 \
  release/kfc-linux-arm64 \
  release/kfc-win-x64.exe \
  --title "v1.0.0" \
  --notes "$(cat RELEASE_NOTES.md)"

# 6. 验证安装脚本
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
```

## 常见问题

### Q: 打包失败怎么办？

**A:** 检查：
1. 是否安装了所有依赖：`npm install`
2. 是否安装了 pkg：`npm install -g pkg` 或 `npm install --save-dev pkg`
3. 查看错误信息，根据提示修复

### Q: GitHub CLI 登录失败？

**A:** 
1. 检查网络连接
2. 尝试使用浏览器登录：`gh auth login --web`
3. 检查 GitHub token 是否有效

### Q: 上传文件失败？

**A:**
1. 检查文件大小（GitHub 限制单个文件 100MB）
2. 检查网络连接
3. 尝试使用 Web 界面上传

### Q: 如何更新 Release？

**A:**
```bash
# 删除旧 Release
gh release delete v1.0.0

# 创建新 Release
gh release create v1.0.0 ...
```

或者直接在 Web 界面编辑 Release，添加/删除文件。

## 相关文档

- [打包指南](./BUILD.md)
- [发布说明](./RELEASE_NOTES.md)
- [安装指南](./INSTALL.md)

