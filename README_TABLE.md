대규모 데이터를 테이블 형태로 보여줘야 하는 웹 애플리케이션에서 성능은 사용자 경험에 매우 중요한 요소입니다. 특히 한 번에 수백, 수천 개의 행을 렌더링해야 할 경우, 브라우저는 버벅거리거나 심지어 멈춰버릴 수도 있습니다. 이러한 문제를 해결하기 위한 강력한 기술 중 하나가 바로 **가상화(Virtualization)**입니다.

이번 글에서는 **한 애플리케이션**에서 사용되는 `AdvancedTable`이라는 범용 테이블 컴포넌트를 중심으로, 가상화가 적용되지 않은 일반 테이블과 가상화가 적용된 테이블의 차이점을 자세히 알아보고, 언제 어떤 방식을 선택해야 하는지에 대한 가이드를 제시하고자 합니다.

## `AdvancedTable` 컴포넌트 개요

`AdvancedTable`은 애플리케이션에서 다양한 데이터를 테이블 형태로 표시하기 위해 만들어진 고기능 컴포넌트입니다. 이 컴포넌트는 정렬, 필터링, 선택(체크박스) 등 테이블이 갖춰야 할 핵심 기능들을 제공하며, `renderingType` prop을 통해 **일반 렌더링 방식 (`'normal'`)**과 **가상화 렌더링 방식 (`'virtualized'`)**을 선택할 수 있도록 설계되었습니다.

## `BaseUITable` (기본 테이블 UI) 컴포넌트 소개

`AdvancedTable`의 내부에서는 `BaseUITable`이라는 컴포넌트를 사용하여 실제 HTML 테이블 구조를 만듭니다. `BaseUITable`은 테이블의 기본적인 시각적 표현과 레이아웃을 담당하는 저수준(low-level) UI 컴포넌트입니다. CSS Grid와 Flexbox를 사용하여 유연한 레이아웃을 구현합니다.

`BaseUITable`은 다음과 같은 하위 컴포넌트들의 네임스페이스(namespace) 또는 집합체(collection) 형태로 제공되어, 조합을 통해 테이블을 구성합니다:

- `BaseUITable.Container`: 테이블 전체를 감싸는 최상위 컨테이너입니다.
- `BaseUITable.Header`: 테이블 헤더 영역을 정의합니다.
- `BaseUITable.HeaderRow`: 헤더 내의 각 행을 정의하며, `gridTemplateColumns` prop을 통해 컬럼 레이아웃을 설정합니다.
- `BaseUITable.HeaderCell`: 헤더 행 내부의 각 셀을 정의합니다.
- `BaseUITable.Body`: 테이블 본문 영역을 정의합니다.
- `BaseUITable.BodyRow`: 본문 내의 각 데이터 행을 정의하며, 역시 `gridTemplateColumns`로 컬럼 레이아웃을 설정합니다.
- `BaseUITable.BodyCell`: 본문 행 내부의 각 데이터 셀을 정의합니다.

이러한 구조는 HTML의 `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` 태그와 유사한 역할을 하지만, `div`와 CSS를 사용하여 더 유연한 스타일링과 레이아웃 제어를 가능하게 합니다.

```typescript
import React, { forwardRef, HTMLAttributes } from "react";
import { classNamesUtil } from "../utils/classNamesUtil"; // TailwindCSS 같은 클래스 조합 유틸리티

// Props Interfaces
export interface BaseTableContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface BaseTableBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface BaseTableHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface BaseTableHeaderRowProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gridTemplateColumns: string;
}

export interface BaseTableHeaderCellProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rowIndex?: number; // 다중 헤더 행을 위한 인덱스
  isMainHeader?: boolean; // 주 헤더 여부 (스타일링 목적)
  containerClassName?: string;
  hasDivider?: boolean; // 구분선 여부
}

export interface BaseTableBodyRowProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gridTemplateColumns: string;
}

export interface BaseTableBodyCellProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isLastRowCell?: boolean; // 마지막 행의 셀 여부 (스타일링 목적)
  colSpan?: number;
  rowSpan?: number;
}

// Component Implementations
const BaseTableContainer = forwardRef<HTMLDivElement, BaseTableContainerProps>(
  ({ children, className, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil(
          "table-ui-container",
          "relative flex flex-col h-full w-full",
          className
        )}
      >
        {children}
      </div>
    );
  }
);
BaseTableContainer.displayName = "BaseTableContainer";

const BaseTableBody = forwardRef<HTMLDivElement, BaseTableBodyProps>(
  ({ children, className, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil("table-ui-body", "w-full flex-1", className)}
      >
        {children}
      </div>
    );
  }
);
BaseTableBody.displayName = "BaseTableBody";

const BaseTableHeader = forwardRef<HTMLDivElement, BaseTableHeaderProps>(
  ({ children, className, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil("table-ui-header", "w-full", className)}
      >
        {children}
      </div>
    );
  }
);
BaseTableHeader.displayName = "BaseTableHeader";

const BaseTableHeaderRow = forwardRef<HTMLDivElement, BaseTableHeaderRowProps>(
  ({ children, gridTemplateColumns, className, style, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil("table-ui-header-row", "w-full", className)}
        style={{
          display: "grid",
          gridTemplateColumns,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
BaseTableHeaderRow.displayName = "BaseTableHeaderRow";

const BaseTableHeaderCell = forwardRef<
  HTMLDivElement,
  BaseTableHeaderCellProps
>(
  (
    {
      children,
      rowIndex = 0,
      isMainHeader,
      className,
      containerClassName,
      hasDivider,
      style,
      ...restProps
    },
    ref
  ) => {
    // 예시: rowIndex와 isMainHeader에 따른 스타일 분기
    const paddingStyle = rowIndex === 0 ? "p-[0_12px]" : "p-[0_4px]";
    const mainHeaderStyles = isMainHeader ? "border-t-[1px] bg-gray-100" : "";

    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil(
          "table-ui-header-cell",
          "text-sm font-semibold text-gray-600 text-left align-middle",
          "border-solid border-t-gray-300 border-b-gray-300 border-b-[1px]",
          paddingStyle,
          mainHeaderStyles,
          className
        )}
        style={style}
      >
        <div
          className={classNamesUtil(
            "flex items-center min-h-[40px] relative",
            containerClassName
          )}
        >
          {isMainHeader && hasDivider && (
            <div
              className={classNamesUtil(
                "table-ui-divider",
                "bg-gray-200 h-[16px] w-[1px] absolute left-[-12px]"
              )}
            />
          )}
          <div className="children-wrapper w-full align-middle">{children}</div>
        </div>
      </div>
    );
  }
);
BaseTableHeaderCell.displayName = "BaseTableHeaderCell";

const BaseTableBodyRow = forwardRef<HTMLDivElement, BaseTableBodyRowProps>(
  ({ children, gridTemplateColumns, className, style, ...restProps }, ref) => {
    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil(
          "table-ui-body-row",
          "border-b border-gray-200 hover:bg-gray-50",
          className
        )}
        style={{
          display: "grid",
          gridTemplateColumns,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
BaseTableBodyRow.displayName = "BaseTableBodyRow";

const BaseTableBodyCell = forwardRef<HTMLDivElement, BaseTableBodyCellProps>(
  (
    {
      children,
      isLastRowCell,
      className,
      colSpan,
      rowSpan,
      style,
      ...restProps
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        {...restProps}
        className={classNamesUtil(
          "table-ui-body-cell",
          "p-[8px_12px] flex items-center text-sm text-gray-700",
          className
        )}
        data-is-last-row-cell={isLastRowCell || undefined}
        style={{
          gridColumn: colSpan ? `span ${colSpan}` : undefined,
          gridRow: rowSpan ? `span ${rowSpan}` : undefined,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
BaseTableBodyCell.displayName = "BaseTableBodyCell";

// 모든 하위 컴포넌트를 포함하는 객체로 export
const BaseUITable = {
  Container: BaseTableContainer,
  Body: BaseTableBody,
  Header: BaseTableHeader,
  HeaderRow: BaseTableHeaderRow,
  HeaderCell: BaseTableHeaderCell,
  BodyRow: BaseTableBodyRow,
  BodyCell: BaseTableBodyCell,
};

export default BaseUITable;
```

