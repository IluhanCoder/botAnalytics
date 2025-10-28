import { StopwordFetchResponse } from '../../../shared/types/stopword-types';
import api from "../api"

interface DefaultStopwordsResponse {
    defaultStopwords: string[];
    disabledStopwords: string[];
}

export default new class StopwordService {
    async createStopword(content: string) {
        await api.post("/stopword", {content});
    }

    async deleteStopwordById(id: string) {
        await api.delete(`/stopword/${id}`);
    }

    async fetchStopWords(): Promise<StopwordFetchResponse> {
        return (await api.get("/stopword")).data as StopwordFetchResponse;
    }

    async fetchDefaultStopwords(): Promise<DefaultStopwordsResponse> {
        return (await api.get<DefaultStopwordsResponse>("/stopword/default/list")).data;
    }

    async toggleDefaultStopword(word: string, enabled: boolean): Promise<void> {
        await api.post("/stopword/default/toggle", { word, enabled });
    }
}