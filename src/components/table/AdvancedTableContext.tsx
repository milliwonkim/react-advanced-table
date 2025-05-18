import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AdvancedTableContextValue,
  AdvancedTableProps,
} from "../../types/tableTypes"; // Adjusted path

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdvancedTableContext = createContext<any>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdvancedTableContext<
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>() {
  const context = useContext(AdvancedTableContext);
  if (!context) {
    // Check for undefined, as the context can now be undefined initially
    throw new Error(
      "useAdvancedTableContext must be used within an AdvancedTableContextProvider"
    );
  }
  return context as AdvancedTableContextValue<
    // The cast is crucial
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >;
}

export const AdvancedTableContextProvider = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  children,
  data,
  initialData,
  columnDefinitions,
  defaultFilter,
  defaultSort,
  onFilterChange,
  onSortChange,
  renderOptions,
  headerRenderOptions,
  checkboxConfig,
}: React.PropsWithChildren<
  Pick<
    AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>,
    | "data"
    | "initialData"
    | "columnDefinitions"
    | "defaultFilter"
    | "defaultSort"
    | "onFilterChange"
    | "onSortChange"
    | "renderOptions"
    | "headerRenderOptions"
    | "checkboxConfig"
  >
>) => {
  const [currentFilter, setCurrentFilter] = useState<TFilter>(
    defaultFilter || ({} as TFilter)
  );
  const [currentSort, setCurrentSort] = useState<TSort>(
    defaultSort || ({} as TSort)
  );

  const actualOriginalData = useMemo(
    () => initialData ?? data,
    [initialData, data]
  );

  // 필터 및 정렬 적용 로직 (예시 - 실제로는 더 복잡할 수 있음)
  const processedData = useMemo(() => {
    let filteredData = [...actualOriginalData];

    // 필터링 로직 적용
    for (const key in currentFilter) {
      const value = currentFilter[key];
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === "" ||
        value === "all"
      )
        continue;
      const columnDef = columnDefinitions.find((col) => col.key === key);
      if (columnDef?.customFilterFn) {
        filteredData = filteredData.filter((item) =>
          columnDef.customFilterFn!(item, value)
        );
      } else if (columnDef?.isFilterable) {
        // 기본 텍스트 필터 (대소문자 무시, 부분 일치)
        filteredData = filteredData.filter((item) =>
          String(item[key as unknown as keyof TData])
            .toLowerCase()
            .includes(String(value).toLowerCase())
        );
      }
    }

    // 정렬 로직 적용
    const sortKey = Object.keys(currentSort)[0] as keyof TSort & string;
    const sortDirection = currentSort[sortKey] as "asc" | "desc" | undefined;

    if (sortKey && sortDirection) {
      const columnDef = columnDefinitions.find((col) => col.key === sortKey);
      if (columnDef?.customSortFn) {
        filteredData.sort((a, b) =>
          columnDef.customSortFn!(a, b, sortDirection)
        );
      } else if (columnDef?.isSortable) {
        filteredData.sort((a, b) => {
          const valA = a[sortKey as unknown as keyof TData];
          const valB = b[sortKey as unknown as keyof TData];
          if (valA < valB) return sortDirection === "asc" ? -1 : 1;
          if (valA > valB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return filteredData;
  }, [actualOriginalData, currentFilter, currentSort, columnDefinitions]);

  const tableGridColumns = useMemo(() => {
    return columnDefinitions
      .map((col) =>
        col.width
          ? typeof col.width === "number"
            ? `${col.width}px`
            : col.width
          : "1fr"
      )
      .join(" ");
  }, [columnDefinitions]);

  const setFilterHandler = useCallback(
    (filterUpdater: TFilter | ((prevFilter: TFilter) => TFilter)) => {
      setCurrentFilter((prevFilter) => {
        const newFilter =
          typeof filterUpdater === "function"
            ? (filterUpdater as (prevFilter: TFilter) => TFilter)(prevFilter)
            : filterUpdater;
        onFilterChange?.(newFilter);
        return newFilter;
      });
    },
    [onFilterChange]
  );

  const setSortHandler = useCallback(
    (sortUpdater: TSort | ((prevSort: TSort) => TSort)) => {
      setCurrentSort((prevSort) => {
        const newSort =
          typeof sortUpdater === "function"
            ? (sortUpdater as (prevSort: TSort) => TSort)(prevSort)
            : sortUpdater;
        onSortChange?.(newSort);
        return newSort;
      });
    },
    [onSortChange]
  );

  // Checkbox state and handlers
  const rowKeySelector = useCallback(
    (rowData: TData) => checkboxConfig?.rowKeySelector(rowData) ?? "",
    [checkboxConfig]
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<
    Array<string | number>
  >(checkboxConfig?.selectedRowKeys || []);

  useEffect(() => {
    if (checkboxConfig?.selectedRowKeys) {
      setSelectedRowKeys(checkboxConfig.selectedRowKeys);
    }
  }, [checkboxConfig?.selectedRowKeys]);

  const isRowSelectable = useCallback(
    (rowData: TData, rowIndex: number) => {
      return checkboxConfig?.isRowSelectable?.(rowData, rowIndex) ?? true;
    },
    [checkboxConfig]
  );

  const selectableRowCount = useMemo(
    () =>
      processedData.filter((row, index) => isRowSelectable(row, index)).length,
    [processedData, isRowSelectable]
  );

  const isAllRowsSelected = useMemo(() => {
    if (checkboxConfig?.isAllRowsSelected !== undefined)
      return checkboxConfig.isAllRowsSelected;
    if (!selectableRowCount) return false;
    return selectedRowKeys.length === selectableRowCount;
  }, [checkboxConfig, selectedRowKeys, selectableRowCount]);

  const toggleRowSelection = useCallback(
    (rowKey: string | number) => {
      setSelectedRowKeys((prevKeys) => {
        const newKeys = prevKeys.includes(rowKey)
          ? prevKeys.filter((k) => k !== rowKey)
          : [...prevKeys, rowKey];
        // Find row index for onSelectRow callback if needed
        // This is simplified; a more robust way to get rowIndex might be needed
        const rowIndex = processedData.findIndex(
          (row) => rowKeySelector(row) === rowKey
        );
        checkboxConfig?.onSelectRow?.({
          rowIndex,
          selected: newKeys.includes(rowKey),
          rowKey,
        });
        return newKeys;
      });
    },
    [checkboxConfig, processedData, rowKeySelector]
  );

  const toggleSelectAllRows = useCallback(() => {
    const newSelectedState = !isAllRowsSelected;
    setSelectedRowKeys(
      newSelectedState
        ? processedData
            .filter((row, index) => isRowSelectable(row, index))
            .map(rowKeySelector)
        : []
    );
    checkboxConfig?.onSelectAllRows?.(newSelectedState);
  }, [
    isAllRowsSelected,
    checkboxConfig,
    processedData,
    rowKeySelector,
    isRowSelectable,
  ]);

  const contextValue: AdvancedTableContextValue<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  > = {
    originalData: actualOriginalData,
    processedData,
    columnDefinitions,
    tableGridColumns,
    currentFilter,
    currentSort,
    setFilter: setFilterHandler,
    setSort: setSortHandler,
    renderOptions,
    headerRenderOptions,
    // Checkbox related
    selectedRowKeys,
    isAllRowsSelected,
    toggleRowSelection,
    toggleSelectAllRows,
    isRowSelectable,
    checkboxConfig,
    rowKeySelector,
  };

  return (
    <AdvancedTableContext.Provider value={contextValue}>
      {children}
    </AdvancedTableContext.Provider>
  );
};
