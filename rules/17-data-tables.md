---
topic: data-tables
prefix: DT
title: Data tables
when: Showing rows of records (lists of users, orders, invoices, logs, search results), building an admin screen or dashboard table, or adding sorting, filtering, selection or pagination to one.
---

# Data tables

Most of a dashboard is tables, and agents build them as a grid of divs with every column left-aligned, no header that stays put, a sort that cannot be seen, and nothing to show while the data loads. A good table is read across a row and down a column at the same time: alignment, a fixed header and a visible sort are what make that possible. Start from `recipes/react-tailwind-shadcn/components/data-table.tsx` (or `recipes/html-css/data-table.html`). The small-screen form of a table is RS-06; digit formatting is TY-07.

## DT-01 · Tables are real tables
Severity: warning · Check: static

**Rule.** Tabular data uses `<table>` with a `<caption>` (or `aria-labelledby`), a `<thead>` of `<th scope="col">` cells and a `<tbody>`. The first cell of each row is a `<th scope="row">` when it names the row (a person, an invoice number). Never build a table from `<div>`s with grid or flex: screen readers lose the column headers.

**Why.** A `<table>` tells assistive technology which header belongs to each cell, so "Total, 1,240 dollars" is read instead of a bare number. Div grids have no such relationship and also lose sticky headers, column sizing and copy-paste into a spreadsheet.

**Bad.**
```tsx
<div className="grid grid-cols-4">{rows.map((r) => <><div>{r.number}</div><div>{r.total}</div></>)}</div>
```

**Good.**
```tsx
<table>
  <caption className="sr-only">Invoices</caption>
  <thead><tr><th scope="col">Invoice</th><th scope="col" className="text-right">Total</th></tr></thead>
  <tbody>{rows.map((r) => <tr key={r.id}><th scope="row">{r.number}</th><td className="text-right tabular-nums">{fmt(r.total)}</td></tr>)}</tbody>
</table>
```

**Check.** Static: a `<table>` with no `<th>`. Visual: the accessibility tree shows column headers for every cell.

## DT-02 · Columns are aligned by what they hold
Severity: warning · Check: visual

**Rule.** Text and identifiers align to the start; numbers, money, percentages and durations align to the end with `tabular-nums`; dates use one fixed format; status is a short badge (text plus colour, never colour alone); row actions sit in the last column, aligned to the end. Each header aligns the same way as its column. Units go in the header ("Amount (USD)"), not in every cell.

**Why.** Right-aligned digits put units under units, so values can be compared by eye down a column. A header that does not line up with its data, or a currency symbol repeated in every row, turns the table back into text that has to be read cell by cell.

**Bad.**
```tsx
<th>Amount</th> … <td>$1240.5</td> <td>$98</td>
```

**Good.**
```tsx
<th scope="col" className="text-right">Amount (USD)</th> … <td className="text-right tabular-nums">1,240.50</td>
```

**Check.** Visual: scan each numeric column top to bottom; the digits line up and the header sits over them.

## DT-03 · Sorting is visible and announced
Severity: warning · Check: visual

**Rule.** A sortable column header contains a `<button>` with the column name (not "Sort"), followed by a decorative direction icon. The sorted column's `<th>` carries `aria-sort="ascending"` or `"descending"`, and only that one. The first click sorts ascending, the next reverses. Text sorts with `Intl.Collator`; numbers and dates sort by their raw value, never by the formatted string. Keep sort, filter and page in the URL (NV-06).

**Why.** A clickable header with no arrow hides that sorting exists, and one with an arrow on every column hides which sort is active. Sorting "$1.2k" as text puts it before "$900".

**Bad.**
```tsx
<th onClick={() => setSort('total')}>Total ↕</th>
```

**Good.**
```tsx
<th scope="col" aria-sort={sort.key === 'total' ? sort.dir : undefined}>
  <button type="button" onClick={() => toggle('total')}>Total <SortIcon state={sort.key === 'total' ? sort.dir : null} aria-hidden /></button>
</th>
```

**Check.** Visual: click a header twice and use the keyboard; the arrow and `aria-sort` change on that column only.

## DT-04 · The header stays and rows have a set density
Severity: info · Check: visual

**Rule.** Tables taller than the screen keep the header visible (`position: sticky` on the header cells, with a background), and wide tables keep the first column sticky too. Pick one row height for the product (compact 36px, default 44px, comfortable 52px) and use it everywhere; do not mix. Rows show hover; zebra stripes only if rows are wider than about 1,000px.

