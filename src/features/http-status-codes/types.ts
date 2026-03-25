export type StatusClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export interface HttpStatusCode {
    code: number;
    name: string;
    description: string;
    longDescription: string;
    class: StatusClass;
    category: string;
    isDeprecated?: boolean;
    spec?: string;
    useCase?: string;
}

export interface StatusFilter {
    search: string;
    selectedClass: StatusClass | 'all';
}
