import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { ConfigManager } from './config';
import { Logger } from '../utils/logger';

export class APIClient {
  private client: AxiosInstance;
  private configManager: ConfigManager;
  private baseURL: string;

  constructor() {
    this.configManager = new ConfigManager();
    // 从环境变量或默认值获取服务器地址
    this.baseURL = process.env.KFC_API_URL || process.env.KFC_SERVER || 'http://47.93.26.241';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  /**
   * 初始化 API 客户端（设置认证信息和服务器地址）
   */
  async initialize(): Promise<void> {
    // 从配置读取服务器地址（如果环境变量未设置）
    if (!process.env.KFC_API_URL && !process.env.KFC_SERVER) {
      const server = await this.configManager.getConfigValue('server');
      if (server) {
        this.setBaseURL(server);
      }
    }
    
    const token = await this.getAuthToken();
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }


  /**
   * 获取认证 Token
   */
  private async getAuthToken(): Promise<string | null> {
    // 优先使用环境变量
    if (process.env.KFC_TOKEN) {
      return process.env.KFC_TOKEN;
    }

    // 从配置读取
    const token = await this.configManager.getConfigValue('api_token');
    return token || null;
  }

  /**
   * 设置 Token
   */
  setToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * 清除 Token
   */
  clearToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * 文件上传（multipart/form-data）
   */
  async uploadFile(
    url: string,
    filePath: string,
    fields?: Record<string, string>,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const form = new FormData();
    
    form.append('file', fs.createReadStream(filePath));
    
    if (fields) {
      Object.entries(fields).forEach(([key, value]) => {
        if (value) {
          form.append(key, value);
        }
      });
    }

    try {
      const response = await this.client.post(url, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * 错误处理
   */
  private handleError(error: any): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        Logger.error('认证失败：Token 无效或已过期');
        if (data.detail) {
          Logger.error(data.detail);
        }
      } else if (status === 403) {
        Logger.error('权限不足');
        if (data.detail) {
          Logger.error(data.detail);
        }
      } else if (status === 404) {
        Logger.error('资源不存在');
        if (data.detail) {
          Logger.error(data.detail);
        }
      } else if (status >= 500) {
        Logger.error('服务器错误');
        if (data.detail) {
          Logger.error(data.detail);
        }
      } else {
        Logger.error(`请求失败: ${data.detail || error.message}`);
      }
    } else if (error.request) {
      Logger.error('网络错误：无法连接到服务器');
      Logger.debug(`服务器地址: ${this.baseURL}`);
    } else {
      Logger.error(`错误: ${error.message}`);
    }
  }

  /**
   * 获取基础 URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * 设置基础 URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.client.defaults.baseURL = url;
  }
}

