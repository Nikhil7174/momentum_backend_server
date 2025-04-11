import { AnthropicService } from '../services/AnthropicService.js';

export class PersonalizedLearningController {
    constructor() {
        this.anthropicService = new AnthropicService();
    }

    async generatePlan(req, res) {
        try {
            const { hobbyName, currentSkillLevel, desiredSkillLevel, timeCommitment } = req.body;

            if (!hobbyName || !currentSkillLevel || !desiredSkillLevel || !timeCommitment) {
                return res.status(400).json({
                    error: 'Missing one or more required fields: hobbyName, currentSkillLevel, desiredSkillLevel, timeCommitment'
                });
            }

            const userPrompt = `
                    Hobby: ${hobbyName}
                    Current Skill Level: ${currentSkillLevel}
                    Desired Skill Level: ${desiredSkillLevel}
                    Time Commitment (hours per week): ${timeCommitment}
                    `;

            const response = await this.anthropicService.generateCustomLearningPlan(userPrompt);

            return res.json(response);
        } catch (error) {
            console.error('Error generating personalized learning plan:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
