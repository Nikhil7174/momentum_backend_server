import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { PersonalizedLearningController } from './src/controllers/PersonalizedLearning.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json({ limit: '10mb' }));

const personalizedLearningController = new PersonalizedLearningController();
app.post(
    '/generate-personalized-learning',
    personalizedLearningController.generatePlan.bind(personalizedLearningController)
);

(async () => {
  try {
    app.listen(3000, () => {
      console.log('API running on port 3000');
      console.log('Endpoints:');
      console.log('- POST /generate-personalized-learning');
    });
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
})();