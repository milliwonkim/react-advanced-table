import type { AdvancedTableProps } from "../../../types/tableTypes"; // Corrected path
import { useAdvancedTableContext } from "../AdvancedTableContext";
import { AdvancedTableInnerContextProvider } from "../AdvancedTableInnerContext";
import BaseUITable from "../BaseUITable";
import { AdvancedTableBodyContent } from "./shared/AdvancedTableBodyContent";
import { AdvancedTableFilterRow } from "./shared/AdvancedTableFilterRow";
import { AdvancedTableHeaderContent } from "./shared/AdvancedTableHeaderContent";

export const AdvancedTableNormalRenderer = <
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
    onSortChange,
    headerRenderOptions,
    checkboxConfig,
    isFetching,
    fetchingRowLength = 10, // Default from snippet
    emptyDataMessage = "표시할 데이터가 없습니다.", // Default from snippet
    onFilterChange, // Added to pass down to AdvancedTableFilterRow
  } = props;

  const {
    processedData,
    columnDefinitions,
    currentFilter,
    tableGridColumns,
    originalData,
  } = useAdvancedTableContext<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >();

  const displayData = processedData;

  return (
    <BaseUITable.Container className="flex-1 overflow-auto contain-strict">
      <BaseUITable.Header className="sticky top-0 z-10 bg-white shadow-sm">
        <AdvancedTableHeaderContent<
          TData,
          TFilter,
          TSort,
          TOptions,
          THeaderOptions
        >
          headerRenderOptions={headerRenderOptions}
          originalData={originalData} // Changed from props.data to context's originalData
          onSortChange={onSortChange}
          checkboxConfig={checkboxConfig}
          columnDefinitions={columnDefinitions}
          tableGridColumns={tableGridColumns}
        />
        <AdvancedTableInnerContextProvider<TFilter> filter={currentFilter}>
          <AdvancedTableFilterRow<
            TData,
            TFilter,
            TSort,
            TOptions,
            THeaderOptions
          >
            onFilterChange={onFilterChange} // Pass from props
            isDebounceFilterDisabled={isDebounceFilterDisabled}
            checkboxConfig={checkboxConfig}
            columnDefinitions={columnDefinitions}
            tableGridColumns={tableGridColumns}
          />
        </AdvancedTableInnerContextProvider>
      </BaseUITable.Header>
      <BaseUITable.Body>
        <AdvancedTableBodyContent<TData, TFilter, TOptions, THeaderOptions> // Added TFilter
          {...props} // Pass all relevant props like bodyRowProps, renderOptions
          data={displayData}
          isFetching={isFetching}
          fetchingRowLength={fetchingRowLength}
          emptyDataMessage={emptyDataMessage}
          columnDefinitions={columnDefinitions}
          tableGridColumns={tableGridColumns}
          // checkboxConfig and renderOptions are already part of props spread
        />
      </BaseUITable.Body>
    </BaseUITable.Container>
  );
};
