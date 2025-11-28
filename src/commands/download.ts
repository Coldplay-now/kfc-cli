import * as fs from 'fs-extra';
import * as path from 'path';
import { AuthManager } from '../core/auth';
import { ConfigManager } from '../core/config';
import { APIClient } from '../core/api';
import { Logger } from '../utils/logger';
import { Prompt } from '../utils/prompt';
import axios from 'axios';

export interface DownloadOptions {
  output?: string;
}

export async function downloadCommand(fileId: string, options: DownloadOptions): Promise<void> {
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

  try {
    // 获取文件信息
    Logger.step('获取文件信息...');
    const fileInfo = await apiClient.get(`/api/files/${fileId}`);

    // 确定输出路径
    const outputDir = options.output || process.cwd();
    await fs.ensureDir(outputDir);
    const outputPath = path.join(outputDir, fileInfo.filename);

    // 检查文件是否已存在
    if (await fs.pathExists(outputPath)) {
      Logger.warning(`文件已存在: ${outputPath}`);
      const overwrite = await Prompt.confirm('是否覆盖?', false);
      if (!overwrite) {
        Logger.info('下载已取消');
        return;
      }
    }

    // 下载文件
    Logger.step(`下载文件: ${fileInfo.filename}`);
    const token = process.env.KFC_TOKEN || (await configManager.getConfigValue('api_token'));
    const baseURL = apiClient.getBaseURL();
    
    const response = await axios({
      method: 'GET',
      url: `${baseURL}/api/files/${fileId}/download`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', (err) => reject(err));
    });

    Logger.success('下载完成！');
    Logger.info(`文件保存到: ${outputPath}`);
    Logger.info(`大小: ${formatFileSize(fileInfo.file_size)}`);
  } catch (error: any) {
    Logger.error('下载失败');
    if (error.response?.status === 404) {
      Logger.error('文件不存在');
    } else if (error.response?.data?.detail) {
      Logger.error(error.response.data.detail);
    }
    process.exit(1);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

