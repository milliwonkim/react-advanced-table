import { useEffect, useState } from "react";
import type {
  AdvancedTableProps,
  ColumnDefinitionBase,
} from "../../../../types/tableTypes"; // Adjusted path
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import { useAdvancedTableInnerContext } from "../../AdvancedTableInnerContext";
import BaseUITable from "../../BaseUITable";

// 디바운스 훅 (간단한 예시)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface AdvancedTableFilterRowProps<
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
> extends Pick<
    AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>,
    "onFilterChange" | "isDebounceFilterDisabled" | "checkboxConfig"
  > {
  columnDefinitions: ColumnDefinitionBase<
    TData,
    TFilter,
    TOptions,
    THeaderOptions
  >[];
  tableGridColumns: string;
}

export const AdvancedTableFilterRow = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  onFilterChange,
  isDebounceFilterDisabled,
  checkboxConfig,
  columnDefinitions,
  tableGridColumns,
}: AdvancedTableFilterRowProps<
  TData,
  TFilter,
  TSort,
  TOptions,
  THeaderOptions
>) => {
  const { setFilter: setGlobalFilter } = useAdvancedTableContext<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >();
  const { currentLocalFilter, setLocalFilter } =
    useAdvancedTableInnerContext<TFilter>();

  const debouncedLocalFilter = useDebounce(
    currentLocalFilter,
    isDebounceFilterDisabled ? 0 : 300
  );

  useEffect(() => {
    setGlobalFilter(debouncedLocalFilter); // 디바운스된 로컬 필터를 전역 필터로 업데이트
    onFilterChange?.(debouncedLocalFilter);
  }, [debouncedLocalFilter, setGlobalFilter, onFilterChange]);

  const handleInputChange = (key: string, value: string) => {
    setLocalFilter((prev) => ({ ...prev, [key]: value } as TFilter));
  };

  return (
    <BaseUITable.HeaderRow
      gridTemplateColumns={tableGridColumns}
      className="bg-gray-50"
    >
      {checkboxConfig && (
        <BaseUITable.HeaderCell
          children={null}
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
        /> // 체크박스 컬럼 필터 공간
      )}
      {columnDefinitions.map((colDef) => {
        if (checkboxConfig && colDef.key === checkboxConfig.checkboxColumnKey)
          return null;

        // 필터 타입에 따라 다른 입력 UI 렌더링 (간단한 텍스트 입력 예시)
        return (
          <BaseUITable.HeaderCell key={`${colDef.key}-filter`} className="p-1">
            <input
              type="text"
              placeholder={
                colDef.filterPlaceholder ||
                `Filter ${colDef.label as string}...`
              }
              value={String(
                currentLocalFilter[colDef.key as keyof TFilter] ?? ""
              )}
              onChange={(e) => handleInputChange(colDef.key, e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </BaseUITable.HeaderCell>
        );
      })}
    </BaseUITable.HeaderRow>
  );
};
