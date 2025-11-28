import { AuthManager } from '../core/auth';
import { ConfigManager } from '../core/config';
import { APIClient } from '../core/api';
import { Prompt } from '../utils/prompt';
import { Logger } from '../utils/logger';

export async function authCommand(action?: string): Promise<void> {
  const configManager = new ConfigManager();
  const apiClient = new APIClient();
  await apiClient.initialize();
  const authManager = new AuthManager(apiClient, configManager);

  await authManager.initialize();

  if (!action || action === 'status') {
    await showAuthStatus(authManager, configManager);
  } else if (action === 'switch') {
    await switchAuthMethod(authManager);
  } else if (action === 'refresh') {
    await refreshToken(authManager);
  } else if (action === 'logout') {
    await authManager.logout();
  } else {
    Logger.error(`未知操作: ${action}`);
    Logger.info('可用操作: status, switch, refresh, logout');
    process.exit(1);
  }
}

async function showAuthStatus(authManager: AuthManager, configManager: ConfigManager): Promise<void> {
  Logger.section('认证状态');

  const isAuthenticated = await authManager.isAuthenticated();
  const authMethod = await authManager.getAuthMethod();
  const config = await configManager.getConfig();

  if (isAuthenticated) {
    Logger.success('已认证');
    
    try {
      const user = await authManager.getCurrentUser();
      Logger.info(`用户名: ${user.username}`);
      Logger.info(`邮箱: ${user.email || '未设置'}`);
      Logger.info(`角色: ${user.role}`);
    } catch (error) {
      Logger.warning('无法获取用户信息');
    }

    Logger.info('');
    Logger.info(`认证方式: ${authMethod === 'ssh' ? 'SSH 公钥' : 'API Token'}`);
    
    if (authMethod === 'token' && config.api_token) {
      const token = config.api_token as string;
      Logger.info(`Token: ${token.substring(0, 20)}...`);
    } else if (authMethod === 'ssh' && config.ssh_key_path) {
      Logger.info(`SSH 密钥: ${config.ssh_key_path}`);
    }
  } else {
    Logger.warning('未认证');
    Logger.info('请运行: kfc init');
  }
}

async function switchAuthMethod(authManager: AuthManager): Promise<void> {
  Logger.section('切换认证方式');

  const currentMethod = await authManager.getAuthMethod();
  Logger.info(`当前认证方式: ${currentMethod === 'ssh' ? 'SSH 公钥' : 'API Token'}`);

  const newMethod = await Prompt.select('请选择新的认证方式:', [
    {
      name: '🔑 SSH 公钥认证',
      value: 'ssh',
      description: '推荐！配置一次，长期使用',
    },
    {
      name: '🎫 API Token 认证',
      value: 'token',
      description: '简单快捷，适合临时使用',
    },
  ]);

  if (newMethod === currentMethod) {
    Logger.info('认证方式未改变');
    return;
  }

  try {
    await authManager.switchAuthMethod(newMethod as 'ssh' | 'token');
    Logger.success('认证方式已切换');
  } catch (error: any) {
    Logger.error('切换失败');
    if (error.message) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}

async function refreshToken(authManager: AuthManager): Promise<void> {
  Logger.section('刷新 Token');

  const authMethod = await authManager.getAuthMethod();
  if (authMethod !== 'token') {
    Logger.error('当前使用的是 SSH 认证，无需刷新 Token');
    return;
  }

  Logger.warning('刷新 Token 功能需要从 Web 端操作');
  Logger.info('请访问: http://47.93.26.241');
  Logger.info('进入「个人设置」→「API Token 管理」→ 点击「刷新」');
}

