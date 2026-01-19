import type { AIProvider } from './provider.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { OllamaProvider } from './ollama.js';
import { readConfig } from '../config.js';

export function getAIProvider(): AIProvider {
  const config = readConfig();

  switch (config.aiProvider) {
    case 'openai':
      return new OpenAIProvider();
    case 'anthropic':
      return new AnthropicProvider();
    case 'ollama':
      return new OllamaProvider();
    case 'custom':
      // Custom provider uses OpenAI-compatible API
      return new OpenAIProvider();
    default:
      return new OpenAIProvider();
  }
}
