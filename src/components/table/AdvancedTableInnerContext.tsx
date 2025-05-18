import React, { createContext, useContext, useState, useEffect } from "react";
import { AdvancedTableInnerContextValue } from "../../types/tableTypes";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdvancedTableInnerContext = createContext<any>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdvancedTableInnerContext<TFilter>() {
  const context = useContext(AdvancedTableInnerContext);
  if (!context) {
    throw new Error(
      "useAdvancedTableInnerContext must be used within an AdvancedTableInnerContextProvider"
    );
  }
  return context as AdvancedTableInnerContextValue<TFilter>;
}

export const AdvancedTableInnerContextProvider = <TFilter,>({
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