`AdvancedTableNormalRenderer`와 `AdvancedTableVirtualizedRenderer` 컴포넌트는 이 `BaseUITable`의 하위 컴포넌트들을 사용하여 테이블의 실제 마크업을 생성합니다.

## 가상화(Virtualization)란 무엇인가?

테이블 가상화는 간단히 말해 **"화면에 보이는 부분만 렌더링하는 기술"**입니다. 전체 데이터셋이 아무리 크더라도, 사용자가 현재 스크롤 해서 보고 있는 영역의 행들만 DOM에 그리고, 스크롤이 이동함에 따라 실시간으로 해당 영역의 행들을 교체해 보여줍니다.

**장점:**

- **엄청난 성능 향상:** 수천, 수만 개의 행도 거뜬히 처리할 수 있습니다. DOM 요소의 수를 최소화하여 렌더링 및 리플로우/리페인트 비용을 대폭 줄입니다.
- **메모리 사용량 감소:** 실제 DOM에 추가되는 요소가 적으므로 메모리 사용량이 줄어듭니다.
- **초기 로딩 속도 개선:** 화면에 보이는 부분만 먼저 렌더링하므로 초기 로딩 속도가 빠릅니다.

**단점:**

- **구현 복잡도 증가:** 직접 구현하려면 스크롤 위치 계산, 아이템 크기 측정 등 고려할 사항이 많습니다. (다행히 `AdvancedTable`은 `@tanstack/react-virtual` 같은 라이브러리를 활용합니다.)
- **모든 상황에 적합하지 않음:** 데이터의 양이 적거나, 각 행의 높이가 매우 동적인 경우 오히려 오버헤드가 발생할 수 있습니다.
- **미세한 스크롤 경험 차이:** 일반 스크롤과 비교했을 때 약간의 이질감이 느껴질 수 있습니다. (하지만 대부분의 라이브러리가 이를 최소화합니다.)

## 1. 일반 테이블 렌더링 (`renderingType="normal"`)

`AdvancedTable`에서 `renderingType` prop을 `normal`로 설정하면, 내부적으로 `AdvancedTableNormalRenderer` 컴포넌트가 사용됩니다. 이 방식은 전통적인 테이블 렌더링 방식을 따릅니다.

**동작 방식:**

- 테이블에 제공된 모든 데이터를 한 번에 DOM으로 렌더링합니다.
- 데이터가 많을수록 DOM 요소의 수가 증가하고, 이는 브라우저 성능에 직접적인 영향을 미칩니다.

