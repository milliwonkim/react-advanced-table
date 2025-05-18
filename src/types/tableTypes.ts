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
export interface ColumnDefinitionBase<
  TData,
  TFilter,
  TOptions,
  THeaderOptions
> {
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
    currentFilter: TFilter;
    allData: TData[];
    headerOptions?: THeaderOptions;
  }) => ReactNode;

  // 정렬 기능 관련
  isSortable?: boolean;
  customSortFn?: (a: TData, b: TData, sortDirection: "asc" | "desc") => number;

  // 필터 기능 관련
  isFilterable?: boolean;
  filterType?: "text" | "select" | "date" | "custom"; // 필터 UI 타입
  filterOptions?: Array<{ label: string; value: unknown }>; // Remains unknown
  customFilterFn?: (item: TData, filterValue: unknown) => boolean; // Remains unknown
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
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
> {
  renderingType: TableRenderingType;
  data: TData[];
  initialData?: TData[]; // 필터링/정렬되지 않은 원본 데이터 (데이터 유무 판단, 초기 상태 복원 등에 사용)
  columnDefinitions: ColumnDefinitionBase<
    TData,
    TFilter,
    TOptions,
    THeaderOptions
  >[];

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
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
  TOptions = unknown,
  THeaderOptions = unknown
> {
  originalData: TData[];
  processedData: TData[]; // 필터링 및 정렬이 적용된 데이터
  columnDefinitions: ColumnDefinitionBase<
    TData,
    TFilter,
    TOptions,
    THeaderOptions
  >[];
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

export interface AdvancedTableInnerContextValue<TFilter> {
  currentLocalFilter: TFilter;
  setLocalFilter: React.Dispatch<React.SetStateAction<TFilter>>;
  // 디바운스된 필터 적용 함수 등 추가 가능
}

// 가상화된 바디에서 사용할 Props
export interface AdvancedTableVirtualizedBodyContentProps<
  TData,
  TFilter,
  TSort extends Record<string, unknown>,
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
  columnDefinitions: ColumnDefinitionBase<
    TData,
    TFilter,
    TOptions,
    THeaderOptions
  >[];
  tableGridColumns: string;
}
