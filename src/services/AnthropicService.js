import Anthropic from '@anthropic-ai/sdk';
import { getCustomLearningPlanPrompt } from '../constants/prompt.js';

export class AnthropicService {
  constructor() {
    this.client = new Anthropic(process.env.ANTHROPIC_API_KEY);
  }

  async generateCustomLearningPlan(prompt) {
    const response = await this.client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      system: getCustomLearningPlanPrompt(),
      messages: [{ role: "user", content: prompt }]
    });

    return response;
  }
}