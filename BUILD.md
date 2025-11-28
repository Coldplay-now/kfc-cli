# KFC CLI 打包指南

本文档介绍如何将 KFC CLI 打包成可执行文件。

## 打包方式

### 方式 1: 使用 pkg 打包（推荐）

`pkg` 可以将 Node.js 应用打包成单个可执行文件，无需安装 Node.js。

#### 安装 pkg

```bash
npm install --save-dev pkg
```

#### 打包单个平台

```bash
# 打包当前平台
npm run package

# 打包 macOS (Intel)
pkg . --targets node18-macos-x64 --out-path ./release

# 打包 macOS (Apple Silicon)
pkg . --targets node18-macos-arm64 --out-path ./release

# 打包 Linux (x64)
pkg . --targets node18-linux-x64 --out-path ./release

# 打包 Linux (ARM64)
pkg . --targets node18-linux-arm64 --out-path ./release

# 打包 Windows (x64)
pkg . --targets node18-win-x64 --out-path ./release
```

#### 打包所有平台

```bash
npm run package:all
```

这会在 `release/` 目录下生成以下文件：
- `kfc-macos-x64` - macOS Intel
- `kfc-macos-arm64` - macOS Apple Silicon
- `kfc-linux-x64` - Linux x64
- `kfc-linux-arm64` - Linux ARM64
- `kfc-win-x64.exe` - Windows x64

### 方式 2: 创建 npm 包

#### 打包成 .tgz 文件

```bash
npm run pack
```

这会生成 `kfc-cli-1.0.0.tgz` 文件，可以用于：
- 本地安装: `npm install -g ./kfc-cli-1.0.0.tgz`
- 分发安装包

#### 发布到 npm registry

```bash
# 登录 npm
npm login

# 发布
npm publish
```

### 方式 3: 使用 Docker

创建 Docker 镜像，包含预构建的二进制文件。

```bash
# 构建 Docker 镜像
docker build -t kfc-cli:latest .

# 运行
docker run --rm kfc-cli:latest kfc --version
```

## 打包步骤

### 完整打包流程

1. **构建 TypeScript**

```bash
npm run build
```

2. **打包可执行文件**

```bash
# 所有平台
npm run package:all

# 或单个平台
npm run package
```

3. **测试可执行文件**

```bash
# macOS/Linux
./release/kfc-macos-x64 --version

# Windows
.\release\kfc-win-x64.exe --version
```

4. **创建发布包**

```bash
# 创建发布目录
mkdir -p dist-release

# 复制可执行文件
cp release/kfc-* dist-release/

# 复制文档
cp README.md USER_MANUAL.md INSTALL.md dist-release/

# 创建压缩包
cd dist-release
tar -czf kfc-cli-v1.0.0.tar.gz *
zip -r kfc-cli-v1.0.0.zip *
```

## 发布到 GitHub Releases

### 使用 GitHub CLI

```bash
# 安装 GitHub CLI
brew install gh  # macOS
# 或从 https://cli.github.com/ 下载

# 登录
gh auth login

# 创建 Release
gh release create v1.0.0 \
  release/kfc-macos-x64 \
  release/kfc-macos-arm64 \
  release/kfc-linux-x64 \
  release/kfc-linux-arm64 \
  release/kfc-win-x64.exe \
  --title "v1.0.0" \
  --notes "KFC CLI v1.0.0 发布"
```

### 手动上传

1. 访问 GitHub Releases 页面
2. 点击 "Draft a new release"
3. 填写版本号和发布说明
4. 上传所有平台的可执行文件
5. 发布

## 打包配置

### package.json 配置

```json
{
  "pkg": {
    "scripts": [
      "dist/**/*.js"
    ],
    "assets": [
      "package.json"
    ],
    "targets": [
      "node18-macos-x64",
      "node18-macos-arm64",
      "node18-linux-x64",
      "node18-linux-arm64",
      "node18-win-x64"
    ],
    "outputPath": "release"
  }
}
```

### 注意事项

1. **文件大小**: pkg 打包的文件较大（通常 30-50MB），因为包含了 Node.js 运行时
2. **原生模块**: 某些原生模块可能需要特殊配置
3. **动态 require**: pkg 无法处理动态 require，需要明确列出所有文件
4. **测试**: 打包后务必在不同平台上测试

## 自动化打包

### 使用 GitHub Actions

创建 `.github/workflows/release.yml`:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        include:
          - os: ubuntu-latest
            target: node18-linux-x64
          - os: macos-latest
            target: node18-macos-x64
          - os: windows-latest
            target: node18-win-x64
    
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      - run: npm install -g pkg
      - run: pkg . --targets ${{ matrix.target }} --out-path ./release
      
      - uses: actions/upload-artifact@v2
        with:
          name: kfc-${{ matrix.target }}
          path: release/*
  
  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/download-artifact@v2
      
      - uses: softprops/action-gh-release@v1
        with:
          files: |
            release/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 文件大小优化

### 减小文件大小

1. **使用压缩**: pkg 支持压缩，但会增加启动时间
2. **移除不必要的依赖**: 检查并移除未使用的依赖
3. **使用更小的运行时**: 考虑使用更小的 Node.js 运行时

### 检查文件大小

```bash
# macOS/Linux
ls -lh release/

# Windows
dir release\
```

## 测试打包结果

### 本地测试

```bash
# 测试基本功能
./release/kfc-macos-x64 --version
./release/kfc-macos-x64 --help
./release/kfc-macos-x64 init
```

### 跨平台测试

在不同平台上测试：
- macOS (Intel 和 Apple Silicon)
- Linux (x64 和 ARM64)
- Windows (x64)

## 常见问题

### Q: 打包后文件很大？

A: 这是正常的，pkg 包含了 Node.js 运行时。通常 30-50MB 是正常的。

### Q: 打包后无法运行？

A: 检查：
1. 是否正确构建了 TypeScript (`npm run build`)
2. 是否所有依赖都正确包含
3. 是否有动态 require 需要配置

### Q: 如何在 CI/CD 中自动化打包？

A: 使用 GitHub Actions 或其他 CI/CD 平台，参考上面的自动化打包部分。

## 相关文档

- [安装指南](./INSTALL.md)
- [使用手册](./USER_MANUAL.md)
- [pkg 文档](https://github.com/vercel/pkg)

