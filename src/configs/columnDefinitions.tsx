import type { LogEntry, LogFilter } from "../types/logTypes"; // Removed LogFilter, LogSort as not directly used in this static def
import type { ColumnDefinitionBase } from "../types/tableTypes";

// Helper to format timestamp - replace with a more robust date library if needed
const formatTimestamp = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(); // Adjust format as needed
  } catch {
    return isoString; // Return original if parsing fails
  }
};

export const columnDefinitions: ColumnDefinitionBase<
  LogEntry,
  LogFilter,
  unknown,
  unknown
>[] = [
  {
    key: "timestamp",
    label: "Timestamp",
    width: "200px",
    isSortable: true,
    isFilterable: false, // Date range filtering is often a global filter
    renderCell: (data) => formatTimestamp(data.timestamp),
  },
  {
    key: "level",
    label: "Level",
    width: "100px",
    isSortable: true,
    isFilterable: true,
    filterType: "select",
    filterOptions: [
      { label: "All", value: "all" },
      { label: "INFO", value: "INFO" },
      { label: "WARN", value: "WARN" },
      { label: "ERROR", value: "ERROR" },
      { label: "DEBUG", value: "DEBUG" },
    ],
    renderCell: (data) => {
      if (data.level === "ERROR")
        return <span style={{ color: "red" }}>{data.level}</span>;
      if (data.level === "WARN")
        return <span style={{ color: "orange" }}>{data.level}</span>;
      return <span>{data.level}</span>;
    },
    customFilterFn: (item, filterValue) => {
      if (
        filterValue === "all" ||
        filterValue === undefined ||
        filterValue === null
      ) {
        return true;
      }
      return item.level === filterValue;
    },
  },
  {
    key: "message",
    label: "Message",
    width: "3fr",
    isSortable: false,
    isFilterable: true,
    filterPlaceholder: "Search messages...",
    renderCell: (data) => <span title={data.message}>{data.message}</span>,
  },
  {
    key: "source",
    label: "Source",
    width: "1fr",
    isSortable: true,
    isFilterable: true,
    filterPlaceholder: "Search sources...",
    renderCell: (data) => data.source || "-",
  },
  {
    key: "user",
    label: "User ID",
    width: "1fr",
    isSortable: true,
    isFilterable: true,
    filterPlaceholder: "Search users...",
    renderCell: (data) => data.user || "-",
  },
  // Example for a details column if needed, might require custom rendering
  // {
  //   key: 'details',
  //   label: 'Details',
  //   width: '200px',
  //   renderCell: (data) => data.details ? <pre>{JSON.stringify(data.details, null, 2)}</pre> : '-',
  // },
];

// Optional checkbox column definition
export const checkboxColumnDefinition: ColumnDefinitionBase<
  LogEntry,
  LogFilter,
  unknown,
  unknown
> = {
  key: "checkbox-selector",
  label: "",
  width: "48px",
  renderCell: () => null, // Rendered by table internals
};

// If you want to include the checkbox column directly in the main list:
// export const columnDefinitionsWithCheckbox: ColumnDefinitionBase<LogEntry, unknown, unknown>[] = [
//   checkboxColumnDefinition,
//   ...columnDefinitions
// ];
// Then in your AdvancedTable, you would pass `columnDefinitionsWithCheckbox`
// and configure `checkboxConfig.checkboxColumnKey` to `checkbox-selector`.
