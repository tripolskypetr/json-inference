export interface FormatModel {
    type: string;
    required: string[];
    properties: {
        [key: string]: {
            type: string;
            description: string;
            enum?: string[];
        };
    };
}
