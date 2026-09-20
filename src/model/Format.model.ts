export type FormatItems =
    | { type: "string"; description?: string; enum?: string[] }
    | { type: "number"; description?: string }
    | { type: "integer"; description?: string }
    | { type: "boolean"; description?: string }
    | { type: "array"; description?: string; items?: FormatItems; minItems?: number; maxItems?: number }
    | { type: "object"; description?: string; required?: string[]; properties?: { [key: string]: FormatProperty } };

export type FormatProperty =
    | { type: "string"; description: string; enum?: string[] }
    | { type: "number"; description: string }
    | { type: "integer"; description: string }
    | { type: "boolean"; description: string }
    | { type: "array"; description: string; items?: FormatItems; minItems?: number; maxItems?: number }
    | { type: "object"; description: string; required?: string[]; properties?: { [key: string]: FormatProperty } };

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
                : T extends { type: "array"; items: infer I }
                    ? InferProperty<I>[]
                    : T extends { type: "array" }
                        ? any[]
                        : T extends { type: "object"; properties: infer P }
                            ? { [K in keyof P]: InferProperty<P[K]> }
                            : T extends { type: "object" }
                                ? Record<string, any>
                                : any;

export type InferFormat<T extends FormatModel> = {
    [K in keyof T["properties"]]: InferProperty<T["properties"][K]>;
};
