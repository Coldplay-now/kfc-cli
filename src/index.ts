#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { uploadCommand } from './commands/upload';
import { listCommand } from './commands/list';
import { downloadCommand } from './commands/download';
import { configCommand } from './commands/config';
import { authCommand } from './commands/auth';
import { Logger } from './utils/logger';
import { ConfigManager } from './core/config';
import { APIClient } from './core/api';
import { AuthManager } from './core/auth';

const program = new Command();

program
  .name('kfc')
  .description('KFC 文档管理平台命令行工具')
  .version('1.0.0');

// init 命令
program
  .command('init')
  .description('初始化配置（首次使用引导）')
  .action(async () => {
    try {
      await initCommand();
    } catch (error: any) {
      Logger.error(error.message || '初始化失败');
      process.exit(1);
    }
  });

// upload 命令
program
  .command('upload')
  .description('上传文件')
  .argument('<file>', '文件或文件夹路径')
  .option('-t, --title <title>', '文件标题')
  .option('-d, --desc <description>', '文件描述')
  .option('--tags <tags>', '标签（逗号分隔）')
  .option('-r, --recursive', '递归上传文件夹')
  .action(async (file: string, options: any) => {
    try {
      await uploadCommand(file, {
        title: options.title,
        description: options.desc,
        tags: options.tags,
        recursive: options.recursive,
      });
    } catch (error: any) {
      Logger.error(error.message || '上传失败');
      process.exit(1);
    }
  });

// list 命令
program
  .command('list')
  .description('查看文件列表')
  .option('--page <number>', '页码', '1')
  .option('--page-size <number>', '每页数量', '20')
  .option('-s, --search <keyword>', '搜索关键词')
  .option('--type <type>', '文件类型筛选')
  .option('--json', '以 JSON 格式输出')
  .action(async (options: any) => {
    try {
      await listCommand({
        page: parseInt(options.page) || 1,
        pageSize: parseInt(options.pageSize) || 20,
        search: options.search,
        fileType: options.type,
        json: options.json,
      });
    } catch (error: any) {
      Logger.error(error.message || '获取列表失败');
      process.exit(1);
    }
  });

// download 命令
program
  .command('download')
  .description('下载文件')
  .argument('<file-id>', '文件 ID')
  .option('-o, --output <path>', '保存路径（默认当前目录）')
  .action(async (fileId: string, options: any) => {
    try {
      await downloadCommand(fileId, {
        output: options.output,
      });
    } catch (error: any) {
      Logger.error(error.message || '下载失败');
      process.exit(1);
    }
  });

// config 命令
program
  .command('config')
  .description('管理配置')
  .argument('<action>', '操作: list, get, set, reset')
  .argument('[key]', '配置项名称（get/set 时使用）')
  .argument('[value]', '配置项值（set 时使用）')
  .action(async (action: string, key?: string, value?: string) => {
    try {
      await configCommand(action, key, value);
    } catch (error: any) {
      Logger.error(error.message || '配置操作失败');
      process.exit(1);
    }
  });

// auth 命令
program
  .command('auth')
  .description('认证管理')
  .argument('[action]', '操作: status, switch, refresh, logout', 'status')
  .action(async (action?: string) => {
    try {
      await authCommand(action);
    } catch (error: any) {
      Logger.error(error.message || '认证操作失败');
      process.exit(1);
    }
  });

// info 命令（快捷方式，等同于 auth status）
program
  .command('info')
  .description('查看当前用户信息')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      const apiClient = new APIClient();
      await apiClient.initialize();
      const authManager = new AuthManager(apiClient, configManager);
      await authManager.initialize();
      
      if (await authManager.isAuthenticated()) {
        const user = await authManager.getCurrentUser();
        Logger.section('用户信息');
        Logger.info(`用户名: ${user.username}`);
        Logger.info(`邮箱: ${user.email || '未设置'}`);
        Logger.info(`角色: ${user.role}`);
      } else {
        Logger.error('未认证，请先运行: kfc init');
        process.exit(1);
      }
    } catch (error: any) {
      Logger.error(error.message || '获取用户信息失败');
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();

