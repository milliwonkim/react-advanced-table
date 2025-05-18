import React, { HTMLAttributes, Ref } from "react";
import { classNamesUtil } from "../../utils"; // Adjusted path

// Props Interfaces
export interface BaseTableContainerProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
}

export interface BaseTableBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
}

export interface BaseTableHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement>;
}

export interface BaseTableHeaderRowProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gridTemplateColumns: string;
  ref?: React.RefObject<HTMLDivElement>;
}

export interface BaseTableHeaderCellProps
  extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  rowIndex?: number; // 다중 헤더 행을 위한 인덱스
  isMainHeader?: boolean; // 주 헤더 여부 (스타일링 목적)
  containerClassName?: string;
  hasDivider?: boolean; // 구분선 여부
  ref?: React.RefObject<HTMLDivElement>;
}

export interface BaseTableBodyRowProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gridTemplateColumns: string;
  rowIndex?: number;
  ref?: Ref<HTMLDivElement>;
}

export interface BaseTableBodyCellProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isLastRowCell?: boolean; // 마지막 행의 셀 여부 (스타일링 목적)
  colSpan?: number;
  rowSpan?: number;
  ref?: React.RefObject<HTMLDivElement>;
}

// Component Implementations
const BaseTableContainer = (props: BaseTableContainerProps) => {
  const { children, className, ref, ...restProps } = props;
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
};
BaseTableContainer.displayName = "BaseTableContainer";

const BaseTableBody = (props: BaseTableBodyProps) => {
  const { children, className, ref, ...restProps } = props;
  return (
    <div
      ref={ref}
      {...restProps}
      className={classNamesUtil("table-ui-body", "w-full flex-1", className)}
    >
      {children}
    </div>
  );
};
BaseTableBody.displayName = "BaseTableBody";

const BaseTableHeader = (props: BaseTableHeaderProps) => {
  const { children, className, ref, ...restProps } = props;
  return (
    <div
      ref={ref}
      {...restProps}
      className={classNamesUtil("table-ui-header", "w-full", className)}
    >
      {children}
    </div>
  );
};
BaseTableHeader.displayName = "BaseTableHeader";

const BaseTableHeaderRow = (props: BaseTableHeaderRowProps) => {
  const { children, gridTemplateColumns, className, style, ref, ...restProps } =
    props;
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
};
BaseTableHeaderRow.displayName = "BaseTableHeaderRow";

const BaseTableHeaderCell = (props: BaseTableHeaderCellProps) => {
  const {
    children,
    rowIndex = 0,
    isMainHeader,
    className,
    containerClassName,
    hasDivider,
    style,
    ref,
    ...restProps
  } = props;
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
};
BaseTableHeaderCell.displayName = "BaseTableHeaderCell";

const BaseTableBodyRow = (props: BaseTableBodyRowProps) => {
  const { children, gridTemplateColumns, className, style, ref, ...restProps } =
    props;
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
};
BaseTableBodyRow.displayName = "BaseTableBodyRow";

const BaseTableBodyCell = (props: BaseTableBodyCellProps) => {
  const {
    children,
    isLastRowCell,
    className,
    colSpan,
    rowSpan,
    style,
    ref,
    ...restProps
  } = props;
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
};
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
