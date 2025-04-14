import { google } from 'googleapis';

export class YouTubeService {
    constructor() {
        this.youtube = google.youtube('v3');
        this.API_KEY = process.env.GOOGLE_API_KEY;
    }

    async searchVideos(query) {
        const response = await this.youtube.search.list({
            key: this.API_KEY,
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 5,
            videoDuration: 'medium',
            videoDefinition: 'high',
        });

        return response.data.items.map(item => ({
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
    }
}