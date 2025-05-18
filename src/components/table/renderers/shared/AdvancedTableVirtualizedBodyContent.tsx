import React from "react";
import BaseUITable from "../../BaseUITable";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import type {
  AdvancedTableVirtualizedBodyContentProps as AdvancedTableVirtualizedBodyContentPropsType,
  ColumnDefinitionBase, // Import for explicit typing
} from "../../../../types/tableTypes"; // Renamed import
import type { VirtualItem } from "@tanstack/react-virtual"; // Import for explicit typing

export const AdvancedTableVirtualizedBodyContent = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  rowVirtualizer,
  virtualRows,
  // rowVirtualizer, // 필요시 사용 (currently commented out in original)
  data, // 전체 processedData
  columnDefinitions,
  tableGridColumns,
  isFetching,
  fetchingRowLength = 5, // Default value from original snippet
  emptyDataMessage = "데이터가 없습니다.", // Default value from original snippet
  bodyRowProps,
  renderOptions,
  checkboxConfig,
}: AdvancedTableVirtualizedBodyContentPropsType<
  TData,
  TFilter,
  TSort,
  TOptions,
  THeaderOptions
>) => {
  const {
    toggleRowSelection,
    selectedRowKeys,
    rowKeySelector,
    isRowSelectable,
  } = useAdvancedTableContext<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >();

  if (isFetching && virtualRows.length === 0) {
    // 로딩 중인데 보여줄 가상 행이 없을 때 (초기 로딩)
    return Array.from({ length: fetchingRowLength }).map((_, skeletonIndex) => (
      <BaseUITable.BodyRow
        gridTemplateColumns={tableGridColumns}
        style={{ height: `${bodyRowProps?.style?.height || 64}px` }} // Use provided height or default
      >
        {checkboxConfig && (
          <BaseUITable.BodyCell
            style={{
              width:
                checkboxConfig.checkboxColumnKey &&
                columnDefinitions.find(
                  (
                    c: ColumnDefinitionBase<
                      TData,
                      TFilter,
                      TOptions,
                      THeaderOptions
                    >
                  ) => c.key === checkboxConfig.checkboxColumnKey
                )?.width
                  ? String(
                      columnDefinitions.find(
                        (
                          c: ColumnDefinitionBase<
                            TData,
                            TFilter,
                            TOptions,
                            THeaderOptions
                          >
                        ) => c.key === checkboxConfig.checkboxColumnKey
                      )?.width
                    )
                  : "48px",
            }}
            className="text-center"
          >
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </BaseUITable.BodyCell>
        )}
        {columnDefinitions.map(
          (
            colDef: ColumnDefinitionBase<
              TData,
              TFilter,
              TOptions,
              THeaderOptions
            >
          ) => {
            if (
              checkboxConfig &&
              colDef.key === checkboxConfig.checkboxColumnKey
            )
              return null;
            return (
              <BaseUITable.BodyCell
                key={`${colDef.key}-skeleton-${skeletonIndex}`}
                className={colDef.className}
              >
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </BaseUITable.BodyCell>
            );
          }
        )}
      </BaseUITable.BodyRow>
    ));
  }

  if (data.length === 0 && !isFetching) {
    return (
      <BaseUITable.BodyRow
        gridTemplateColumns={"1fr"}
        className="text-center"
        style={{ height: "100%" }}
      >
        <BaseUITable.BodyCell
          colSpan={columnDefinitions.length + (checkboxConfig ? 1 : 0)}
          className="flex items-center justify-center"
        >
          {emptyDataMessage}
        </BaseUITable.BodyCell>
      </BaseUITable.BodyRow>
    );
  }

  return (
    <>
      {virtualRows.map((virtualRow: VirtualItem) => {
        const rowIndex = virtualRow.index;
        const rowData = data[rowIndex];

        if (!rowData) {
          return (
            <BaseUITable.BodyRow
              key={virtualRow.key}
              rowIndex={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              gridTemplateColumns={tableGridColumns}
            >
              {/* 빈 행 또는 스켈레톤 플레이스홀더 - Can add a simple loading cell if needed */}
              {columnDefinitions.map(
                (
                  colDef: ColumnDefinitionBase<
                    TData,
                    TFilter,
                    TOptions,
                    THeaderOptions
                  >,
                  colIndex: number
                ) => (
                  <BaseUITable.BodyCell
                    key={`${colDef.key}-empty-${rowIndex}-${colIndex}`}
                    className={colDef.className}
                  >
                    &nbsp; {/* Or a skeleton div */}
                  </BaseUITable.BodyCell>
                )
              )}
            </BaseUITable.BodyRow>
          );
        }

        const rowKey = rowKeySelector(rowData);
        const isSelected = selectedRowKeys.includes(rowKey);
        const selectable = isRowSelectable(rowData, rowIndex);

        const handleRowClick = (event: React.MouseEvent<HTMLDivElement>) => {
          bodyRowProps?.onClick?.({ rowData, rowIndex, event });
          if (checkboxConfig?.isCheckOnRowClickEnabled && selectable) {
            toggleRowSelection(rowKey);
          }
        };

        return (
          <BaseUITable.BodyRow
            key={virtualRow.key} // 가상화에서는 virtualRow.key 사용
            gridTemplateColumns={tableGridColumns}
            onClick={handleRowClick}
            className={bodyRowProps?.className}
            rowIndex={virtualRow.index}
            ref={rowVirtualizer.measureElement}
            style={{
              ...bodyRowProps?.style,
            }}
          >
            {checkboxConfig && (
              <BaseUITable.BodyCell
                style={{
                  width:
                    checkboxConfig.checkboxColumnKey &&
                    columnDefinitions.find(
                      (
                        c: ColumnDefinitionBase<
                          TData,
                          TFilter,
                          TOptions,
                          THeaderOptions
                        >
                      ) => c.key === checkboxConfig.checkboxColumnKey
                    )?.width
                      ? String(
                          columnDefinitions.find(
                            (
                              c: ColumnDefinitionBase<
                                TData,
                                TFilter,
                                TOptions,
                                THeaderOptions
                              >
                            ) => c.key === checkboxConfig.checkboxColumnKey
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
                      e.stopPropagation();
                      toggleRowSelection(rowKey);
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                )}
              </BaseUITable.BodyCell>
            )}
            {columnDefinitions.map(
              (
                colDef: ColumnDefinitionBase<
                  TData,
                  TFilter,
                  TOptions,
                  THeaderOptions
                >,
                colIndex: number
              ) => {
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
                    {colDef.renderCell(rowData, {
                      rowIndex,
                      columnIndex: colIndex,
                      options: renderOptions,
                    })}
                  </BaseUITable.BodyCell>
                );
              }
            )}
          </BaseUITable.BodyRow>
        );
      })}
    </>
  );
};
