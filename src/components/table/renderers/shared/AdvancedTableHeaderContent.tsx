import {
  AdvancedTableProps,
  ColumnDefinitionBase,
} from "../../../../types/tableTypes";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import BaseUITable from "../../BaseUITable";

import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface AdvancedTableHeaderContentProps<
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
> extends Pick<
    AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>,
    "headerRenderOptions" | "onSortChange" | "checkboxConfig"
  > {
  originalData: TData[];
  columnDefinitions: ColumnDefinitionBase<
    TData,
    TFilter,
    TOptions,
    THeaderOptions
  >[];
  tableGridColumns: string;
}

export const AdvancedTableHeaderContent = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  headerRenderOptions,
  originalData,
  onSortChange,
  checkboxConfig,
  columnDefinitions,
  tableGridColumns,
}: AdvancedTableHeaderContentProps<
  TData,
  TFilter,
  TSort,
  TOptions,
  THeaderOptions
>) => {
  const {
    currentSort,
    setSort,
    toggleSelectAllRows,
    isAllRowsSelected,
    isRowSelectable,
    processedData,
  } = useAdvancedTableContext<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >();

  const handleSort = (columnKey: string) => {
    const currentDirection = currentSort[columnKey as keyof TSort] as
      | "asc"
      | "desc"
      | undefined;
    let newDirection: "asc" | "desc" | undefined;

    if (currentDirection === "asc") {
      newDirection = "desc";
    } else if (currentDirection === "desc") {
      newDirection = undefined; // Clears sort for this column
    } else {
      newDirection = "asc";
    }

    // Create a new sort object. For single column sort, it will have one key or be empty.
    // If TSort represents multi-column sort, this logic would need adjustment.
    // Assuming TSort is like { [key: string]: 'asc' | 'desc' | undefined }
    const newSortObject: Record<string, "asc" | "desc" | undefined> = {};
    if (newDirection) {
      newSortObject[columnKey] = newDirection;
    }
    // If newDirection is undefined, the key is omitted, effectively clearing sort for that column or all sort if it was the only one.

    setSort(newSortObject as TSort); // Cast to TSort
    onSortChange?.(newSortObject as TSort);
  };

  // Use processedData to determine if any rows are selectable, as originalData might not be filtered yet
  const canSelectAny = processedData.some((row, index) =>
    isRowSelectable(row, index)
  );

  return (
    <BaseUITable.HeaderRow gridTemplateColumns={tableGridColumns}>
      {checkboxConfig && (
        <BaseUITable.HeaderCell
          style={{
            width:
              checkboxConfig.checkboxColumnKey &&
              columnDefinitions.find(
                (c) => c.key === checkboxConfig.checkboxColumnKey
              )?.width
                ? String(
                    columnDefinitions.find(
                      (c) => c.key === checkboxConfig.checkboxColumnKey
                    )?.width
                  )
                : "48px",
          }}
          className="text-center"
        >
          {canSelectAny && (
            <input
              type="checkbox"
              checked={isAllRowsSelected}
              onChange={toggleSelectAllRows}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
          )}
        </BaseUITable.HeaderCell>
      )}
      {columnDefinitions.map((colDef) => {
        if (checkboxConfig && colDef.key === checkboxConfig.checkboxColumnKey)
          return null; // Checkbox column handled

        const sortDirection = currentSort[colDef.key as keyof TSort];
        return (
          <BaseUITable.HeaderCell
            key={colDef.key}
            className={colDef.className}
            onClick={
              colDef.isSortable ? () => handleSort(colDef.key) : undefined
            }
            style={{ cursor: colDef.isSortable ? "pointer" : "default" }}
          >
            <div className="flex items-center justify-between">
              {colDef.renderHeaderLabel
                ? colDef.renderHeaderLabel({
                    label: colDef.label,
                    currentFilter: {} as TFilter, // Placeholder, get from context if needed for header
                    allData: originalData, // originalData is correct here for general purpose header label renderers
                    headerOptions: headerRenderOptions,
                  })
                : colDef.label}
              {colDef.isSortable && sortDirection === "asc" && (
                <FaArrowUp className="ml-1 text-gray-500" size={12} />
              )}
              {colDef.isSortable && sortDirection === "desc" && (
                <FaArrowDown className="ml-1 text-gray-500" size={12} />
              )}
            </div>
          </BaseUITable.HeaderCell>
        );
      })}
    </BaseUITable.HeaderRow>
  );
};
