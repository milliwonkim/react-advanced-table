import React from "react";
import BaseUITable from "../../BaseUITable";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import type {
  AdvancedTableBodyRowSpecificProps,
  CheckboxConfig,
  ColumnDefinitionBase,
} from "../../../../types/tableTypes"; // Adjusted path

interface AdvancedTableBodyContentProps<
  TData,
  TFilter,
  TOptions = unknown,
  THeaderOptions = unknown
> {
  data: TData[];
  columnDefinitions: ColumnDefinitionBase<
    TData,
    TFilter,
    TOptions,
    THeaderOptions
  >[];
  tableGridColumns: string;
  isFetching?: boolean;
  fetchingRowLength?: number;
  emptyDataMessage?: React.ReactNode;
  bodyRowProps?: AdvancedTableBodyRowSpecificProps<TData>;
  renderOptions?: TOptions;
  checkboxConfig?: CheckboxConfig<TData>;
}

export const AdvancedTableBodyContent = <
  TData,
  TFilter,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  data,
  columnDefinitions,
  tableGridColumns,
  isFetching,
  fetchingRowLength = 5,
  emptyDataMessage = "데이터가 없습니다.",
  bodyRowProps,
  renderOptions,
  checkboxConfig,
}: AdvancedTableBodyContentProps<TData, TFilter, TOptions, THeaderOptions>) => {
  const {
    toggleRowSelection,
    selectedRowKeys,
    rowKeySelector,
    isRowSelectable,
  } = useAdvancedTableContext<
    TData,
    TFilter,
    Record<string, unknown>,
    TOptions,
    THeaderOptions
  >(); // Explicitly type TFilter and TSort for context

  if (isFetching) {
    return Array.from({ length: fetchingRowLength }).map((_, rowIndex) => (
      <BaseUITable.BodyRow
        key={`skeleton-${rowIndex}`}
        gridTemplateColumns={tableGridColumns}
      >
        {checkboxConfig && (
          <BaseUITable.BodyCell
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
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </BaseUITable.BodyCell>
        )}
        {columnDefinitions.map((colDef) => {
          if (checkboxConfig && colDef.key === checkboxConfig.checkboxColumnKey)
            return null;
          return (
            <BaseUITable.BodyCell
              key={`${colDef.key}-skeleton-${rowIndex}`}
              className={colDef.className}
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </BaseUITable.BodyCell>
          );
        })}
      </BaseUITable.BodyRow>
    ));
  }

  if (data.length === 0) {
    return (
      <BaseUITable.BodyRow gridTemplateColumns={"1fr"} className="text-center">
        <BaseUITable.BodyCell
          colSpan={columnDefinitions.length + (checkboxConfig ? 1 : 0)}
        >
          {emptyDataMessage}
        </BaseUITable.BodyCell>
      </BaseUITable.BodyRow>
    );
  }

  return (
    <>
      {data.map((row, rowIndex) => {
        const rowKey = rowKeySelector(row);
        const isSelected = selectedRowKeys.includes(rowKey);
        const selectable = isRowSelectable(row, rowIndex);

        const handleRowClick = (event: React.MouseEvent<HTMLDivElement>) => {
          bodyRowProps?.onClick?.({ rowData: row, rowIndex, event });
          if (checkboxConfig?.isCheckOnRowClickEnabled && selectable) {
            toggleRowSelection(rowKey);
          }
        };

        return (
          <BaseUITable.BodyRow
            key={rowKey as React.Key}
            gridTemplateColumns={tableGridColumns}
            onClick={handleRowClick}
            className={bodyRowProps?.className}
            style={bodyRowProps?.style}
          >
            {checkboxConfig && (
              <BaseUITable.BodyCell
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
                {selectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation(); // 행 클릭 이벤트 전파 방지
                      toggleRowSelection(rowKey);
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                )}
              </BaseUITable.BodyCell>
            )}
            {columnDefinitions.map((colDef, colIndex) => {
              if (
                checkboxConfig &&
                colDef.key === checkboxConfig.checkboxColumnKey
              )
                return null;
              return (
                <BaseUITable.BodyCell
                  key={`${colDef.key}-${rowIndex}-${colIndex}`}
                  className={colDef.className}
                >
                  {colDef.renderCell(row, {
                    rowIndex,
                    columnIndex: colIndex,
                    options: renderOptions,
                  })}
                </BaseUITable.BodyCell>
              );
            })}
          </BaseUITable.BodyRow>
        );
      })}
    </>
  );
};
