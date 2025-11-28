import * as fs from 'fs-extra';
import * as path from 'path';
import { Platform } from './platform';

export interface Config {
  email?: string;
  username?: string;
  auth_method?: 'ssh' | 'token';
  ssh_key_path?: string;
  api_token?: string;
  default_tags?: string[];
  server?: string;
  created_at?: string;
  last_used?: string;
}

export class ConfigManager {
  private globalConfigPath: string;
  private projectConfigPath: string;

  constructor() {
    const platform = Platform.detect();
    this.globalConfigPath = path.join(platform.configDir, 'config.json');
    this.projectConfigPath = path.join(process.cwd(), '.kfc', 'config.json');
  }

  /**
   * 获取配置（合并全局和项目配置，项目配置优先级更高）
   */
  async getConfig(): Promise<Config> {
    const globalConfig = await this.loadGlobalConfig();
    const projectConfig = await this.loadProjectConfig();
    
    // 合并配置，项目配置覆盖全局配置
    return {
      ...globalConfig,
      ...projectConfig,
    };
  }

  /**
   * 获取配置值（考虑环境变量）
   */
  async getConfigValue(key: keyof Config): Promise<string | undefined> {
    // 优先级：环境变量 > 项目配置 > 全局配置 > 默认值
    
    // 环境变量
    const envKey = `KFC_${key.toUpperCase()}`;
    if (process.env[envKey]) {
      return process.env[envKey];
    }

    // 配置文件
    const config = await this.getConfig();
    return config[key] as string | undefined;
  }

  /**
   * 加载全局配置
   */
  async loadGlobalConfig(): Promise<Config> {
    try {
      if (await fs.pathExists(this.globalConfigPath)) {
        const content = await fs.readJson(this.globalConfigPath);
        return content as Config;
      }
    } catch (error) {
      // 忽略错误，返回默认配置
    }
    return this.getDefaultConfig();
  }

  /**
   * 加载项目配置
   */
  async loadProjectConfig(): Promise<Config> {
    try {
      if (await fs.pathExists(this.projectConfigPath)) {
        const content = await fs.readJson(this.projectConfigPath);
        return content as Config;
      }
    } catch (error) {
      // 忽略错误，返回空配置
    }
    return {};
  }

  /**
   * 保存全局配置
   */
  async saveGlobalConfig(config: Partial<Config>): Promise<void> {
    const existing = await this.loadGlobalConfig();
    const merged = {
      ...existing,
      ...config,
      last_used: new Date().toISOString(),
    };
    
    await fs.ensureDir(path.dirname(this.globalConfigPath));
    await fs.writeJson(this.globalConfigPath, merged, { spaces: 2 });
  }

  /**
   * 保存项目配置
   */
  async saveProjectConfig(config: Partial<Config>): Promise<void> {
    const existing = await this.loadProjectConfig();
    const merged = {
      ...existing,
      ...config,
    };
    
    await fs.ensureDir(path.dirname(this.projectConfigPath));
    await fs.writeJson(this.projectConfigPath, merged, { spaces: 2 });
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): Config {
    return {
      server: 'http://47.93.26.241',
      auth_method: 'token',
      default_tags: [],
    };
  }

  /**
   * 检查配置是否存在
   */
  async hasConfig(): Promise<boolean> {
    const globalExists = await fs.pathExists(this.globalConfigPath);
    const projectExists = await fs.pathExists(this.projectConfigPath);
    return globalExists || projectExists;
  }

  /**
   * 获取配置路径
   */
  getGlobalConfigPath(): string {
    return this.globalConfigPath;
  }

  getProjectConfigPath(): string {
    return this.projectConfigPath;
  }
}

