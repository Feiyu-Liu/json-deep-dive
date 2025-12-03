export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

export enum DataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',
  OBJECT = 'OBJECT',
  ARRAY = 'ARRAY',
  UNKNOWN = 'UNKNOWN',
}