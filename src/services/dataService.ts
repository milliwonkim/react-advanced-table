import React from "react";
import type { LogEntry, LogFilter, LogSort } from "../types/logTypes";

// Mock Data
const allLogs: LogEntry[] = Array.from({ length: 10000 }, (_, i) => ({
  id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  level: (["INFO", "WARN", "ERROR", "DEBUG"] as LogEntry["level"][])[
    Math.floor(Math.random() * 4)
  ],
  message:
    `This is a log message number ${i + 1}. ` +
    (Math.random() > 0.7
      ? "Something critical happened here with details."
      : "Just a regular operational log."),
  source: [
    "AuthService",
    "PaymentGateway",
    "UserDB",
    "NotificationService",
    "APIGateway",
  ][Math.floor(Math.random() * 5)],
  user:
    Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
  details:
    Math.random() > 0.8
      ? {
          code: Math.floor(Math.random() * 500) + 100,
          data: { info: "extra data" },
        }
      : undefined,
}));

interface BaseFetchDataResponse<TItem> {
  data: TItem[] | null;
  isLoading: boolean;
  error: Error | null;
}

// Define the return type for the useFetchData hook
interface UseFetchDataHookResponse<TItem> extends BaseFetchDataResponse<TItem> {
  setFilter: React.Dispatch<React.SetStateAction<LogFilter | undefined>>;
  setSort: React.Dispatch<React.SetStateAction<LogSort | undefined>>;
}

// Mock fetch function
const mockFetch = <TItem>(
  endpoint: string,
  filter?: LogFilter,
  sort?: LogSort
): Promise<TItem[]> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (endpoint === "/api/logs") {
        let dataToReturn = [...allLogs] as unknown as TItem[];

        // Apply filtering (simplified example)
        if (filter) {
          let filteredLogs = [...allLogs];
          if (filter.level && filter.level !== "all") {
            filteredLogs = filteredLogs.filter(
              (log) => log.level === filter.level
            );
          }
          if (filter.message) {
            filteredLogs = filteredLogs.filter((log) =>
              log.message.toLowerCase().includes(filter.message!.toLowerCase())
            );
          }
          if (filter.source) {
            filteredLogs = filteredLogs.filter((log) =>
              log.source?.toLowerCase().includes(filter.source!.toLowerCase())
            );
          }
          if (filter.user) {
            filteredLogs = filteredLogs.filter((log) =>
              log.user?.toLowerCase().includes(filter.user!.toLowerCase())
            );
          }
          dataToReturn = filteredLogs as unknown as TItem[];
        }

        // Apply sorting (simplified example - only first sort key)
        if (sort && Object.keys(sort).length > 0) {
          const sortableData = [...(dataToReturn as unknown as LogEntry[])];
          const sortKey = Object.keys(sort)[0] as keyof LogEntry;
          const sortDirection = sort[sortKey];

          if (sortKey && sortDirection) {
            sortableData.sort((a, b) => {
              const valA = a[sortKey];
              const valB = b[sortKey];

              if (valA === undefined || valA === null)
                return sortDirection === "asc" ? -1 : 1;
              if (valB === undefined || valB === null)
                return sortDirection === "asc" ? 1 : -1;

              if (typeof valA === "string" && typeof valB === "string") {
                return sortDirection === "asc"
                  ? valA.localeCompare(valB)
                  : valB.localeCompare(valA);
              }
              if (valA < valB) return sortDirection === "asc" ? -1 : 1;
              if (valA > valB) return sortDirection === "asc" ? 1 : -1;
              return 0;
            });
            dataToReturn = sortableData as unknown as TItem[];
          }
        }
        resolve(dataToReturn);
      } else {
        reject(new Error("Unknown API endpoint"));
      }
    }, 500 + Math.random() * 1000);
  });
};

export const useFetchData = <TItem>(
  endpoint: string,
  initialFilter?: LogFilter,
  initialSort?: LogSort
): UseFetchDataHookResponse<TItem> => {
  const [data, setData] = React.useState<TItem[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [filter, setFilter] = React.useState<LogFilter | undefined>(
    initialFilter
  );
  const [sort, setSort] = React.useState<LogSort | undefined>(initialSort);

  React.useEffect(() => {
    setIsLoading(true);
    mockFetch<TItem>(endpoint, filter, sort)
      .then((responseData) => {
        setData(responseData);
        setError(null);
      })
      .catch((fetchError) => {
        setError(fetchError as Error);
        setData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [endpoint, filter, sort]);

  return { data, isLoading, error, setFilter, setSort };
};
