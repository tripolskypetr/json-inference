export type FormatProperty =
    | { type: "string"; description: string; enum?: string[] }
    | { type: "number"; description: string }
    | { type: "integer"; description: string }
    | { type: "boolean"; description: string }
    | { type: "array"; description: string }
    | { type: "object"; description: string };

export interface FormatModel {
    type: string;
    required: string[];
    properties: {
        [key: string]: FormatProperty;
    };
}

type InferProperty<T> = T extends { type: "string" }
    ? string
    : T extends { type: "number" }
        ? number
        : T extends { type: "integer" }
            ? number
            : T extends { type: "boolean" }
                ? boolean
                : T extends { type: "array" }
                    ? any[]
                    : T extends { type: "object" }
                        ? Record<string, any>
                        : any;

export type InferFormat<T extends FormatModel> = {
    [K in keyof T["properties"]]: InferProperty<T["properties"][K]>;
};
