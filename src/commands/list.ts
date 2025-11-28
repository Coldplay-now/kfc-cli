import { AuthManager } from '../core/auth';
import { ConfigManager } from '../core/config';
import { APIClient } from '../core/api';
import { Logger } from '../utils/logger';

export interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  fileType?: string;
  json?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
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

  // 构建查询参数
  const params: Record<string, any> = {
    page: options.page || 1,
    page_size: options.pageSize || 20,
  };

  if (options.search) {
    params.search = options.search;
  }

  if (options.fileType) {
    params.file_type = options.fileType;
  }

  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  try {
    Logger.step('获取文件列表...');
    const response = await apiClient.get(`/api/files?${queryString}`);

    if (options.json) {
      // JSON 输出
      console.log(JSON.stringify(response, null, 2));
    } else {
      // 格式化输出
      displayFileList(response);
    }
  } catch (error: any) {
    Logger.error('获取文件列表失败');
    if (error.response?.data?.detail) {
      Logger.error(error.response.data.detail);
    }
    process.exit(1);
  }
}

function displayFileList(data: any): void {
  const { total, page, page_size, items } = data;
  const totalPages = Math.ceil(total / page_size);

  Logger.section(`文件列表 (第 ${page}/${totalPages} 页，共 ${total} 个文件)`);

  if (items.length === 0) {
    Logger.info('暂无文件');
    return;
  }

  items.forEach((file: any) => {
    console.log('');
    Logger.info(`[${file.id}] ${file.title || file.filename}`);
    console.log(`    文件名: ${file.filename}`);
    console.log(`    大小: ${formatFileSize(file.file_size)}`);
    if (file.description) {
      console.log(`    描述: ${file.description}`);
    }
    if (file.created_at) {
      console.log(`    创建时间: ${file.created_at}`);
    }
  });

  console.log('');
  if (page < totalPages) {
    Logger.info(`使用 --page ${page + 1} 查看下一页`);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

