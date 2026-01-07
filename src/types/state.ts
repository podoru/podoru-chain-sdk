/**
 * Single state entry
 */
export interface StateEntry {
  key: string;
  value: string;
}

/**
 * Result of a prefix query
 */
export interface PrefixQueryResult {
  prefix: string;
  count: number;
  results: Record<string, string>;
}

/**
 * State value response
 */
export interface StateValueResponse {
  key: string;
  value: string;
}
