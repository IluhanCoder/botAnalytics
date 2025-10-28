export interface IDataset {
    uploadedAt: Date,
    content: string
}

export type DatasetDocument = IDataset & Document;
export type DatasetResponse = IDataset & {_id: string};

export type DatasetFetchResponse = {
    datasets: DatasetResponse[]
};

export type entities = {
    persons: any,
    organisations: any,
    places: any
}

export type AnalyticsResponse = {
    text: string,
    cleaned: string,
    tokens: string[],
    stemmed: string[],
    sentiment: {
        score: any,
        comparative: any
    },
    topics: any,
    entities: {
        entity: string,
        text: string
    }[],
    keywords: any,
    keyPhrases: any,
    category: string
}

export type AnalyticsPostResponse = {
    success: boolean,
    result: AnalyticsResponse[]
}

export interface AnalyticsResult {
    result: AnalyticsResponse[],
    dataset: { type: any, ref: "Dataset" }
}

export type AnalyticsResultDocument = AnalyticsResult & Document;