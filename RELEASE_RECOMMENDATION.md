# GitHub Release 方式推荐

## 🎯 推荐方式：自动化脚本（方式 1）

### 为什么推荐？

✅ **最简单快捷** - 一条命令完成所有操作
✅ **自动检查** - 自动验证文件是否存在
✅ **减少错误** - 自动处理所有步骤，减少人为错误
✅ **可重复使用** - 以后发布新版本时直接使用
✅ **完整日志** - 显示详细的操作过程

### 使用方法

```bash
cd kfc-cli

# 1. 确保已登录 GitHub CLI
gh auth login

# 2. 打包（如果需要）
npm run package:all

# 3. 创建 Release（一条命令搞定！）
./scripts/create-release.sh v1.0.0
```

就这么简单！脚本会自动：
- ✅ 检查 GitHub CLI 是否安装和登录
- ✅ 验证所有必需文件是否存在
- ✅ 显示文件大小信息
- ✅ 创建 GitHub Release
- ✅ 上传所有平台的可执行文件
- ✅ 使用 RELEASE_NOTES.md 作为发布说明

### 适用场景

- ✅ **首次发布** - 最推荐
- ✅ **常规发布** - 每次发布新版本
- ✅ **CI/CD 集成** - 可以集成到自动化流程

---

## 其他方式对比

### 方式 2: GitHub CLI 手动创建

**优点：**
- 灵活，可以自定义所有参数
- 适合需要特殊配置的情况

**缺点：**
- 需要手动输入长命令
- 容易出错（文件路径、版本号等）
- 需要手动检查文件

**适用场景：**
- 需要自定义 Release 说明
- 只上传部分文件
- 临时使用，不想安装脚本

**使用方法：**
```bash
gh release create v1.0.0 \
  release/kfc-macos-x64 \
  release/kfc-macos-arm64 \
  release/kfc-linux-x64 \
  release/kfc-linux-arm64 \
  release/kfc-win-x64.exe \
  --title "v1.0.0" \
  --notes "$(cat RELEASE_NOTES.md)"
```

---

### 方式 3: Web 界面手动创建

**优点：**
- 最直观，可视化操作
- 不需要安装 GitHub CLI
- 可以预览 Release 内容

**缺点：**
- 需要手动上传每个文件（5个文件）
- 容易遗漏文件
- 操作步骤多，耗时
- 不适合频繁发布

**适用场景：**
- 不熟悉命令行
- 只需要发布一次
- 需要仔细检查 Release 内容

**使用方法：**
1. 访问 https://github.com/Coldplay-now/kfc-cli/releases
2. 点击 "Draft a new release"
3. 填写版本信息
4. 拖拽上传 5 个文件
5. 点击 "Publish release"

---

## 完整推荐流程

### 首次发布

```bash
cd kfc-cli

# 1. 安装 GitHub CLI（如果还没有）
# macOS:
brew install gh

# 2. 登录 GitHub
gh auth login

# 3. 打包所有平台
npm run package:all

# 4. 验证文件
ls -lh release/

# 5. 创建 Release（推荐方式）
./scripts/create-release.sh v1.0.0

# 6. 验证安装脚本
curl -fsSL https://raw.githubusercontent.com/Coldplay-now/kfc-cli/main/scripts/install.sh | bash
```

### 后续发布新版本

```bash
# 1. 更新版本号（如果需要）
# 编辑 package.json 和 RELEASE_NOTES.md

# 2. 重新打包
npm run package:all

# 3. 创建新 Release
./scripts/create-release.sh v1.1.0
```

---

## 快速决策树

```
需要发布 GitHub Release？
│
├─ 是否已安装 GitHub CLI？
│  ├─ 是 → 使用方式 1（自动化脚本）⭐ 推荐
│  └─ 否 → 
│     ├─ 愿意安装 GitHub CLI？ → 安装后使用方式 1
│     └─ 不想安装 → 使用方式 3（Web 界面）
│
└─ 需要自定义 Release 内容？
   ├─ 是 → 使用方式 2（GitHub CLI 手动）
   └─ 否 → 使用方式 1（自动化脚本）⭐ 推荐
```

---

## 总结

**最推荐：方式 1（自动化脚本）**

- 🚀 最快：一条命令完成
- 🛡️ 最安全：自动检查，减少错误
- 🔄 可重复：以后发布直接复用
- 📝 完整：自动使用 Release Notes

**安装 GitHub CLI 只需一次，之后所有发布都可以一键完成！**

