import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { APIClient } from '../api';
import { ConfigManager } from '../config';
import { Platform, PlatformInfo } from '../platform';
import { Prompt } from '../../utils/prompt';
import { Logger } from '../../utils/logger';
import { Clipboard } from '../../utils/clipboard';

const execAsync = promisify(exec);

export class SSHAuth {
  private apiClient: APIClient;
  private configManager: ConfigManager;
  private platform: PlatformInfo;

  constructor(apiClient: APIClient, configManager: ConfigManager) {
    this.apiClient = apiClient;
    this.configManager = configManager;
    this.platform = Platform.detect();
  }

  /**
   * 检测 SSH 密钥
   */
  async detectSSHKeys(): Promise<string[]> {
    const sshDir = this.platform.sshDir;
    const keys: string[] = [];

    if (!(await fs.pathExists(sshDir))) {
      return keys;
    }

    // 检测常见的密钥类型
    const keyTypes = ['id_ed25519', 'id_rsa', 'id_ecdsa', 'id_dsa'];
    
    for (const keyType of keyTypes) {
      const pubKeyPath = path.join(sshDir, `${keyType}.pub`);
      if (await fs.pathExists(pubKeyPath)) {
        keys.push(pubKeyPath);
      }
    }

    return keys;
  }

  /**
   * 读取 SSH 公钥
   */
  async readPublicKey(keyPath: string): Promise<string> {
    try {
      const content = await fs.readFile(keyPath, 'utf-8');
      return content.trim();
    } catch (error) {
      throw new Error(`无法读取 SSH 公钥: ${keyPath}`);
    }
  }

  /**
   * 生成 SSH 密钥对
   */
  async generateSSHKey(email: string): Promise<string> {
    const keyPath = path.join(this.platform.sshDir, 'id_ed25519');
    const pubKeyPath = `${keyPath}.pub`;

    Logger.step('正在生成 SSH 密钥对...');

    try {
      // 生成密钥
      await execAsync(
        `ssh-keygen -t ed25519 -C "${email}" -f "${keyPath}" -N ""`
      );

      // 读取公钥
      const publicKey = await this.readPublicKey(pubKeyPath);

      Logger.success('SSH 密钥生成成功！');
      Logger.info(`私钥: ${keyPath}`);
      Logger.info(`公钥: ${pubKeyPath}`);

      return publicKey;
    } catch (error: any) {
      Logger.error('生成 SSH 密钥失败');
      throw error;
    }
  }

  /**
   * 注册 SSH 密钥
   */
  async registerSSHKey(publicKey: string, username?: string): Promise<void> {
    Logger.step('正在注册 SSH 密钥...');

    try {
      const response = await this.apiClient.post('/api/auth/ssh-register', {
        public_key: publicKey,
        username,
      });

      // 保存配置
      await this.configManager.saveGlobalConfig({
        ssh_key_path: path.join(this.platform.sshDir, 'id_ed25519'),
        auth_method: 'ssh',
        username: response.user?.username,
        email: response.user?.email,
      });

      // 保存 JWT Token（用于后续 API 调用）
      if (response.access_token) {
        await this.configManager.saveGlobalConfig({
          api_token: response.access_token,
        });
      }

      Logger.success('SSH 密钥注册成功！');
      Logger.info(`用户名: ${response.user?.username}`);
      Logger.info(`邮箱: ${response.user?.email}`);
    } catch (error: any) {
      if (error.response?.status === 400) {
        Logger.error('SSH 密钥格式错误或已被使用');
      } else {
        Logger.error('注册 SSH 密钥失败');
      }
      throw error;
    }
  }

  /**
   * SSH 认证流程
   */
  async authenticate(): Promise<void> {
    Logger.title('SSH 公钥认证');

    // 检测现有密钥
    const existingKeys = await this.detectSSHKeys();
    let publicKey: string;
    let keyPath: string;

    if (existingKeys.length > 0) {
      Logger.info(`检测到 ${existingKeys.length} 个 SSH 密钥:`);
      existingKeys.forEach((key, index) => {
        Logger.info(`  [${index + 1}] ${key}`);
      });

      const useExisting = await Prompt.confirm('是否使用现有密钥?', true);
      
      if (useExisting) {
        if (existingKeys.length === 1) {
          keyPath = existingKeys[0];
        } else {
          const selected = await Prompt.select('请选择密钥:', 
            existingKeys.map((key, index) => ({
              name: path.basename(key),
              value: index.toString(),
            }))
          );
          keyPath = existingKeys[parseInt(selected)];
        }
        publicKey = await this.readPublicKey(keyPath);
      } else {
        // 生成新密钥
        const email = await Prompt.input('请输入您的邮箱（用于标识密钥）:');
        publicKey = await this.generateSSHKey(email);
        keyPath = path.join(this.platform.sshDir, 'id_ed25519.pub');
      }
    } else {
      // 没有密钥，询问是否生成
      Logger.warning('未检测到 SSH 密钥');
      const generate = await Prompt.confirm('是否自动生成 SSH 密钥对?', true);
      
      if (generate) {
        const email = await Prompt.input('请输入您的邮箱（用于标识密钥）:');
        publicKey = await this.generateSSHKey(email);
        keyPath = path.join(this.platform.sshDir, 'id_ed25519.pub');
      } else {
        throw new Error('需要 SSH 密钥才能继续');
      }
    }

    // 显示公钥
    Logger.section('您的 SSH 公钥:');
    console.log(publicKey);

    // 尝试复制到剪贴板
    const copied = await Clipboard.copy(publicKey);
    if (copied) {
      Logger.success('公钥已复制到剪贴板');
    }

    // 提示用户添加公钥
    Logger.section('请完成以下步骤:');
    Logger.info('1. 打开浏览器访问: http://47.93.26.241');
    Logger.info('2. 登录您的账号（或用邮箱验证码注册）');
    Logger.info('3. 点击右上角进入「个人设置」');
    Logger.info('4. 找到「SSH 公钥管理」，点击「添加公钥」');
    Logger.info('5. 粘贴公钥内容并保存');

    await Prompt.waitForEnter('完成后按 Enter 继续验证...');

    // 尝试注册（如果用户已经在 Web 端添加了公钥，这里会成功）
    const username = await Prompt.input('请输入用户名（可选，回车跳过）:', '');
    try {
      await this.registerSSHKey(publicKey, username || undefined);
    } catch (error) {
      Logger.warning('自动注册失败，请确保已在 Web 端添加 SSH 公钥');
      Logger.info('您可以稍后使用 kfc auth status 检查认证状态');
    }
  }
}