```typescript
import React from "react";
import { useAdvancedTableContext } from "../AdvancedTableContext"; // 가상 경로
import BaseUITable from "../BaseUITable"; // 가상 경로
import type { AdvancedTableProps, ColumnDefinition } from "../types/tableTypes"; // 가상 경로
import { AdvancedTableHeaderContent } from "./shared/AdvancedTableHeaderContent"; // 가상 경로
import { AdvancedTableBodyContent } from "./shared/AdvancedTableBodyContent"; // 가상 경로
import { AdvancedTableFilterRow } from "./shared/AdvancedTableFilterRow"; // 가상 경로
import { AdvancedTableInnerContextProvider } from "../AdvancedTableInnerContext"; // 가상 경로

export const AdvancedTableNormalRenderer = <
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
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
    fetchingRowLength = 10, // 로딩 중 표시될 스켈레톤 행 수
    emptyDataMessage = "표시할 데이터가 없습니다.",
  } = props;

  const { processedData, columnDefinitions, currentFilter, tableGridColumns } =
    useAdvancedTableContext<TData, TFilter, TSort, TOptions, THeaderOptions>();

  const displayData = processedData; // 정렬 및 필터링이 적용된 데이터

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
          originalData={props.data} // 정렬/필터 전 데이터 (필요시 사용)
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
            onFilterChange={props.onFilterChange}
            isDebounceFilterDisabled={isDebounceFilterDisabled}
            checkboxConfig={checkboxConfig}
            columnDefinitions={columnDefinitions}
            tableGridColumns={tableGridColumns}
          />
        </AdvancedTableInnerContextProvider>
      </BaseUITable.Header>
      <BaseUITable.Body>
        <AdvancedTableBodyContent<
          TData,
          TFilter,
          TSort,
          TOptions,
          THeaderOptions
        >
          {...props} // bodyRowProps, options 등 전달
          data={displayData}
          isFetching={isFetching}
          fetchingRowLength={fetchingRowLength}
          emptyDataMessage={emptyDataMessage}
          columnDefinitions={columnDefinitions}
          tableGridColumns={tableGridColumns}
        />
      </BaseUITable.Body>
    </BaseUITable.Container>
  );
};
```

**장점:**

- **구현 단순성:** 가상화 로직이 없어 상대적으로 코드가 단순합니다.
- **적은 데이터에 적합:** 수십 개 정도의 적은 데이터를 표시할 때는 가상화의 오버헤드 없이 충분히 빠릅니다.
- **자연스러운 스크롤:** 브라우저 기본 스크롤 동작을 그대로 사용합니다.

**단점:**

- **대량 데이터 처리 시 성능 저하:** 데이터 양이 많아질수록 급격한 성능 저하가 발생합니다.
- **높은 메모리 사용량:** 모든 DOM 요소를 메모리에 유지합니다.

## 2. 가상화 테이블 렌더링 (`renderingType="virtualized"`)

`AdvancedTable`에서 `renderingType` prop을 `virtualized`로 설정하면, 내부적으로 `AdvancedTableVirtualizedRenderer` 컴포넌트가 사용됩니다. 이 컴포넌트는 `@tanstack/react-virtual` 라이브러리를 활용하여 가상 스크롤을 구현합니다.

**동작 방식:**

- 테이블 컨테이너의 크기와 각 행의 예상 높이를 기반으로 현재 화면에 보여야 할 항목들만 계산합니다.
- 스크롤 이벤트가 발생하면, 새롭게 보여야 할 항목들을 계산하여 기존 항목들을 교체합니다.
- 실제 DOM에는 소수의 행만 존재하게 됩니다.

