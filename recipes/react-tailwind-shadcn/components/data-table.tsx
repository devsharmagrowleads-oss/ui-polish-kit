import * as React from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, RotateCwIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type SortDirection = "ascending" | "descending";
type Sort = { key: string; direction: SortDirection } | null;

type Column<Row> = {
  /** Stable id, also used in the URL when sorting is synced there (NV-06). */
  key: string;
  /** Column name, e.g. "Amount (USD)". Units belong here, not in every cell. */
  header: string;
  /** "end" for numbers, money, percentages and durations (DT-02). */
  align?: "start" | "end";
  /** How the cell is shown. Defaults to the raw value. */
  cell?: (row: Row) => React.ReactNode;
  /** The raw value for sorting: numbers and dates sort as numbers, never as formatted text. */
  value?: (row: Row) => string | number | Date | null | undefined;
  sortable?: boolean;
  /** Tailwind width/min-width classes from the scale, e.g. "min-w-40". */
  className?: string;
};

type DataTableProps<Row> = {
  /** Names the table; shown visually hidden unless `showCaption`. */
  caption: string;
  showCaption?: boolean;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** The column whose cell names the row; rendered as <th scope="row"> (DT-01). */
  rowHeader?: string;
  loading?: boolean;
  /** A failed load: what failed, in plain words. */
  error?: string | null;
  onRetry?: () => void;
  /** Shown instead of the body when there are no rows (ST-03). */
  empty?: React.ReactNode;
  /** Controlled sort, for keeping it in the URL. Uncontrolled if omitted. */
  sort?: Sort;
  onSortChange?: (sort: Sort) => void;
  className?: string;
};

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function compare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0;
  if (a == null) return 1; // missing values sort last in both directions
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * A data table that follows DT-01…DT-08: semantic markup with a caption,
 * column and row headers, sticky header, end-aligned tabular numbers, sortable
 * headers with aria-sort and an announcement, skeleton rows while loading, and
 * an error row with retry. Wide tables scroll inside a labelled region (RS-06).
 *
 *   <DataTable caption="Invoices" rowKey={(r) => r.id} rowHeader="number"
 *     columns={[
 *       { key: "number", header: "Invoice", sortable: true, value: (r) => r.number },
 *       { key: "total", header: "Amount (USD)", align: "end", sortable: true,
 *         value: (r) => r.total, cell: (r) => money.format(r.total) },
 *     ]}
 *     rows={rows} loading={isLoading} error={error && "Couldn't load invoices."} onRetry={refetch}
 *     empty={<EmptyState title="No invoices yet" description="…" />} />
 */
function DataTable<Row>({
  caption,
  showCaption = false,
  columns,
  rows,
  rowKey,
  rowHeader,
  loading = false,
  error = null,
  onRetry,
  empty,
  sort: controlledSort,
  onSortChange,
  className,
}: DataTableProps<Row>) {
  const captionId = React.useId();
  const [ownSort, setOwnSort] = React.useState<Sort>(null);
  const sort = controlledSort === undefined ? ownSort : controlledSort;
  const [announcement, setAnnouncement] = React.useState("");

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.value) return rows;
    const factor = sort.direction === "ascending" ? 1 : -1;
    const get = column.value;
    // Array.prototype.sort is stable, so equal rows keep their order.
    return [...rows].sort((a, b) => factor * compare(get(a), get(b)));
  }, [rows, columns, sort]);

  function toggleSort(column: Column<Row>) {
    const direction: SortDirection =
      sort?.key === column.key && sort.direction === "ascending" ? "descending" : "ascending";
    const next = { key: column.key, direction };
    if (controlledSort === undefined) setOwnSort(next);
    onSortChange?.(next);
    setAnnouncement(`Sorted by ${column.header}, ${direction}, ${rows.length} rows`);
  }

  const alignClass = (column: Column<Row>) => (column.align === "end" ? "text-end tabular-nums" : "text-start");

  let body: React.ReactNode;
  if (loading && rows.length === 0) {
    body = Array.from({ length: 5 }, (_, i) => (
      <tr key={`skeleton-${i}`} className="border-b border-border">
        {columns.map((column) => (
          <td key={column.key} className="px-4 py-3">
            <Skeleton className={cn("h-4", column.align === "end" ? "ms-auto w-16" : "w-3/4")} />
          </td>
        ))}
      </tr>
    ));
  } else if (error) {
    body = (
      <tr>
        <td colSpan={columns.length} className="px-4 py-10 text-center">
          <p className="font-medium text-foreground">{error}</p>
          <p className="mt-1 text-sm text-muted-foreground">Check your connection, then try again.</p>
          {onRetry ? (
            <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
              <RotateCwIcon aria-hidden="true" />
              Try again
            </Button>
          ) : null}
        </td>
      </tr>
    );
  } else if (rows.length === 0) {
    body = (
      <tr>
        <td colSpan={columns.length} className="p-6">
          {empty}
        </td>
      </tr>
    );
  } else {
    body = sorted.map((row) => (
      <tr key={rowKey(row)} className="border-b border-border transition-colors duration-(--duration-fast) hover:bg-muted/60">
        {columns.map((column) => {
          const content = column.cell ? column.cell(row) : (column.value?.(row) as React.ReactNode);
          const missing = content === null || content === undefined || content === "";
          const shown = missing ? <span aria-label="Not set" className="text-muted-foreground">–</span> : content;
          return column.key === rowHeader ? (
            <th key={column.key} scope="row" className={cn("px-4 py-3 font-medium text-foreground", alignClass(column), column.className)}>
              {shown}
            </th>
          ) : (
            <td key={column.key} className={cn("px-4 py-3 text-foreground", alignClass(column), column.className)}>
              {shown}
            </td>
          );
        })}
      </tr>
    ));
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className="max-h-dvh overflow-auto rounded-lg border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <table className="w-full border-separate border-spacing-0 text-sm" aria-busy={loading || undefined}>
          <caption id={captionId} className={showCaption ? "px-4 py-3 text-start font-medium text-foreground" : "sr-only"}>
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key ? sort.direction : undefined;
                const Icon = active === "ascending" ? ArrowUpIcon : active === "descending" ? ArrowDownIcon : ArrowUpDownIcon;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active}
                    className={cn(
                      "sticky top-0 z-(--z-sticky) border-b border-border bg-card font-medium whitespace-nowrap text-muted-foreground",
                      column.sortable ? "p-0" : "px-4 py-3",
                      alignClass(column),
                      column.className,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className={cn(
                          "inline-flex min-h-11 w-full items-center gap-1.5 px-4 py-3 font-medium hover:text-foreground",
                          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                          column.align === "end" && "justify-end",
                          active && "text-foreground",
                        )}
                      >
                        {column.header}
                        <Icon aria-hidden="true" className={cn("size-4 shrink-0", !active && "opacity-40")} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
      {/* One polite message per sort; never aria-live on the table itself. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

export { DataTable };
export type { Column, DataTableProps, Sort, SortDirection };
