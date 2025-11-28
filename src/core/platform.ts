import * as os from 'os';
import * as path from 'path';

export interface PlatformInfo {
  os: 'darwin' | 'linux' | 'win32';
  shell: 'bash' | 'zsh' | 'powershell' | 'cmd';
  homeDir: string;
  configDir: string;
  sshDir: string;
}

export class Platform {
  static detect(): PlatformInfo {
    const platform = process.platform as 'darwin' | 'linux' | 'win32';
    const homeDir = os.homedir();
    
    // 检测 Shell
    let shell: 'bash' | 'zsh' | 'powershell' | 'cmd' = 'bash';
    if (platform === 'win32') {
      const shellEnv = process.env.SHELL || process.env.COMSPEC || '';
      if (shellEnv.includes('powershell')) {
        shell = 'powershell';
      } else {
        shell = 'cmd';
      }
    } else {
      const shellEnv = process.env.SHELL || '/bin/bash';
      if (shellEnv.includes('zsh')) {
        shell = 'zsh';
      } else {
        shell = 'bash';
      }
    }

    // 配置目录
    let configDir: string;
    if (platform === 'win32') {
      configDir = path.join(homeDir, '.kfc');
    } else {
      configDir = path.join(homeDir, '.kfc');
    }

    // SSH 目录
    let sshDir: string;
    if (platform === 'win32') {
      sshDir = path.join(homeDir, '.ssh');
    } else {
      sshDir = path.join(homeDir, '.ssh');
    }

    return {
      os: platform,
      shell,
      homeDir,
      configDir,
      sshDir,
    };
  }

  static getOSName(): string {
    const platform = process.platform;
    if (platform === 'darwin') return 'macOS';
    if (platform === 'linux') return 'Linux';
    if (platform === 'win32') return 'Windows';
    return platform;
  }

  static getShellName(): string {
    const info = Platform.detect();
    return info.shell;
  }
}