```typescript
import React, { useRef } from "react";
import { useAdvancedTableContext } from "../AdvancedTableContext"; // 가상 경로
import BaseUITable from "../BaseUITable"; // 가상 경로
import type { AdvancedTableProps } from "../types/tableTypes"; // 가상 경로
import { AdvancedTableHeaderContent } from "./shared/AdvancedTableHeaderContent"; // 가상 경로
import { AdvancedTableVirtualizedBodyContent } from "./shared/AdvancedTableVirtualizedBodyContent"; // 가상 경로
import { AdvancedTableFilterRow } from "./shared/AdvancedTableFilterRow"; // 가상 경로
import { AdvancedTableInnerContextProvider } from "../AdvancedTableInnerContext"; // 가상 경로
import { useVirtualizer, Virtualizer } from "@tanstack/react-virtual"; // 가상화 라이브러리

export const AdvancedTableVirtualizedRenderer = <
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
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
    fetchingRowLength = 10,
    emptyDataMessage = "표시할 데이터가 없습니다.",
    rowEstimateHeight = 64, // 행 추정 높이 (가상화에 중요)
    overscanCount = 5, // 화면 밖에 미리 렌더링 할 행 수
  } = props;

  const headerElementRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { processedData, columnDefinitions, currentFilter, tableGridColumns } =
    useAdvancedTableContext<TData, TFilter, TSort, TOptions, THeaderOptions>();

  const displayData = processedData;

  // 가상화 설정
  const rowVirtualizer: Virtualizer<HTMLDivElement, Element> = useVirtualizer({
    count: displayData.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowEstimateHeight,
    overscan: overscanCount,
    measureElement:
      typeof ResizeObserver !== "undefined"
        ? (element) => element.getBoundingClientRect().height
        : undefined, // 행 높이 동적 측정 (선택적)
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalVirtualHeight = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0;

  // 정렬 또는 필터 변경 시 스크롤 최상단으로 이동
  const handleSortChange = () => {
    rowVirtualizer.scrollToIndex(0, { behavior: "auto" });
    onSortChange?.();
  };

  const handleFilterChange = () => {
    rowVirtualizer.scrollToIndex(0, { behavior: "auto" });
    props.onFilterChange?.();
  };

  const headerHeight = headerElementRef.current?.offsetHeight ?? 0;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-auto contain-strict relative"
    >
      <div
        style={{
          height: `${totalVirtualHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <BaseUITable.Container
          className="absolute top-0 left-0 w-full"
          style={{ transform: `translateY(${paddingTop}px)` }}
        >
          {/* 헤더는 가상화 영역 밖에 고정으로 위치시키고, 패딩으로 밀어낸 본문 위에 겹쳐 보이도록 함 */}
          {/* 실제로는 헤더도 스크롤 컨테이너 내부에 있어야 transform의 영향을 받지 않고 고정됨 */}
          {/* 여기서는 설명을 위해 분리된 것처럼 표현, 실제 구현시에는 sticky 헤더 스타일링 필요 */}

          <BaseUITable.Body>
            {/* 가상화된 본문 렌더링 */}
            <AdvancedTableVirtualizedBodyContent<
              TData,
              TFilter,
              TSort,
              TOptions,
              THeaderOptions
            >
              {...props} // bodyRowProps, options 등 전달
              virtualRows={virtualRows}
              rowVirtualizer={rowVirtualizer} // virtualizer 인스턴스 전달
              data={displayData} // 실제로는 virtualRows에 매핑된 부분만 사용
              isFetching={isFetching}
              fetchingRowLength={fetchingRowLength}
              emptyDataMessage={emptyDataMessage}
              columnDefinitions={columnDefinitions}
              tableGridColumns={tableGridColumns}
            />
          </BaseUITable.Body>
        </BaseUITable.Container>
      </div>
      {/* 헤더는 스크롤 컨테이너의 자식으로 두되, sticky로 고정 */}
      <BaseUITable.Header
        ref={headerElementRef}
        className="sticky top-0 z-10 bg-white shadow-sm w-full"
      >
        <AdvancedTableHeaderContent<
          TData,
          TFilter,
          TSort,
          TOptions,
          THeaderOptions
        >
          headerRenderOptions={headerRenderOptions}
          originalData={props.data}
          onSortChange={handleSortChange}
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
            onFilterChange={handleFilterChange}
            isDebounceFilterDisabled={isDebounceFilterDisabled}
            checkboxConfig={checkboxConfig}
            columnDefinitions={columnDefinitions}
            tableGridColumns={tableGridColumns}
          />
        </AdvancedTableInnerContextProvider>
      </BaseUITable.Header>
    </div>
  );
};
```

`AdvancedTableVirtualizedBodyContent` 내부에서는 `rowVirtualizer.getVirtualItems()`를 통해 얻은 `virtualRows` 배열을 순회하며, 각 아이템의 `index`, `start` (y축 시작 위치), `size` (높이) 값을 사용하여 실제 DOM 요소를 렌더링하고 위치시킵니다. (이때 `BaseUITable.BodyRow`와 `BaseUITable.BodyCell`이 사용됩니다.)

**장점:**

- **대량 데이터의 효율적 처리:** 수천, 수만 건의 데이터도 부드럽게 스크롤하며 표시할 수 있습니다.
- **낮은 메모리 사용량 및 빠른 초기 로딩:** 일반 테이블 방식에 비해 현저히 우수합니다.

**단점:**

- **`estimateSize`의 중요성:** 각 행의 높이를 정확히 추정하는 것이 중요합니다. 행 높이가 매우 가변적이고 예측하기 어려우면 스크롤 시 미세한 떨림(jitter)이 발생하거나 스크롤바 크기가 부정확하게 표시될 수 있습니다. `measureElement` 옵션을 통해 동적으로 측정할 수 있지만, 성능에 영향을 줄 수 있습니다.
- **복잡한 상호작용:** 가상화된 항목들은 DOM에서 계속 교체되므로, 특정 행에 대한 참조를 유지하거나 복잡한 DOM 조작을 하는 경우 주의가 필요합니다.
- **약간의 개발 오버헤드:** 라이브러리를 사용하더라도 가상화의 개념을 이해하고 적용하는 데 약간의 학습 곡선이 있습니다.

## 언제 어떤 방식을 선택해야 할까?

| 특징               | 일반 테이블 (`renderingType="normal"`) | 가상화 테이블 (`renderingType="virtualized"`) |
| :----------------- | :------------------------------------- | :-------------------------------------------- |
| **데이터 양**      | 적을 때 (수십 ~ 백여 개 미만)          | 많을 때 (수백 개 이상)                        |
| **성능**           | 데이터 양 증가 시 급격히 저하          | 데이터 양에 비교적 덜 민감                    |
| **초기 로딩 속도** | 느릴 수 있음 (데이터 양 비례)          | 빠름                                          |
| **메모리 사용량**  | 높음                                   | 낮음                                          |
| **구현 복잡도**    | 낮음                                   | 상대적으로 높음 (라이브러리 사용 시 완화)     |
| **스크롤 경험**    | 자연스러움                             | 약간의 이질감 가능성 (미미함)                 |
| **행 높이**        | 가변적이어도 문제 없음                 | 고정 또는 예측 가능할 때 최적                 |

**다음과 같은 경우 가상화 테이블 (`renderingType="virtualized"`) 사용을 강력히 권장합니다:**

- 테이블에 표시해야 할 데이터가 **수백 개 이상**으로 예상될 때 (예: 로그 데이터, 사용자 목록, 상품 목록 등)
- **성능이 매우 중요**하고, 부드러운 스크롤 경험을 제공해야 할 때
- 각 행의 높이가 **거의 일정하거나, `estimateSize` 및 `measureElement`를 통해 합리적으로 관리**될 수 있을 때

**다음과 같은 경우 일반 테이블 (`renderingType="normal"`)을 고려할 수 있습니다:**

- 표시할 데이터가 **항상 수십 개 미만**으로 매우 적을 때
- 각 행의 높이가 매우 동적이고 예측 불가능하며, 가상화로 인한 이점보다 구현/관리 비용이 더 크다고 판단될 때 (하지만 이 경우에도 데이터가 조금만 많아져도 성능 문제가 발생할 수 있음을 인지해야 합니다.)
- 매우 간단한 테이블을 빠르게 구현해야 할 때 (하지만 장기적으로는 가상화를 염두에 두는 것이 좋습니다.)

## 결론

`AdvancedTable`과 같은 범용 테이블 컴포넌트는 `renderingType` prop을 통해 일반 렌더링과 가상화 렌더링 방식을 유연하게 선택할 수 있도록 함으로써, 다양한 상황에 대처할 수 있는 잘 설계된 컴포넌트입니다. 그 내부에서는 `BaseUITable`과 같은 기본 UI 빌딩 블록을 사용하여 일관된 테이블 구조를 제공합니다.

대부분의 모던 웹 애플리케이션에서 대량의 데이터를 다루는 것은 흔한 일이며, 이때 **가상화는 필수적인 최적화 기법**입니다. `@tanstack/react-virtual`과 같은 성숙한 라이브러리를 활용하면 가상화 구현의 복잡성을 크게 낮추면서도 뛰어난 성능을 얻을 수 있습니다.

테이블을 구현할 때는 항상 데이터의 예상 크기와 성능 요구사항을 고려하여, 사용자에게 최상의 경험을 제공할 수 있는 렌더링 방식을 선택하는 것이 중요합니다.

---

## 전체 소스 코드 예시 (TypeScript)

아래는 이 글에서 설명한 주요 컴포넌트 및 타입의 전체 소스 코드 예시입니다. 실제 프로젝트에서는 파일 구조, 유틸리티 함수, 스타일링 방식 등이 다를 수 있습니다.

### 1. 타입 정의 (`./types/tableTypes.ts`)

```typescript
import React, { ReactNode, MouseEvent } from "react";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";

