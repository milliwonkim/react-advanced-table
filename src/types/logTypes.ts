/**
 * 예시 로그 데이터 타입
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  source?: string;
  user?: string;
  details?: Record<string, unknown>;
}

/**
 * 예시 로그 필터 타입
 */
export interface LogFilter {
  level?: "INFO" | "WARN" | "ERROR" | "DEBUG" | "all";
  message?: string;
  source?: string;
  user?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

/**
 * 예시 로그 정렬 타입
 * 정렬 키는 LogEntry의 키여야 하며, 값은 'asc' 또는 'desc'입니다.
 */
export type LogSort = Record<keyof LogEntry, "asc" | "desc" | undefined>;

// This could be an example of a more complex sort type if needed
// export type LogSort = {
//   field: keyof LogEntry;
//   direction: "asc" | "desc";
// } | undefined;
