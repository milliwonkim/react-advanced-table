import React, { useTransition, useState, useEffect, useRef } from "react";
import PageLayout from "../components/layout/PageLayout";
import AdvancedTable from "../components/table/AdvancedTable";
import {
  checkboxColumnDefinition,
  columnDefinitions,
} from "../configs/columnDefinitions";
import { useFetchData } from "../services/dataService";
import type { LogEntry, LogFilter, LogSort } from "../types/logTypes";
import type { CheckboxConfig, TableRenderingType } from "../types/tableTypes";

interface TransitionTimeLog {
  from: TableRenderingType;
  to: TableRenderingType;
  duration: number;
  timestamp: string;
}

const LOCAL_STORAGE_KEY = "renderingTypeTransitionLogs";

const DataViewerPage: React.FC = () => {
  const {
    data: logData,
    isLoading,
    error,
  } = useFetchData<LogEntry>("/api/logs");

  const [selectedRowKeys, setSelectedRowKeys] = useState<
    Array<string | number>
  >([]);

  const [isPending, startTransition] = useTransition();
  const [renderingType, setRenderingType] =
    useState<TableRenderingType>("virtualized");

  const [transitionLogs, setTransitionLogs] = useState<TransitionTimeLog[]>(
    () => {
      // Load logs from localStorage on initial render
      const savedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedLogs ? JSON.parse(savedLogs) : [];
    }
  );
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const transitionStartTimeRef = useRef<number | null>(null);
  const previousRenderingTypeRef = useRef<TableRenderingType>(renderingType);

  useEffect(() => {
    // This effect runs after renderingType has been updated and the component re-rendered.
    if (
      transitionStartTimeRef.current !== null &&
      previousRenderingTypeRef.current !== renderingType
    ) {
      const endTime = performance.now();
      const duration = endTime - transitionStartTimeRef.current;
      const newLog: TransitionTimeLog = {
        from: previousRenderingTypeRef.current,
        to: renderingType,
        duration: parseFloat(duration.toFixed(2)),
        timestamp: new Date().toLocaleTimeString(),
      };
      setTransitionLogs((prevLogs) => {
        const updatedLogs = [...prevLogs, newLog];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLogs)); // Save to localStorage
        return updatedLogs;
      });
      transitionStartTimeRef.current = null;
    }
    // Update previousRenderingTypeRef for the next transition
    previousRenderingTypeRef.current = renderingType;
  }, [renderingType]);

  const handleToggleRenderingType = () => {
    transitionStartTimeRef.current = performance.now();
    previousRenderingTypeRef.current = renderingType; // Capture current type before transition
    startTransition(() => {
      setRenderingType((prev) =>
        prev === "virtualized" ? "normal" : "virtualized"
      );
    });
  };

  const clearTransitionLogs = () => {
    setTransitionLogs([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setShowOptionsMenu(false);
  };

  const checkboxConfig: CheckboxConfig<LogEntry> = {
    checkboxColumnKey: checkboxColumnDefinition.key,
    rowKeySelector: (rowData) => rowData.id,
    selectedRowKeys: selectedRowKeys,
    onSelectRow: ({ rowKey, selected }) => {
      setSelectedRowKeys((prev: Array<string | number>) =>
        selected
          ? [...prev, rowKey]
          : prev.filter((k: string | number) => k !== rowKey)
      );
    },
    onSelectAllRows: (selected) => {
      if (selected) {
        setSelectedRowKeys(logData?.map((row: LogEntry) => row.id) || []);
      } else {
        setSelectedRowKeys([]);
      }
    },
    isAllRowsSelected: logData
      ? selectedRowKeys.length === logData.length && logData.length > 0
      : false,
    isCheckOnRowClickEnabled: true,
  };

  const currentColumnDefinitions = [
    checkboxColumnDefinition,
    ...columnDefinitions,
  ];

  if (error) {
    return (
      <PageLayout title="Error" description="Failed to load data.">
        <p>데이터를 불러오는 중 오류가 발생했습니다: {error.message}</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="시스템 로그 뷰어 (SaaS Demo)"
      description="애플리케이션 로그를 검색하고 필터링합니다."
    >
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex items-center space-x-4">
          {/* Toggle Switch */}
          <label
            htmlFor="renderingTypeToggle"
            className="flex items-center cursor-pointer"
          >
            <div className="relative">
              <input
                type="checkbox"
                id="renderingTypeToggle"
                className="sr-only"
                checked={renderingType === "virtualized"}
                onChange={handleToggleRenderingType}
                disabled={isPending}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                  renderingType === "virtualized" ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              {renderingType === "virtualized" ? "Virtualized" : "Normal"}
              {isPending && " (전환중...)"}
            </div>
          </label>

          {/* Log History Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLogHistory(!showLogHistory)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              전환 기록 {showLogHistory ? "숨기기" : "보기"} (
              {transitionLogs.length})
            </button>
            {showLogHistory && transitionLogs.length > 0 && (
              <div className="absolute z-10 mt-1 w-72 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-xs">
                <ul>
                  {transitionLogs
                    .slice()
                    .reverse()
                    .map((log, index) => (
                      <li
                        key={index}
                        className="px-3 py-2 border-b last:border-b-0"
                      >
                        <span className="font-semibold">{log.timestamp}:</span>{" "}
                        {log.from} &rarr; {log.to}:{" "}
                        <span className="text-blue-600">{log.duration}ms</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {showLogHistory && transitionLogs.length === 0 && (
              <div className="absolute z-10 mt-1 w-max bg-white border border-gray-300 rounded-md shadow-lg p-2 text-xs">
                전환 기록이 없습니다.
              </div>
            )}
          </div>

          {/* Options Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              aria-label="메뉴 열기"
            >
              메뉴
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
                <ul>
                  <li>
                    <button
                      onClick={clearTransitionLogs}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      전환 기록 지우기
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Row Length Display */}
          {logData && (
            <div className="text-sm text-gray-600">
              총 {logData.length.toLocaleString()}개 로그
            </div>
          )}
        </div>

        <AdvancedTable<LogEntry, LogFilter, LogSort>
          renderingType={renderingType}
          isFetching={isLoading}
          data={logData || []}
          initialData={logData || []}
          columnDefinitions={currentColumnDefinitions}
          defaultFilter={{ level: "all" } as LogFilter}
          defaultSort={{ timestamp: "desc" } as LogSort}
          rowEstimateHeight={52}
          overscanCount={10}
          checkboxConfig={checkboxConfig}
          emptyDataMessage="표시할 로그 데이터가 없습니다."
        />
      </div>
    </PageLayout>
  );
};

export default DataViewerPage;