/**
 * @description 테이블 렌더링 방식을 정의합니다.
 * - 'normal': 모든 데이터를 한 번에 렌더링합니다.
 * - 'virtualized': 화면에 보이는 부분만 렌더링합니다.
 */
export type TableRenderingType = "normal" | "virtualized";

/**
 * @description 테이블 행 아이템의 기본 타입을 정의합니다.
 */
export const TABLE_ROW_ITEM_TYPE = {
  DEFAULT: "default",
  PARENT: "parent", // 그룹화된 행의 부모
  CHILD: "child", // 그룹화된 행의 자식
} as const;

export type TableRowItemType =
  (typeof TABLE_ROW_ITEM_TYPE)[keyof typeof TABLE_ROW_ITEM_TYPE];

/**
 * @description 테이블 행 클릭 시 전달되는 파라미터 타입입니다.
 * @template TData - 행 데이터의 타입
 */
export interface HandleRowClickParams<TData> {
  rowData: TData;
  rowIndex: number;
  event: MouseEvent<HTMLDivElement>; // BaseUITable.BodyRow가 div로 구현됨
}

/**
 * @description AdvancedTable의 본문 각 행에 적용될 props 타입입니다.
 * @template TData - 행 데이터의 타입
 */
export interface AdvancedTableBodyRowSpecificProps<TData> {
  type: TableRowItemType;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (params: HandleRowClickParams<TData>) => void;
}

/**
 * @description 체크박스 기능 설정을 위한 타입입니다.
 * @template TData - 행 데이터의 타입
 */
export interface CheckboxConfig<TData> {
  checkboxColumnKey: string; // 컬럼 정의에서 체크박스 컬럼을 식별하는 키
  isRowSelectable?: (rowData: TData, rowIndex: number) => boolean;
  rowKeySelector: (rowData: TData) => string | number; // 각 행의 고유 키 반환
  selectedRowKeys?: Array<string | number>;
  isCheckOnRowClickEnabled?: boolean;
  onSelectRow?: (params: {
    rowIndex: number;
    selected: boolean;
    rowKey: string | number;
  }) => void;
  onSelectAllRows?: (selected: boolean) => void;
  isAllRowsSelected?: boolean;
}

/**
 * @description 컬럼 정의의 기본 인터페이스입니다.
 * @param key - 컬럼의 고유 식별자
 * @param label - 컬럼 헤더에 표시될 레이블 (ReactNode 가능)
 * @param className - 컬럼(셀)에 적용될 CSS 클래스
 * @param width - 컬럼 너비 (CSS Grid fraction 단위 또는 px 등)
 */
export interface ColumnDefinitionBase<TData, TOptions, THeaderOptions> {
  key: string;
  label: ReactNode;
  className?: string;
  width?: string | number; // 예: '1fr', '150px', 150 (px로 간주)

  // 셀 렌더링 함수
  renderCell: (
    data: TData,
    params: {
      rowIndex: number;
      columnIndex: number;
      options?: TOptions;
    }
  ) => ReactNode;

  // 헤더 레이블 커스텀 렌더링 (선택)
  renderHeaderLabel?: (params: {
    label: ReactNode;
    currentFilter: any; // TFilter 타입으로 변경 필요
    allData: TData[];
    headerOptions?: THeaderOptions;
  }) => ReactNode;

  // 정렬 기능 관련
  isSortable?: boolean;
  customSortFn?: (a: TData, b: TData, sortDirection: "asc" | "desc") => number;

  // 필터 기능 관련
  isFilterable?: boolean;
  filterType?: "text" | "select" | "date" | "custom"; // 필터 UI 타입
  filterOptions?: Array<{ label: string; value: any }>; // select 필터용 옵션
  customFilterFn?: (item: TData, filterValue: any) => boolean;
  filterPlaceholder?: string;
}

/**
 * @description AdvancedTable 컴포넌트의 핵심 Props 타입입니다.
 * @template TData - 테이블 데이터의 타입
 * @template TFilter - 필터 객체의 타입
 * @template TSort - 정렬 객체의 타입
 * @template TOptions - 각 셀 `renderCell`에 전달될 추가 옵션 타입
 * @template THeaderOptions - 각 헤더 `renderHeaderLabel`에 전달될 추가 옵션 타입
 */
export interface AdvancedTableProps<
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
> {
  renderingType: TableRenderingType;
  data: TData[];
  initialData?: TData[]; // 필터링/정렬되지 않은 원본 데이터 (데이터 유무 판단, 초기 상태 복원 등에 사용)
  columnDefinitions: ColumnDefinitionBase<TData, TOptions, THeaderOptions>[];

  shouldUseInternalProvider?: boolean; // 내부적으로 Provider를 사용할지 여부 (true면 사용, false면 외부 Provider 사용 가정)

  defaultSort?: TSort;
  defaultFilter?: TFilter;

  isFetching?: boolean;
  fetchingRowLength?: number; // 로딩 스켈레톤 행 수
  emptyDataMessage?: ReactNode; // 데이터 없을 때 메시지

  onFilterChange?: (newFilter: TFilter) => void;
  onSortChange?: (newSort: TSort) => void;

  bodyRowProps?: AdvancedTableBodyRowSpecificProps<TData>; // 모든 본문 행에 공통으로 적용될 props
  renderOptions?: TOptions; // 모든 셀 renderCell에 전달될 공통 옵션
  headerRenderOptions?: THeaderOptions; // 모든 헤더 renderHeaderLabel에 전달될 공통 옵션
  checkboxConfig?: CheckboxConfig<TData>;

  isDebounceFilterDisabled?: boolean; // 필터 입력 시 디바운스 비활성화 (true면 즉시 필터링)

  // 가상화 관련 props (renderingType이 'virtualized'일 때 사용)
  rowEstimateHeight?: number; // 행의 예상 높이 (px)
  overscanCount?: number; // 화면 밖에 미리 렌더링할 행의 수
}

