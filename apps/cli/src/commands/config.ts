import prompts from 'prompts';
import { readConfig, writeConfig, maskApiKey, type Config } from '../config.js';
import * as ui from '../ui.js';
import chalk from 'chalk';

export async function configCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  if (!subcommand || subcommand === 'show') {
    showConfig();
  } else if (subcommand === 'set') {
    await setConfig(args.slice(1));
  } else if (subcommand === 'setup') {
    await setupWizard();
  } else {
    ui.error(`Unknown config command: ${subcommand}`);
    console.log('Usage:');
    console.log('  lb config show          Show current configuration');
    console.log('  lb config set <key> <value>   Set a configuration value');
    console.log('  lb config setup         Run interactive setup wizard');
    process.exit(1);
  }
}

function showConfig(): void {
  const config = readConfig();

  ui.header('LifeBetter Configuration', '⚙️');

  ui.configDisplay({
    'AI Provider': config.aiProvider,
    'API Base URL': config.apiBaseUrl || 'default',
    'API Key': config.apiKey ? maskApiKey(config.apiKey) : 'not set',
    'AI Model': config.aiModel,
    'AI Enabled': config.aiEnabled ? 'yes' : 'no',
    'Instant Analysis': config.instantAnalysis ? 'yes' : 'no',
    'Cache Enabled': config.cacheEnabled ? 'yes' : 'no',
    'Max Tokens': config.maxTokensPerRequest?.toString() || 'default',
    'Rate Limit': `${config.rateLimitPerMinute || 'default'} calls/min`
  });
}

async function setConfig(args: string[]): Promise<void> {
  if (args.length < 2) {
    ui.error('Missing key or value');
    console.log('Usage: lb config set <key> <value>');
    console.log('\nAvailable keys:');
    console.log('  ai-provider, api-key, api-base-url, ai-model');
    console.log('  ai-enabled, instant-analysis, cache-enabled');
    console.log('  max-tokens, rate-limit');
    process.exit(1);
  }

  const key = args[0];
  const value = args.slice(1).join(' ');
  const config = readConfig();

  switch (key) {
    case 'ai-provider':
      if (!['openai', 'anthropic', 'ollama', 'custom'].includes(value)) {
        ui.error('Invalid provider. Must be: openai, anthropic, ollama, or custom');
        process.exit(1);
      }
      config.aiProvider = value as Config['aiProvider'];
      break;

    case 'api-key':
      config.apiKey = value;
      break;

    case 'api-base-url':
      config.apiBaseUrl = value;
      break;

    case 'ai-model':
      config.aiModel = value;
      break;

    case 'ai-enabled':
      config.aiEnabled = value.toLowerCase() === 'true' || value === '1';
      break;

    case 'instant-analysis':
      config.instantAnalysis = value.toLowerCase() === 'true' || value === '1';
      break;

    case 'cache-enabled':
      config.cacheEnabled = value.toLowerCase() === 'true' || value === '1';
      break;

    case 'max-tokens':
      config.maxTokensPerRequest = parseInt(value, 10);
      break;

    case 'rate-limit':
      config.rateLimitPerMinute = parseInt(value, 10);
      break;

    default:
      ui.error(`Unknown config key: ${key}`);
      process.exit(1);
  }

  writeConfig(config);
  ui.success(`Configuration updated: ${key} = ${key === 'api-key' ? maskApiKey(value) : value}`);
}

async function setupWizard(): Promise<void> {
  ui.header('LifeBetter AI Configuration Setup', '🚀');

  const responses = await prompts([
    {
      type: 'select',
      name: 'aiProvider',
      message: 'Choose AI provider:',
      choices: [
        { title: 'OpenAI (GPT-4, GPT-4o)', value: 'openai' },
        { title: 'Anthropic (Claude)', value: 'anthropic' },
        { title: 'Ollama (Local models)', value: 'ollama' },
        { title: 'Custom (Enter base URL)', value: 'custom' },
      ],
      initial: 0,
    },
    {
      type: (prev) => prev === 'custom' || prev === 'ollama' ? 'text' : null,
      name: 'apiBaseUrl',
      message: 'Enter API base URL:',
      initial: (prev: string) => prev === 'ollama' ? 'http://localhost:11434/v1' : '',
    },
    {
      type: (prev, values) => values.aiProvider !== 'ollama' ? 'password' : null,
      name: 'apiKey',
      message: 'Enter API key:',
    },
    {
      type: 'text',
      name: 'aiModel',
      message: 'Enter AI model name:',
      initial: (prev: any, values: any) => {
        if (values.aiProvider === 'openai') return 'gpt-4o-mini';
        if (values.aiProvider === 'anthropic') return 'claude-3-5-sonnet-20241022';
        if (values.aiProvider === 'ollama') return 'llama3';
        return 'gpt-4o-mini';
      },
    },
    {
      type: 'confirm',
      name: 'instantAnalysis',
      message: 'Enable instant analysis after logging problems?',
      initial: true,
    },
    {
      type: 'confirm',
      name: 'aiEnabled',
      message: 'Enable AI features now?',
      initial: true,
    },
  ]);

  if (Object.keys(responses).length === 0) {
    ui.warning('Setup cancelled');
    return;
  }

  const config = readConfig();

  config.aiProvider = responses.aiProvider || config.aiProvider;
  if (responses.apiBaseUrl) config.apiBaseUrl = responses.apiBaseUrl;
  if (responses.apiKey) config.apiKey = responses.apiKey;
  config.aiModel = responses.aiModel || config.aiModel;
  config.instantAnalysis = responses.instantAnalysis ?? config.instantAnalysis;
  config.aiEnabled = responses.aiEnabled ?? config.aiEnabled;

  writeConfig(config);

  ui.success('Configuration saved!');
  console.log('\nYou can now use AI features:');
  console.log(chalk.cyan('  lb p "problem"') + chalk.gray('     - Log with instant AI analysis'));
  console.log(chalk.cyan('  lb review') + chalk.gray('          - Review your problems'));
  console.log(chalk.cyan('  lb summary') + chalk.gray('         - Get daily summary\n'));
}
