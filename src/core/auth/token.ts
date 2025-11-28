import { APIClient } from '../api';
import { ConfigManager } from '../config';
import { Prompt } from '../../utils/prompt';
import { Logger } from '../../utils/logger';

export class TokenAuth {
  private apiClient: APIClient;
  private configManager: ConfigManager;

  constructor(apiClient: APIClient, configManager: ConfigManager) {
    this.apiClient = apiClient;
    this.configManager = configManager;
  }

  /**
   * 通过邮箱验证码获取 Token
   */
  async getTokenByEmail(): Promise<string> {
    Logger.title('API Token 认证');
    
    // 输入邮箱
    const email = await Prompt.input('请输入您的邮箱:');
    if (!email || !email.includes('@')) {
      throw new Error('邮箱格式不正确');
    }

    // 发送验证码
    Logger.step('正在发送验证码...');
    try {
      await this.apiClient.post('/api/auth/send-code', { email });
      Logger.success(`验证码已发送到 ${this.maskEmail(email)}`);
    } catch (error: any) {
      if (error.response?.status === 429) {
        Logger.error('请求过于频繁，请稍后再试');
      } else {
        Logger.error('发送验证码失败');
      }
      throw error;
    }

    // 输入验证码
    const code = await Prompt.input('请输入 6 位验证码:');
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('验证码格式不正确');
    }

    // 选择 Token 类型
    const tokenType = await Prompt.select('请选择 Token 类型:', [
      {
        name: 'CLI Token',
        value: 'cli',
        description: '有效期 90 天，权限：上传、下载、查看列表',
      },
      {
        name: 'API Token',
        value: 'api',
        description: '有效期 30 天，权限：完整 API 访问',
      },
    ]);

    // 输入 Token 名称
    const name = await Prompt.input('请输入 Token 名称（用于标识）:', 'My CLI Token');

    // 验证并获取 Token
    Logger.step('正在验证验证码...');
    try {
      const response = await this.apiClient.post('/api/auth/token', {
        email,
        code,
        token_type: tokenType,
        name,
      });

      const token = response.token;
      
      // 保存 Token 到配置
      await this.configManager.saveGlobalConfig({
        email,
        api_token: token,
        auth_method: 'token',
      });

      Logger.success('Token 获取成功！');
      Logger.info(`Token 类型: ${tokenType === 'cli' ? 'CLI Token' : 'API Token'}`);
      Logger.info(`有效期: ${tokenType === 'cli' ? '90 天' : '30 天'}`);
      Logger.info(`Token 已保存到配置文件`);

      return token;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Logger.error('验证码错误或已过期');
      } else {
        Logger.error('获取 Token 失败');
      }
      throw error;
    }
  }

  /**
   * 验证 Token 是否有效
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const originalToken = this.apiClient['client'].defaults.headers.common['Authorization'] as string | undefined;
      this.apiClient.setToken(token);
      await this.apiClient.get('/api/auth/me');
      if (!originalToken) {
        this.apiClient.clearToken();
      } else {
        const tokenValue = typeof originalToken === 'string' ? originalToken.replace('Bearer ', '') : '';
        if (tokenValue) {
          this.apiClient.setToken(tokenValue);
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 掩码邮箱（保护隐私）
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local.substring(0, 2)}***@${domain}`;
  }
}