// 컨텍스트에서 사용될 타입들
export interface AdvancedTableContextValue<
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
> {
  originalData: TData[];
  processedData: TData[]; // 필터링 및 정렬이 적용된 데이터
  columnDefinitions: ColumnDefinitionBase<TData, TOptions, THeaderOptions>[];
  tableGridColumns: string; // CSS Grid 템플릿 문자열

  currentFilter: TFilter;
  currentSort: TSort;
  setFilter: (
    filterUpdater: TFilter | ((prevFilter: TFilter) => TFilter)
  ) => void;
  setSort: (sortUpdater: TSort | ((prevSort: TSort) => TSort)) => void;

  // 체크박스 관련 상태 및 핸들러
  selectedRowKeys: Array<string | number>;
  isAllRowsSelected: boolean;
  toggleRowSelection: (rowKey: string | number) => void;
  toggleSelectAllRows: () => void;
  isRowSelectable: (rowData: TData, rowIndex: number) => boolean;
  checkboxConfig?: CheckboxConfig<TData>; // 원본 checkboxConfig 전달
  rowKeySelector: (rowData: TData) => string | number;

  // 추가 옵션들
  renderOptions?: TOptions;
  headerRenderOptions?: THeaderOptions;
}

export interface AdvancedTableInnerContextValue<
  TFilter extends Record<string, any>
> {
  currentLocalFilter: TFilter;
  setLocalFilter: React.Dispatch<React.SetStateAction<TFilter>>;
  // 디바운스된 필터 적용 함수 등 추가 가능
}

