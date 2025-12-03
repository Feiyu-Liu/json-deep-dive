import { DataType, JsonValue } from '../types';

export const getDataType = (value: JsonValue): DataType => {
  if (value === null) return DataType.NULL;
  if (Array.isArray(value)) return DataType.ARRAY;
  if (typeof value === 'object') return DataType.OBJECT;
  if (typeof value === 'string') return DataType.STRING;
  if (typeof value === 'number') return DataType.NUMBER;
  if (typeof value === 'boolean') return DataType.BOOLEAN;
  return DataType.UNKNOWN;
};

export const safeJsonParse = (input: string): { parsed: JsonValue | undefined; error: string | null } => {
  try {
    const parsed = JSON.parse(input);
    return { parsed, error: null };
  } catch (err) {
    let errorMessage = "Invalid JSON";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return { parsed: undefined, error: errorMessage };
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy", err);
    return false;
  }
};
