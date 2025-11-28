import { ConfigManager } from '../core/config';
import { Logger } from '../utils/logger';
import { Prompt } from '../utils/prompt';

export async function configCommand(action: string, key?: string, value?: string): Promise<void> {
  const configManager = new ConfigManager();

  switch (action) {
    case 'list':
      await listConfig(configManager);
      break;
    case 'get':
      if (!key) {
        Logger.error('请指定配置项名称');
        process.exit(1);
      }
      await getConfig(configManager, key);
      break;
    case 'set':
      if (!key) {
        Logger.error('请指定配置项名称');
        process.exit(1);
      }
      if (!value) {
        Logger.error('请指定配置项值');
        process.exit(1);
      }
      await setConfig(configManager, key, value);
      break;
    case 'reset':
      await resetConfig(configManager);
      break;
    default:
      Logger.error(`未知操作: ${action}`);
      Logger.info('可用操作: list, get, set, reset');
      process.exit(1);
  }
}

async function listConfig(configManager: ConfigManager): Promise<void> {
  const config = await configManager.getConfig();
  
  Logger.section('当前配置:');
  console.log('');
  console.log('全局配置:', configManager.getGlobalConfigPath());
  console.log('项目配置:', configManager.getProjectConfigPath());
  console.log('');
  
  Object.entries(config).forEach(([key, val]) => {
    if (key === 'api_token' && val) {
      const token = val as string;
      console.log(`  ${key}: ${token.substring(0, 20)}...`);
    } else {
      console.log(`  ${key}: ${val || '(未设置)'}`);
    }
  });
}

async function getConfig(configManager: ConfigManager, key: string): Promise<void> {
  const value = await configManager.getConfigValue(key as any);
  if (value) {
    if (key === 'api_token') {
      const token = value as string;
      console.log(token.substring(0, 20) + '...');
    } else {
      console.log(value);
    }
  } else {
    Logger.warning(`配置项 ${key} 未设置`);
  }
}

async function setConfig(configManager: ConfigManager, key: string, value: string): Promise<void> {
  const config: any = {};
  config[key] = value;
  
  const saveToProject = await Prompt.confirm('保存到项目配置? (否则保存到全局配置)', false);
  
  if (saveToProject) {
    await configManager.saveProjectConfig(config);
    Logger.success(`已保存到项目配置: ${key} = ${value}`);
  } else {
    await configManager.saveGlobalConfig(config);
    Logger.success(`已保存到全局配置: ${key} = ${value}`);
  }
}

async function resetConfig(configManager: ConfigManager): Promise<void> {
  const confirm = await Prompt.confirm('确定要重置配置吗?', false);
  if (!confirm) {
    Logger.info('已取消');
    return;
  }

  const resetGlobal = await Prompt.confirm('重置全局配置?', true);
  const resetProject = await Prompt.confirm('重置项目配置?', false);

  if (resetGlobal) {
    await configManager.saveGlobalConfig({});
    Logger.success('全局配置已重置');
  }

  if (resetProject) {
    await configManager.saveProjectConfig({});
    Logger.success('项目配置已重置');
  }
}

