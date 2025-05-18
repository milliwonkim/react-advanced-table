import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react"; // Added useEffect
import type { AdvancedTableProps } from "../../../types/tableTypes"; // Adjusted path
import { useAdvancedTableContext } from "../AdvancedTableContext";
import { AdvancedTableInnerContextProvider } from "../AdvancedTableInnerContext";
import BaseUITable from "../BaseUITable";
import { AdvancedTableFilterRow } from "./shared/AdvancedTableFilterRow";
import { AdvancedTableHeaderContent } from "./shared/AdvancedTableHeaderContent";
import { AdvancedTableVirtualizedBodyContent } from "./shared/AdvancedTableVirtualizedBodyContent";

export const AdvancedTableVirtualizedRenderer = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>(
  props: AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>
) => {
  const {
    isDebounceFilterDisabled,
    onSortChange: propOnSortChange, // Renamed to avoid conflict
    onFilterChange: propOnFilterChange, // Renamed to avoid conflict
    headerRenderOptions,
    checkboxConfig,
    isFetching,
    fetchingRowLength = 10, // Default from snippet
    emptyDataMessage = "표시할 데이터가 없습니다.", // Default from snippet
    rowEstimateHeight = 64, // Default from snippet
    overscanCount = 5, // Default from snippet
  } = props;

  const headerElementRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    processedData,
    columnDefinitions,
    currentFilter,
    tableGridColumns,
    originalData,
    currentSort,
  } = useAdvancedTableContext<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >();

  const displayData = processedData;

  const rowVirtualizer: Virtualizer<HTMLDivElement, Element> = useVirtualizer({
    count: displayData.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowEstimateHeight,
    overscan: overscanCount,
    measureElement:
      typeof ResizeObserver !== "undefined"
        ? (element) => (element as HTMLElement).offsetHeight
        : undefined,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Effect to scroll to top when filter or sort changes
  useEffect(() => {
    if (rowVirtualizer) {
      rowVirtualizer.scrollToIndex(0, { align: "start", behavior: "auto" });
    }
  }, [currentFilter, currentSort, rowVirtualizer]);

  const handleSortChange = (newSort: TSort) => {
    // newSort is passed by HeaderContent
    // Scroll to top is handled by useEffect now
    propOnSortChange?.(newSort);
  };

  const handleFilterChange = (newFilter: TFilter) => {
    // newFilter is passed from FilterRow
    // Scroll to top is handled by useEffect now
    propOnFilterChange?.(newFilter);
  };

  // const headerHeight = headerElementRef.current?.offsetHeight ?? 0; // Not directly used in the return structure

  return (
    // The main scroll container
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto relative w-full contain-strict"
    >
      {/* Header is sticky to the scroll container */}
      <BaseUITable.Header
        ref={headerElementRef}
        className="sticky top-0 z-20 bg-white shadow-sm w-full"
      >
        <AdvancedTableHeaderContent<
          TData,
          TFilter,
          TSort,
          TOptions,
          THeaderOptions
        >
          headerRenderOptions={headerRenderOptions}
          originalData={originalData} // Use originalData from context
          onSortChange={handleSortChange} // Use wrapped handler
          checkboxConfig={checkboxConfig}
          columnDefinitions={columnDefinitions}
          tableGridColumns={tableGridColumns}
        />
        <AdvancedTableInnerContextProvider filter={currentFilter}>
          <AdvancedTableFilterRow<
            TData,
            TFilter,
            TSort,
            TOptions,
            THeaderOptions
          >
            onFilterChange={handleFilterChange} // Use wrapped handler
            isDebounceFilterDisabled={isDebounceFilterDisabled}
            checkboxConfig={checkboxConfig}
            columnDefinitions={columnDefinitions}
            tableGridColumns={tableGridColumns}
          />
        </AdvancedTableInnerContextProvider>
      </BaseUITable.Header>

      {/* Virtualized Body relative to the scroll container, but occupies full height with an offset for content */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {/* This container is absolutely positioned and transformed to achieve virtualization */}
        <BaseUITable.Container
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${virtualRows[0]?.start ?? 0}px)`,
            height: "auto",
          }}
        >
          <BaseUITable.Body>
            <AdvancedTableVirtualizedBodyContent<
              TData,
              TFilter,
              TSort,
              TOptions,
              THeaderOptions
            >
              {...props} // Pass relevant props like bodyRowProps, renderOptions
              virtualRows={virtualRows}
              rowVirtualizer={rowVirtualizer}
              data={displayData}
              isFetching={isFetching}
              fetchingRowLength={fetchingRowLength}
              emptyDataMessage={emptyDataMessage}
              columnDefinitions={columnDefinitions}
              tableGridColumns={tableGridColumns}
              // checkboxConfig, renderOptions, bodyRowProps are spread via {...props}
            />
          </BaseUITable.Body>
        </BaseUITable.Container>
      </div>
    </div>
  );
};
