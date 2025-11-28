# KFC CLI 安装脚本 (PowerShell)
# 适用于 Windows

$ErrorActionPreference = "Stop"

$VERSION = "1.0.0"
$REPO_URL = "https://github.com/Coldplay-now/kfc-cli"
$RELEASE_URL = "$REPO_URL/releases/download/v$VERSION"

# 检测架构
function Get-Architecture {
    $arch = (Get-WmiObject Win32_Processor).Architecture
    
    switch ($arch) {
        0 { return "x64" }  # x86
        5 { return "arm64" } # ARM
        9 { return "x64" }  # x64
        default { return "x64" }
    }
}

# 下载二进制文件
function Download-Binary {
    $arch = Get-Architecture
    $binaryName = "kfc-win-$arch.exe"
    $downloadUrl = "$RELEASE_URL/$binaryName"
    $tempFile = "$env:TEMP\kfc-install.exe"
    
    Write-Host "📥 下载 KFC CLI v$VERSION..." -ForegroundColor Cyan
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $tempFile -UseBasicParsing
        return $tempFile
    } catch {
        Write-Host "❌ 下载失败: $_" -ForegroundColor Red
        exit 1
    }
}

# 安装二进制文件
function Install-Binary {
    param($tempFile)
    
    $installDir = "$env:USERPROFILE\AppData\Local\Microsoft\WindowsApps"
    $targetFile = "$installDir\kfc.exe"
    
    # 创建目录（如果不存在）
    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    }
    
    # 移动文件
    Move-Item -Path $tempFile -Destination $targetFile -Force
    
    Write-Host "✅ 安装成功！" -ForegroundColor Green
    Write-Host "   安装位置: $targetFile" -ForegroundColor Gray
}

# 验证安装
function Verify-Installation {
    $kfcPath = Get-Command kfc -ErrorAction SilentlyContinue
    
    if ($kfcPath) {
        $version = & kfc --version 2>&1
        Write-Host "✅ KFC CLI 已安装: $version" -ForegroundColor Green
        Write-Host ""
        Write-Host "运行 'kfc --help' 查看使用说明" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  安装可能失败，请检查 PATH 设置" -ForegroundColor Yellow
        Write-Host "   请确保 $env:USERPROFILE\AppData\Local\Microsoft\WindowsApps 在 PATH 中" -ForegroundColor Gray
    }
}

# 主函数
function Main {
    Write-Host "🚀 KFC CLI 安装程序" -ForegroundColor Cyan
    Write-Host ""
    
    $arch = Get-Architecture
    Write-Host "📍 检测到架构: $arch" -ForegroundColor Gray
    Write-Host ""
    
    $tempFile = Download-Binary
    Install-Binary -tempFile $tempFile
    Verify-Installation
}

Main

