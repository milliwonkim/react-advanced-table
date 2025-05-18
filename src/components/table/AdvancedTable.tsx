import type { AdvancedTableProps } from "../../types/tableTypes"; // Adjusted path
import { AdvancedTableContextProvider } from "./AdvancedTableContext"; // Adjusted path
import { AdvancedTableNormalRenderer } from "./renderers/AdvancedTableNormalRenderer"; // Adjusted path
import { AdvancedTableVirtualizedRenderer } from "./renderers/AdvancedTableVirtualizedRenderer"; // Adjusted path

/**
 * @description 데이터 테이블을 표시하기 위한 최상위 컴포넌트입니다.
 * 정렬, 필터링, 선택(체크박스) 등의 기능을 제공하며,
 * 내부적으로 기본 테이블 UI 컴포넌트(여기서는 BaseUITable)를 사용하여 실제 테이블 UI를 구성합니다.
 *
 * 이 컴포넌트는 AdvancedTableContextProvider를 통해 상태 관리를 하며,
 * 분리된 UI 컴포넌트(Header, Body, FilterRow 등)들을 조합하여 테이블을 렌더링합니다.
 *
 * @template TData - 테이블에 표시될 행 데이터의 타입
 * @template TFilter - 필터 객체의 타입
 * @template TSort - 정렬 객체의 타입
 * @template TOptions - 각 데이터 셀의 `renderComponent` 함수에 전달될 추가 옵션 객체의 타입
 * @template THeaderOptions - 각 헤더 셀의 `renderLabel` 함수에 전달될 추가 헤더 옵션 객체의 타입
 *
 * @example
 * ```tsx
 * <AdvancedTable
 *   renderingType="normal" // "normal" 또는 "virtualized"
 *   data={yourDataArray}
 *   initialData={yourInitialDataArray}
 *   columnDefinitions={yourColumnDefinitions}
 *   // ... 기타 props
 * />
 * ```
 */
const AdvancedTable = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>(
  props: AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>
) => {
  const {
    shouldUseInternalProvider = true,
    data,
    defaultFilter,
    defaultSort,
    columnDefinitions,
    headerRenderOptions,
    renderOptions,
    initialData /* other context related props */,
  } = props;

  if (!shouldUseInternalProvider) {
    // 외부 Provider를 사용하는 경우 (컨텍스트가 이미 상위에서 제공됨)
    return <TableRendererSelector {...props} />; // Pass all props
  }

  return (
    // 내부적으로 AdvancedTableContextProvider를 사용하는 경우
    <AdvancedTableContextProvider<
      TData,
      TFilter,
      TSort,
      TOptions,
      THeaderOptions
    >
      data={data} // Pass original data to context
      initialData={initialData} // Pass initialData if available
      defaultFilter={defaultFilter}
      defaultSort={defaultSort}
      columnDefinitions={columnDefinitions}
      headerRenderOptions={headerRenderOptions}
      renderOptions={renderOptions} // Pass renderOptions to context
      checkboxConfig={props.checkboxConfig} // Pass checkboxConfig to context
      // onFilterChange and onSortChange are props of AdvancedTable, not directly part of context value but context provider uses them
      onFilterChange={props.onFilterChange} // Pass through for context to use if needed for its internal logic
      onSortChange={props.onSortChange} // Pass through for context to use if needed for its internal logic
    >
      {/* Ensure all props are passed to TableRendererSelector */}
      <TableRendererSelector {...props} />
    </AdvancedTableContextProvider>
  );
};

// 렌더링 타입에 따라 적절한 렌더러 컴포넌트를 선택
const TableRendererSelector = <
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
>(
  props: AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>
) => {
  // All props are passed down from AdvancedTable to this selector,
  // and then from this selector to the specific renderer.
  if (props.renderingType === "virtualized") {
    return <AdvancedTableVirtualizedRenderer {...props} />;
  }
  return <AdvancedTableNormalRenderer {...props} />;
};

export default AdvancedTable;