**Why.** Scrolling past the header in a 200-row table makes every column anonymous. Mixed row heights between two tables in the same app look like two products.

**Bad.**
```css
thead th { background: transparent; } /* scrolls away with the page */
```

**Good.**
```css
thead th { position: sticky; inset-block-start: 0; z-index: var(--z-sticky); background: var(--card); }
tbody tr:hover { background: var(--muted); }
```

**Check.** Visual: scroll a long table; the header stays readable over the rows.

## DT-05 · Every table has its states
Severity: error · Check: visual

**Rule.** Loading shows skeleton rows with the real columns and widths (ST-02), not a spinner over an empty box. Empty has two forms (ST-03): nothing yet (explain and offer the create action) and no results for this filter (say which filter and offer to clear it). An error replaces the body with what failed and a retry (ST-04). While refetching, keep the old rows and show progress.

**Why.** An empty `<tbody>` reads as "broken" and gives no next step, and replacing rows with a spinner on every refetch makes the table jump.

**Bad.**
```tsx
{loading ? <Spinner /> : <Table rows={rows} />}
```

**Good.**
```tsx
<DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={refetch}
  empty={filtered ? <EmptyState title="No invoices match “overdue”" action={<Button onClick={clear}>Clear filter</Button>} … /> : <EmptyState title="No invoices yet" … />} />
```

**Check.** Visual: capture the table loading, empty, filtered-empty and failing.

## DT-06 · Paging shows where you are
Severity: warning · Check: visual

**Rule.** Paginated tables show the range and total ("21–40 of 340"), previous and next buttons that are disabled at the ends, and a page-size choice when pages are long. Filters, search and sort sit above the table, show how many rows match, and can be cleared in one click. Infinite scroll is for feeds, not for tables people compare or return to.

**Why.** Without a total, users cannot tell whether "no more rows" means the end or a slow load; without a range they cannot get back to where they were.

**Bad.**
```tsx
<button onClick={next}>Load more</button>
```

**Good.**
```tsx
<p className="tabular-nums text-sm text-muted-foreground">{start}–{end} of {total}</p>
<Button variant="outline" disabled={page === 1} onClick={prev}>Previous</Button> <Button variant="outline" disabled={end === total} onClick={next}>Next</Button>
```

**Check.** Visual: go to the last page and back; the range, total and disabled states are right.

## DT-07 · Selection and row actions are predictable
Severity: warning · Check: visual

**Rule.** Selectable rows have a checkbox column with a header checkbox (indeterminate when some are selected), and a bar that appears with the count and the bulk actions ("3 selected · Archive · Delete"). Per-row actions go in the last column: one or two visible buttons, the rest in a "More actions" menu labelled with the row ("More actions for INV-2041"). If the whole row opens a detail page, the row's first cell is a real link so it works from the keyboard and with middle-click.

**Why.** Click handlers on `<tr>` are invisible to the keyboard and break "open in new tab". A row of five icon buttons per line is noise and impossible to tell apart.

**Bad.**
```tsx
<tr onClick={() => router.push(`/invoices/${r.id}`)}>…<td><Pencil/><Copy/><Archive/><Trash2/></td></tr>
```

**Good.**
```tsx
<tr><th scope="row"><a href={`/invoices/${r.id}`}>{r.number}</a></th>…<td className="text-right"><RowMenu label={`More actions for ${r.number}`} /></td></tr>
```

**Check.** Visual: select some rows, use the keyboard to open a row and its menu.

## DT-08 · Long and missing values are handled
Severity: info · Check: visual

**Rule.** Columns have a minimum width; long text truncates to one line with the full value available on hover and focus (a Tooltip, not `title`), except the row's name column, which wraps. Missing values show an en dash with an accessible "Not set", never blank, "null", "undefined" or "NaN". Identifiers and emails never wrap mid-word.

**Why.** A 300-character description stretches its row to ten lines and pushes the rest of the table off screen; an empty cell looks like a loading bug.

**Bad.**
```tsx
<td>{row.owner?.email}</td>
```

**Good.**
```tsx
<td className="max-w-56 truncate">{row.owner ? <Truncated text={row.owner.email} /> : <span aria-label="Not set">–</span>}</td>
```

**Check.** Visual: load rows with very long, very short and missing values (FD-11).
