export class SearchService {
    constructor() {
        this.API_KEY = process.env.GOOGLE_API_KEY;
        this.SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
    }

    async getTopResults(query) {
        const response = await fetch(
            `https://www.googleapis.com/customsearch/v1?key=${this.API_KEY}&cx=${this.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=3`
        );
        const data = await response.json();
        return data.items?.slice(0, 3).map(item => item.link) || [];
    }
}