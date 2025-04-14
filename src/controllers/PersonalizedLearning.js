import { AnthropicService } from '../services/AnthropicService.js';
import { YouTubeService } from '../services/YouTubeService.js';
import { SearchService } from '../services/SearchService.js';

export class PersonalizedLearningController {
    constructor() {
        this.anthropicService = new AnthropicService();
        this.youtubeService = new YouTubeService();
        this.searchService = new SearchService();
    }

    async generatePlan(req, res) {
        try {
            const { hobbyName, currentSkillLevel, desiredSkillLevel, timeCommitment } = req.body;

            if (!hobbyName || !currentSkillLevel || !desiredSkillLevel || !timeCommitment) {
                console.error('Missing one or more required fields:', { hobbyName, currentSkillLevel, desiredSkillLevel, timeCommitment });
                return res.status(400).json({
                    error: 'Missing one or more required fields'
                });
            }

            const userPrompt = `
                Hobby: ${hobbyName}
                Current Skill Level: ${currentSkillLevel}
                Desired Skill Level: ${desiredSkillLevel}
                Time Commitment (hours per week): ${timeCommitment}
            `;

            const claudeResponse = await this.anthropicService.generateCustomLearningPlan(userPrompt);
            const learningPlan = JSON.parse(claudeResponse.content[0].text);
            const enhancedPlan = await this.enhancePlanWithResources(learningPlan);

            return res.json(enhancedPlan);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async enhancePlanWithResources(plan) {
        const enhancedWeeks = [];

        for (const week of plan.weeks) {
            const enhancedWeek = {
                week: week.week,
                youtubeVideos: [],
                learningArticles: []
            };

            for (const videoQuery of week.youtubeVideos) {
                try {
                    const videos = await this.youtubeService.searchVideos(videoQuery.query);
                    const scoredVideos = videos.map(video => {
                        const score = this.calculateVideoRelevanceScore(video, videoQuery.query);
                        return {
                            ...video,
                            score
                        };
                    });

                    const topVideo = scoredVideos.sort((a, b) => b.score - a.score)[0];

                    if (topVideo) {
                        enhancedWeek.youtubeVideos.push({
                            title: topVideo.title,
                            url: topVideo.url
                        });
                    }
                } catch (error) {
                    console.error(`YouTube search error for query "${videoQuery.query}": ${error.message}`);
                }
            }

            for (const articleQuery of week.learningArticles) {
                try {
                    const articleUrls = await this.searchService.getTopResults(articleQuery.query);
                    const scoredArticles = articleUrls.map(url => {
                        const score = this.calculateArticleRelevanceScore(url, articleQuery.query);
                        return {
                            url,
                            score
                        };
                    });

                    const topArticle = scoredArticles.sort((a, b) => b.score - a.score)[0];

                    if (topArticle) {
                        const urlObj = new URL(topArticle.url);
                        const domain = urlObj.hostname.replace('www.', '');
                        const title = `${this.capitalizeFirstLetter(articleQuery.query)} | ${domain}`;
                        enhancedWeek.learningArticles.push({
                            title: title,
                            url: topArticle.url
                        });
                    }
                } catch (error) {
                    console.error(`Article search error for query "${articleQuery.query}": ${error.message}`);
                }
            }

            enhancedWeeks.push(enhancedWeek);
        }

        return { weeks: enhancedWeeks };
    }

    calculateVideoRelevanceScore(video, query) {
        const queryKeywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
        let score = 0;
        const title = video.title.toLowerCase();
        const description = video.snippet?.description?.toLowerCase() || '';

        queryKeywords.forEach(keyword => {
            if (title.includes(keyword)) score += 3;
            if (description.includes(keyword)) score += 1;
        });

        if (title.includes(query.toLowerCase())) score += 5;

        if (video.statistics) {
            const viewCount = parseInt(video.statistics.viewCount) || 0;
            const likeCount = parseInt(video.statistics.likeCount) || 0;
            score += Math.min(viewCount / 10000, 3);
            score += Math.min(likeCount / 1000, 2);
        }

        return score;
    }

    calculateArticleRelevanceScore(url, query) {
        const queryKeywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
        let score = 0;
        const urlString = url.toLowerCase();

        queryKeywords.forEach(keyword => {
            if (urlString.includes(keyword)) score += 2;
        });

        const urlObj = new URL(url);
        const domain = urlObj.hostname.toLowerCase();

        if (domain.includes('.edu')) score += 5;
        if (domain.includes('.org')) score += 3;
        if (domain.includes('.gov')) score += 4;
        if (domain.includes('blog') && !domain.includes('.medium.com')) score -= 1;

        const qualityDomains = [
            'khan', 'coursera', 'udemy', 'linkedin', 'medium',
            'wikipedia', 'youtube', 'harvard', 'mit', 'stanford',
            'howtogeek', 'tutorial', 'guide', 'learn'
        ];

        qualityDomains.forEach(qualityTerm => {
            if (domain.includes(qualityTerm)) score += 2;
        });

        return score;
    }

    capitalizeFirstLetter(string) {
        return string
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
