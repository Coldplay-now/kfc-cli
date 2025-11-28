import * as fs from 'fs-extra';
import * as path from 'path';
import { AuthManager } from '../core/auth';
import { ConfigManager } from '../core/config';
import { APIClient } from '../core/api';
import { Logger } from '../utils/logger';

export interface UploadOptions {
  title?: string;
  description?: string;
  tags?: string;
  recursive?: boolean;
}

export async function uploadCommand(filePath: string, options: UploadOptions): Promise<void> {
  const configManager = new ConfigManager();
  const apiClient = new APIClient();
  await apiClient.initialize();
  const authManager = new AuthManager(apiClient, configManager);

  // 初始化认证
  await authManager.initialize();

  // 检查认证
  if (!(await authManager.isAuthenticated())) {
    Logger.error('未认证，请先运行: kfc init');
    process.exit(1);
  }

  // 检查文件是否存在
  if (!(await fs.pathExists(filePath))) {
    Logger.error(`文件不存在: ${filePath}`);
    process.exit(1);
  }

  const stats = await fs.stat(filePath);
  
  if (stats.isDirectory()) {
    if (!options.recursive) {
      Logger.error('这是一个目录，请使用 -r 或 --recursive 选项');
      process.exit(1);
    }
    await uploadDirectory(filePath, options, apiClient);
  } else {
    await uploadFile(filePath, options, apiClient);
  }
}

async function uploadFile(
  filePath: string,
  options: UploadOptions,
  apiClient: APIClient
): Promise<void> {
  const fileName = path.basename(filePath);
  Logger.step(`上传文件: ${fileName}`);

  // 准备上传字段
  const fields: Record<string, string> = {};
  if (options.title) {
    fields.title = options.title;
  }
  if (options.description) {
    fields.description = options.description;
  }
  if (options.tags) {
    fields.tags = options.tags;
  }

  // 显示进度
  let lastProgress = 0;
  const onProgress = (progress: number) => {
    if (progress !== lastProgress) {
      process.stdout.write(`\r上传进度: ${progress}%`);
      lastProgress = progress;
    }
  };

  try {
    const response = await apiClient.uploadFile(
      '/api/files',
      filePath,
      fields,
      onProgress
    );

    console.log(''); // 换行
    Logger.success('上传成功！');
    Logger.info(`文件 ID: ${response.id}`);
    Logger.info(`文件名: ${response.filename}`);
    Logger.info(`大小: ${formatFileSize(response.file_size)}`);
    Logger.info(`创建时间: ${response.created_at}`);
  } catch (error: any) {
    console.log(''); // 换行
    Logger.error('上传失败');
    if (error.response?.data?.detail) {
      Logger.error(error.response.data.detail);
    }
    process.exit(1);
  }
}

async function uploadDirectory(
  dirPath: string,
  options: UploadOptions,
  apiClient: APIClient
): Promise<void> {
  Logger.step(`上传目录: ${dirPath}`);

  const files = await fs.readdir(dirPath);
  const filePaths: string[] = [];
  
  // 过滤出文件（排除目录）
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.stat(filePath);
    if (stat.isFile()) {
      filePaths.push(filePath);
    }
  }

  Logger.info(`找到 ${filePaths.length} 个文件`);

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    Logger.info(`[${i + 1}/${filePaths.length}] ${path.basename(filePath)}`);
    await uploadFile(filePath, options, apiClient);
  }

  Logger.success(`目录上传完成！共上传 ${filePaths.length} 个文件`);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

