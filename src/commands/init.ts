import { AuthManager } from '../core/auth';
import { ConfigManager } from '../core/config';
import { Platform } from '../core/platform';
import { APIClient } from '../core/api';
import { Prompt } from '../utils/prompt';
import { Logger } from '../utils/logger';

export async function initCommand(): Promise<void> {
  Logger.title('🎉 欢迎使用 KFC CLI！');
  Logger.info('检测到这是您首次使用，让我们快速完成配置。');
  Logger.info('');

  // 显示系统信息
  const platform = Platform.detect();
  Logger.section('📍 系统信息:');
  Logger.info(`操作系统: ${Platform.getOSName()}`);
  Logger.info(`Shell: ${Platform.getShellName()}`);
  Logger.info('');

  // 选择认证方式
  Logger.section('请选择认证方式:');
  const authMethod = await Prompt.select('', [
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

  // 初始化组件
  const configManager = new ConfigManager();
  const apiClient = new APIClient();
  await apiClient.initialize();
  const authManager = new AuthManager(apiClient, configManager);

  // 执行认证
  try {
    if (authMethod === 'ssh') {
      await authManager.authenticateWithSSH();
    } else {
      await authManager.authenticateWithToken();
    }

    // 验证连接
    Logger.step('验证连接...');
    const user = await authManager.getCurrentUser();
    Logger.success('配置完成！');
    Logger.info(`用户名: ${user.username}`);
    Logger.info(`邮箱: ${user.email || '未设置'}`);
    Logger.info(`角色: ${user.role}`);
    Logger.info('');
    Logger.info('您现在可以使用以下命令:');
    Logger.info('  kfc upload <file>    - 上传文件');
    Logger.info('  kfc list            - 查看文件列表');
    Logger.info('  kfc download <id>   - 下载文件');
    Logger.info('  kfc config          - 管理配置');
    Logger.info('  kfc auth            - 认证管理');
  } catch (error: any) {
    Logger.error('配置失败');
    if (error.message) {
      Logger.error(error.message);
    }
    process.exit(1);
  }
}

