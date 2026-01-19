import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  aiProvider: 'openai' | 'anthropic' | 'ollama' | 'custom';
  apiKey?: string;
  apiBaseUrl?: string;
  aiModel: string;
  aiEnabled: boolean;
  instantAnalysis: boolean;
  cacheEnabled: boolean;
  maxTokensPerRequest?: number;
  rateLimitPerMinute?: number;
}

const DEFAULT_CONFIG: Config = {
  aiProvider: 'openai',
  apiBaseUrl: 'https://api.openai.com/v1',
  aiModel: 'gpt-4o-mini',
  aiEnabled: false,
  instantAnalysis: true,
  cacheEnabled: true,
  maxTokensPerRequest: 1000,
  rateLimitPerMinute: 10,
};

/**
 * Get the path to the config file
 */
export function getConfigPath(): string {
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, '.lifebetter');
  return path.join(configDir, 'config.json');
}

/**
 * Ensure config directory exists
 */
function ensureConfigDir(): void {
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, '.lifebetter');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

/**
 * Read configuration from disk
 */
export function readConfig(): Config {
  ensureConfigDir();
  const configPath = getConfigPath();

  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(data) as Config;
      // Merge with defaults for any missing fields
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (error) {
    console.error('Warning: Could not read config file, using defaults');
  }

  return DEFAULT_CONFIG;
}

/**
 * Write configuration to disk
 */
export function writeConfig(config: Config): void {
  ensureConfigDir();
  const configPath = getConfigPath();

  try {
    const data = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, data, 'utf-8');
  } catch (error) {
    console.error('Error: Could not write config file');
    throw error;
  }
}

/**
 * Update a single config value
 */
export function setConfigValue(key: keyof Config, value: any): void {
  const config = readConfig();
  (config as any)[key] = value;
  writeConfig(config);
}

/**
 * Get a single config value
 */
export function getConfigValue(key: keyof Config): any {
  const config = readConfig();
  return config[key];
}

/**
 * Check if AI is configured and enabled
 */
export function isAIEnabled(): boolean {
  const config = readConfig();
  return config.aiEnabled && !!config.apiKey;
}

/**
 * Mask API key for display
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '***';
  return `${apiKey.substring(0, 3)}***...***${apiKey.substring(apiKey.length - 3)}`;
}
