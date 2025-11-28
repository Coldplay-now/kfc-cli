import { APIClient } from '../api';
import { ConfigManager } from '../config';
import { TokenAuth } from './token';
import { SSHAuth } from './ssh';
import { Logger } from '../../utils/logger';

export type AuthMethod = 'ssh' | 'token';

export class AuthManager {
  private apiClient: APIClient;
  private configManager: ConfigManager;
  private tokenAuth: TokenAuth;
  private sshAuth: SSHAuth;

  constructor(apiClient: APIClient, configManager: ConfigManager) {
    this.apiClient = apiClient;
    this.configManager = configManager;
    this.tokenAuth = new TokenAuth(apiClient, configManager);
    this.sshAuth = new SSHAuth(apiClient, configManager);
  }

  /**
   * 初始化认证（根据配置自动选择认证方式）
   */
  async initialize(): Promise<void> {
    const config = await this.configManager.getConfig();
    const authMethod = (process.env.KFC_AUTH_METHOD || config.auth_method || 'token') as AuthMethod;

    // 设置 API Token（如果存在）
    const token = process.env.KFC_TOKEN || config.api_token;
    if (token) {
      this.apiClient.setToken(token);
    }

    // 验证认证是否有效
    if (token) {
      const isValid = await this.tokenAuth.validateToken(token);
      if (!isValid) {
        Logger.warning('Token 已过期或无效，请重新认证');
        this.apiClient.clearToken();
      }
    }
  }

  /**
   * 获取当前认证方式
   */
  async getAuthMethod(): Promise<AuthMethod> {
    const config = await this.configManager.getConfig();
    return (process.env.KFC_AUTH_METHOD || config.auth_method || 'token') as AuthMethod;
  }

  /**
   * 检查是否已认证
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.apiClient.get('/api/auth/me');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 使用 Token 认证
   */
  async authenticateWithToken(): Promise<string> {
    const token = await this.tokenAuth.getTokenByEmail();
    this.apiClient.setToken(token);
    return token;
  }

  /**
   * 使用 SSH 认证
   */
  async authenticateWithSSH(): Promise<void> {
    await this.sshAuth.authenticate();
    // SSH 认证后，API 客户端应该已经有 Token 了
    await this.initialize();
  }

  /**
   * 切换认证方式
   */
  async switchAuthMethod(method: AuthMethod): Promise<void> {
    await this.configManager.saveGlobalConfig({ auth_method: method });
    
    if (method === 'token') {
      await this.authenticateWithToken();
    } else {
      await this.authenticateWithSSH();
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<any> {
    return await this.apiClient.get('/api/auth/me');
  }

  /**
   * 清除认证信息
   */
  async logout(): Promise<void> {
    this.apiClient.clearToken();
    await this.configManager.saveGlobalConfig({
      api_token: undefined,
    });
    Logger.success('已清除认证信息');
  }
}

