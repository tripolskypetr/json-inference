import { FormatModel } from "../model/Format.model";

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const validateToolArguments = <T = any>(
  parsedArguments: unknown,
  schema: FormatModel
): ValidationResult<T> => {
  if (parsedArguments == null) {
    if (schema?.required?.length) {
      return {
        success: false,
        error: "Tool call has empty arguments",
      };
    }
    return {
      success: true,
      data: {} as T,
    };
  }
  if (schema?.required?.length) {
    const argumentsObj = parsedArguments as Record<string, any>;
    const missingFields = schema.required.filter(
      (field: string) => !(field in argumentsObj)
    );
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }
  }

  return {
    success: true,
    data: parsedArguments as T,
  };
};

export default validateToolArguments;