// 가상화된 바디에서 사용할 Props
export interface AdvancedTableVirtualizedBodyContentProps<
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
> extends Pick<
    AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>,
    | "isFetching"
    | "fetchingRowLength"
    | "emptyDataMessage"
    | "bodyRowProps"
    | "renderOptions"
    | "checkboxConfig"
  > {
  virtualRows: VirtualItem[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
  data: TData[]; // processedData
  columnDefinitions: ColumnDefinitionBase<TData, TOptions, THeaderOptions>[];
  tableGridColumns: string;
}
```

### 2. `BaseUITable.tsx` (기본 테이블 UI 컴포넌트)

(위 블로그 본문에 전체 코드 포함되어 있음)

### 3. `AdvancedTableContext.tsx` (상태 관리 컨텍스트 - 예시)

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import type {
  AdvancedTableProps,
  AdvancedTableContextValue,
  ColumnDefinitionBase,
  CheckboxConfig,
} from "./types/tableTypes";

const AdvancedTableContext = createContext<
  AdvancedTableContextValue<any, any, any, any, any> | undefined
>(undefined);

export function useAdvancedTableContext<
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
>() {
  const context = useContext(AdvancedTableContext);
  if (!context) {
    throw new Error(
      "useAdvancedTableContext must be used within an AdvancedTableContextProvider"
    );
  }
  return context as AdvancedTableContextValue<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >;
}

export const AdvancedTableContextProvider = <
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  children,
  data: originalData,
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

  // 필터 및 정렬 적용 로직 (예시 - 실제로는 더 복잡할 수 있음)
  const processedData = useMemo(() => {
    let filteredData = [...originalData];
    // 필터링 로직 적용
    Object.entries(currentFilter).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === "" ||
        value === "all"
      )
        return;
      const columnDef = columnDefinitions.find((col) => col.key === key);
      if (columnDef?.customFilterFn) {
        filteredData = filteredData.filter((item) =>
          columnDef.customFilterFn!(item, value)
        );
      } else if (columnDef?.isFilterable) {
        // 기본 텍스트 필터 (대소문자 무시, 부분 일치)
        filteredData = filteredData.filter((item) =>
          String(item[key]).toLowerCase().includes(String(value).toLowerCase())
        );
      }
    });

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
          const valA = a[sortKey];
          const valB = b[sortKey];
          if (valA < valB) return sortDirection === "asc" ? -1 : 1;
          if (valA > valB) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return filteredData;
  }, [originalData, currentFilter, currentSort, columnDefinitions]);

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
            ? filterUpdater(prevFilter)
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
            ? sortUpdater(prevSort)
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
    originalData,
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
```

### 4. `AdvancedTableInnerContext.tsx` (내부 필터 상태 관리 - 예시)

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { AdvancedTableInnerContextValue } from "./types/tableTypes";
import { useAdvancedTableContext } from "./AdvancedTableContext";

const AdvancedTableInnerContext = createContext<
  AdvancedTableInnerContextValue<any> | undefined
>(undefined);

export function useAdvancedTableInnerContext<
  TFilter extends Record<string, any>
>() {
  const context = useContext(AdvancedTableInnerContext);
  if (!context) {
    throw new Error(
      "useAdvancedTableInnerContext must be used within an AdvancedTableInnerContextProvider"
    );
  }
  return context as AdvancedTableInnerContextValue<TFilter>;
}

export const AdvancedTableInnerContextProvider = <
  TFilter extends Record<string, any>
>({
  children,
  filter: globalFilter,
}: React.PropsWithChildren<{ filter: TFilter }>) => {
  const [currentLocalFilter, setLocalFilter] = useState<TFilter>(globalFilter);

  // 전역 필터가 변경되면 로컬 필터도 동기화
  useEffect(() => {
    setLocalFilter(globalFilter);
  }, [globalFilter]);

  const value: AdvancedTableInnerContextValue<TFilter> = {
    currentLocalFilter,
    setLocalFilter,
  };

  return (
    <AdvancedTableInnerContext.Provider value={value}>
      {children}
    </AdvancedTableInnerContext.Provider>
  );
};
```

### 5. `./renderers/shared/AdvancedTableHeaderContent.tsx` (헤더 내용 - 예시)

```typescript
import React from "react";
import BaseUITable from "../../BaseUITable";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import type {
  AdvancedTableProps,
  ColumnDefinitionBase,
} from "../../types/tableTypes";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // 예시 아이콘 라이브러리

interface AdvancedTableHeaderContentProps<
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
> extends Pick<
    AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>,
    "headerRenderOptions" | "onSortChange" | "checkboxConfig"
  > {
  originalData: TData[];
  columnDefinitions: ColumnDefinitionBase<TData, TOptions, THeaderOptions>[];
  tableGridColumns: string;
}

export const AdvancedTableHeaderContent = <
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
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
  } = useAdvancedTableContext<
    TData,
    TFilter,
    TSort,
    TOptions,
    THeaderOptions
  >();

  const handleSort = (columnKey: string) => {
    const newSort = { ...currentSort };
    if (currentSort[columnKey as keyof TSort] === "asc") {
      newSort[columnKey as keyof TSort] = "desc" as any;
    } else if (currentSort[columnKey as keyof TSort] === "desc") {
      delete newSort[columnKey as keyof TSort]; // 정렬 해제
    } else {
      newSort[columnKey as keyof TSort] = "asc" as any;
    }
    // 이전 정렬키는 제거 (단일 컬럼 정렬 가정)
    Object.keys(newSort).forEach((key) => {
      if (key !== columnKey) delete newSort[key as keyof TSort];
    });
    setSort(newSort as TSort);
    onSortChange?.(newSort as TSort);
  };

  const canSelectAny = originalData.some((row, index) =>
    isRowSelectable(row, index)
  );

  return (
    <BaseUITable.HeaderRow gridTemplateColumns={tableGridColumns}>
      {checkboxConfig && (
        <BaseUITable.HeaderCell
          style={{
            width: checkboxConfig.checkboxColumnKey
              ? columnDefinitions.find(
                  (c) => c.key === checkboxConfig.checkboxColumnKey
                )?.width ?? "48px"
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
        if (colDef.key === checkboxConfig?.checkboxColumnKey) return null; // 체크박스 컬럼은 위에서 처리

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
                    currentFilter: {} as TFilter, // 컨텍스트에서 필터 가져와야 함
                    allData: originalData,
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
```

### 6. `./renderers/shared/AdvancedTableFilterRow.tsx` (필터 행 - 예시)

```typescript
import React, { useState, useEffect, useCallback } from "react";
import BaseUITable from "../../BaseUITable";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import { useAdvancedTableInnerContext } from "../../AdvancedTableInnerContext";
import type {
  AdvancedTableProps,
  ColumnDefinitionBase,
} from "../../types/tableTypes";

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
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
> extends Pick<
    AdvancedTableProps<TData, TFilter, TSort, TOptions, THeaderOptions>,
    "onFilterChange" | "isDebounceFilterDisabled" | "checkboxConfig"
  > {
  columnDefinitions: ColumnDefinitionBase<TData, TOptions, THeaderOptions>[];
  tableGridColumns: string;
}

export const AdvancedTableFilterRow = <
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
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

  const handleInputChange = (key: string, value: any) => {
    setLocalFilter((prev) => ({ ...prev, [key]: value } as TFilter));
  };

  return (
    <BaseUITable.HeaderRow
      gridTemplateColumns={tableGridColumns}
      className="bg-gray-50"
    >
      {checkboxConfig && (
        <BaseUITable.HeaderCell
          style={{
            width: checkboxConfig.checkboxColumnKey
              ? columnDefinitions.find(
                  (c) => c.key === checkboxConfig.checkboxColumnKey
                )?.width ?? "48px"
              : "48px",
          }}
        /> // 체크박스 컬럼 필터 공간
      )}
      {columnDefinitions.map((colDef) => {
        if (colDef.key === checkboxConfig?.checkboxColumnKey) return null;

        if (!colDef.isFilterable) {
          return <BaseUITable.HeaderCell key={`${colDef.key}-filter`} />;
        }
        // 필터 타입에 따라 다른 입력 UI 렌더링 (간단한 텍스트 입력 예시)
        return (
          <BaseUITable.HeaderCell key={`${colDef.key}-filter`} className="p-1">
            <input
              type="text"
              placeholder={
                colDef.filterPlaceholder ||
                `Filter ${colDef.label as string}...`
              }
              value={currentLocalFilter[colDef.key as keyof TFilter] || ""}
              onChange={(e) => handleInputChange(colDef.key, e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </BaseUITable.HeaderCell>
        );
      })}
    </BaseUITable.HeaderRow>
  );
};
```

### 7. `./renderers/shared/AdvancedTableBodyContent.tsx` (일반 바디 내용 - 예시)

```typescript
import React from "react";
import BaseUITable from "../../BaseUITable";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import type {
  AdvancedTableBodyRowSpecificProps,
  CheckboxConfig,
  ColumnDefinitionBase,
} from "../../types/tableTypes";

interface AdvancedTableBodyContentProps<
  TData extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
> {
  data: TData[];
  columnDefinitions: ColumnDefinitionBase<TData, TOptions, THeaderOptions>[];
  tableGridColumns: string;
  isFetching?: boolean;
  fetchingRowLength?: number;
  emptyDataMessage?: React.ReactNode;
  bodyRowProps?: AdvancedTableBodyRowSpecificProps<TData>;
  renderOptions?: TOptions;
  checkboxConfig?: CheckboxConfig<TData>;
}

export const AdvancedTableBodyContent = <
  TData extends Record<string, any>,
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
}: AdvancedTableBodyContentProps<TData, TOptions, THeaderOptions>) => {
  const {
    toggleRowSelection,
    selectedRowKeys,
    rowKeySelector,
    isRowSelectable,
  } = useAdvancedTableContext();

  if (isFetching) {
    return Array.from({ length: fetchingRowLength }).map((_, rowIndex) => (
      <BaseUITable.BodyRow
        key={`skeleton-${rowIndex}`}
        gridTemplateColumns={tableGridColumns}
      >
        {checkboxConfig && (
          <BaseUITable.BodyCell
            style={{
              width: checkboxConfig.checkboxColumnKey
                ? columnDefinitions.find(
                    (c) => c.key === checkboxConfig.checkboxColumnKey
                  )?.width ?? "48px"
                : "48px",
            }}
            className="text-center"
          >
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </BaseUITable.BodyCell>
        )}
        {columnDefinitions.map((colDef) => {
          if (colDef.key === checkboxConfig?.checkboxColumnKey) return null;
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
                  width: checkboxConfig.checkboxColumnKey
                    ? columnDefinitions.find(
                        (c) => c.key === checkboxConfig.checkboxColumnKey
                      )?.width ?? "48px"
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
              if (colDef.key === checkboxConfig?.checkboxColumnKey) return null;
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
```

### 8. `./renderers/shared/AdvancedTableVirtualizedBodyContent.tsx` (가상화 바디 내용 - 예시)

```typescript
import React from "react";
import BaseUITable from "../../BaseUITable";
import { useAdvancedTableContext } from "../../AdvancedTableContext";
import type { AdvancedTableVirtualizedBodyContentProps } from "../../types/tableTypes";

export const AdvancedTableVirtualizedBodyContent = <
  TData extends Record<string, any>,
  TFilter extends Record<string, any>,
  TSort extends Record<string, any>,
  TOptions = unknown,
  THeaderOptions = unknown
>({
  virtualRows,
  // rowVirtualizer, // 필요시 사용
  data, // 전체 processedData
  columnDefinitions,
  tableGridColumns,
  isFetching,
  fetchingRowLength = 5,
  emptyDataMessage = "데이터가 없습니다.",
  bodyRowProps,
  renderOptions,
  checkboxConfig,
}: AdvancedTableVirtualizedBodyContentProps<
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
        key={`skeleton-${skeletonIndex}`}
        gridTemplateColumns={tableGridColumns}
        style={{ height: `${bodyRowProps?.style?.height || 64}px` }}
      >
        {checkboxConfig && (
          <BaseUITable.BodyCell
            style={{
              width: checkboxConfig.checkboxColumnKey
                ? columnDefinitions.find(
                    (c) => c.key === checkboxConfig.checkboxColumnKey
                  )?.width ?? "48px"
                : "48px",
            }}
            className="text-center"
          >
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          </BaseUITable.BodyCell>
        )}
        {columnDefinitions.map((colDef) => {
          if (colDef.key === checkboxConfig?.checkboxColumnKey) return null;
          return (
            <BaseUITable.BodyCell
              key={`${colDef.key}-skeleton-${skeletonIndex}`}
              className={colDef.className}
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </BaseUITable.BodyCell>
          );
        })}
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
      {virtualRows.map((virtualRow) => {
        const rowIndex = virtualRow.index;
        const rowData = data[rowIndex];

        // 행 데이터가 없는 경우 (데이터가 로드되기 전 등) 렌더링하지 않음
        if (!rowData) {
          return (
            <BaseUITable.BodyRow
              key={virtualRow.key}
              gridTemplateColumns={tableGridColumns}
              style={{ height: `${virtualRow.size}px` }}
            >
              {/* 빈 행 또는 스켈레톤 플레이스홀더 */}
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
            ref={virtualRow.measureRef} // 가상화 라이브러리가 행 높이를 측정할 수 있도록 ref 전달
            gridTemplateColumns={tableGridColumns}
            onClick={handleRowClick}
            className={bodyRowProps?.className}
            style={{
              ...bodyRowProps?.style,
              height: `${virtualRow.size}px`, // 가상 행의 높이 적용
              // transform: `translateY(${virtualRow.start}px)` // 이건 부모에서 처리
            }}
          >
            {checkboxConfig && (
              <BaseUITable.BodyCell
                style={{
                  width: checkboxConfig.checkboxColumnKey
                    ? columnDefinitions.find(
                        (c) => c.key === checkboxConfig.checkboxColumnKey
                      )?.width ?? "48px"
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
            {columnDefinitions.map((colDef, colIndex) => {
              if (colDef.key === checkboxConfig?.checkboxColumnKey) return null;
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
            })}
          </BaseUITable.BodyRow>
        );
      })}
    </>
  );
};
```

### 9. `./renderers/AdvancedTableNormalRenderer.tsx`

(위 블로그 본문에 전체 코드 포함되어 있음)

### 10. `./renderers/AdvancedTableVirtualizedRenderer.tsx`

(위 블로그 본문에 전체 코드 포함되어 있음, 가상화된 바디 스타일링 약간 수정)

### 11. `AdvancedTable.tsx` (최상위 컴포넌트)

(위 블로그 본문에 전체 코드 포함되어 있음)

### 12. 데이터 조회 페이지 예시 (`DataViewerPage.tsx`)

(위 블로그 본문에 전체 코드 포함되어 있음)

이 코드들은 완전한 기능을 갖춘 프로덕션 코드가 아닌, 이 글의 개념을 설명하기 위한 예시입니다. 실제 구현 시에는 에러 처리, 접근성, 추가적인 사용자 상호작용, 세밀한 스타일링 등 더 많은 고려사항이 필요합니다.
