---
topic: charts
prefix: CH
title: Charts and data visualisation
when: Adding a chart, graph, sparkline, KPI tile with a trend, gauge or any visual summary of numbers to a dashboard, report or landing page; choosing a chart library or its colours.
---

# Charts and data visualisation

Agents reach for a pie chart with the library's default rainbow, a legend far from the lines it explains, an axis with no units and a y-axis that starts wherever the data starts. The chart then looks busy and says less than a table would. Choose the chart for the question, colour it from the chart tokens (CO-05: `--chart-1` … `--chart-6` in `recipes/react-tailwind-shadcn/tokens/tokens.css`), label it directly and make it readable without colour.

## CH-01 · The chart answers one question
Severity: warning · Check: visual

**Rule.** Pick the form from the question: change over time is a line (or columns for few periods); comparing categories is a horizontal bar sorted by value; part of a whole with two or three parts is a single stacked bar or a donut with labels; distribution is a histogram. No 3D, no pie with more than five slices, no dual y-axes, no radar for comparison. If a reader needs exact values, show a table (DT-01) or put the numbers on the chart. Give each chart a title that states the takeaway ("Signups doubled after the March launch").

**Why.** The wrong form hides the answer: a 12-slice pie cannot be compared by eye, and two y-axes invent correlations by choosing the scales.

**Bad.**
```tsx
<PieChart data={trafficBySource /* 11 sources */} /> <h3>Traffic</h3>
```

**Good.**
```tsx
<h3>Organic search brings 41% of visits</h3>
<BarChart layout="vertical" data={sortByValue(trafficBySource).slice(0, 6)} />
```

**Check.** Visual: for each chart, say the question it answers; if you cannot, or a table would answer it faster, change it.

## CH-02 · Colour comes from chart tokens and means something
Severity: warning · Check: visual

**Rule.** Series colours come from the chart tokens (CO-05), defined for light and dark, never from the library default. One series is the focus: give it `--chart-1` and the rest a neutral or lighter tone. The same category keeps the same colour on every chart of the product. Use at most six categorical colours; group the rest as "Other". Grid lines and axes use `--border` and `--muted-foreground` and stay quieter than the data.

**Why.** Default palettes ignore the theme, change colour order between charts, and make every series compete. Readers learn a colour once; if "Paid" is teal on one chart and orange on the next, every chart has to be read from scratch.

**Bad.**
```tsx
<LineChart><Line dataKey="paid" /><Line dataKey="organic" /><Line dataKey="referral" /></LineChart>
```

**Good.**
```tsx
<LineChart><Line dataKey="organic" stroke="var(--chart-1)" strokeWidth={2} />
  <Line dataKey="paid" stroke="var(--chart-3)" /><CartesianGrid stroke="var(--border)" vertical={false} /></LineChart>
```

**Check.** Visual: view the dashboard in light and dark; the same series has the same colour everywhere and the grid does not compete with the data.

## CH-03 · Label directly; axes have units
Severity: warning · Check: visual

**Rule.** Put series names at the end of their line or on the bar instead of in a distant legend; keep a legend only for more than four series, placed above the chart. Axes show units and readable ticks formatted with `Intl.NumberFormat` (`12k`, `$1.2M`, `Mar 3`), at most about six ticks, no rotated labels (switch to horizontal bars instead). Show values on bars when there are fewer than about twelve.

**Why.** A legend makes the eye travel back and forth for every line; "1200000" on an axis has to be counted; diagonal labels are hard to read and signal that the wrong orientation was chosen.

**Bad.**
```tsx
<YAxis /> <XAxis dataKey="date" angle={-45} /> <Legend verticalAlign="bottom" />
```

**Good.**
```tsx
<YAxis tickFormatter={(v) => compact.format(v)} width={48} label={{ value: 'Visits', angle: 0, position: 'insideTopLeft' }} />
<XAxis dataKey="date" tickFormatter={(d) => day.format(new Date(d))} minTickGap={24} />
<Line dataKey="organic" stroke="var(--chart-1)"><LabelList position="right" content={EndLabel} /></Line>
```

**Check.** Visual: cover the legend; every series can still be named.

## CH-04 · Scales are honest
Severity: error · Check: visual

**Rule.** Bar and area charts start at zero. Line charts may zoom in, but say so and never compare two zoomed charts side by side with different scales. Small multiples share one scale. Percentages of a whole add up to 100. Time axes are evenly spaced in time, with gaps shown as gaps, not joined.

**Why.** A bar chart whose axis starts at 95 makes a 2% difference look like a tripling: the chart is then wrong, however good it looks.

**Bad.**
```tsx
<YAxis domain={['dataMin', 'dataMax']} /> <Bar dataKey="conversion" />
```

**Good.**
```tsx
<YAxis domain={[0, 'auto']} tickFormatter={(v) => percent.format(v)} /> <Bar dataKey="conversion" fill="var(--chart-1)" />
```

**Check.** Visual: for each bar or area chart, the value axis starts at zero.

## CH-05 · Readable without colour or sight
Severity: error · Check: visual

**Rule.** Series differ by more than hue: direct labels, dash patterns or marker shapes. Each chart has a text alternative: an accessible name and a one- or two-sentence summary of what it shows (`role="img"` plus `aria-label` on the SVG, or a visible caption), and the underlying numbers are reachable as a table or download. Interactive points are keyboard reachable, and tooltips also appear on focus (AX-10). Text in charts meets contrast (AX-09); lines and bars meet 3:1 against the background.

**Why.** About one man in twelve cannot tell red from green, and a screen reader meets an SVG chart as hundreds of meaningless shapes or as nothing at all.

**Bad.**
```tsx
<ResponsiveContainer><LineChart data={data}>…</LineChart></ResponsiveContainer>
```

**Good.**
```tsx
<figure>
  <ChartFrame label="Weekly signups, January to June" summary="Signups rose from 120 to 260 a week, most of it after the March launch.">…</ChartFrame>
  <figcaption>Signups doubled after the March launch. <a href="#signups-table">View the data</a></figcaption>
</figure>
```

**Check.** Visual: view in greyscale and with a colour-blindness simulation; read the page with a screen reader to reach the summary.

## CH-06 · Charts have states and fit their box
Severity: warning · Check: visual

**Rule.** Reserve the chart's height before data arrives and show a skeleton of the same size (ST-02). Empty data says what is missing for which range ("No orders between 1 and 7 March") instead of drawing a flat line at zero. Errors appear in the chart's box with a retry. On narrow containers, reduce ticks and series rather than shrinking text; use the container's width, not the viewport (RS-09).

**Why.** A chart that pops in from zero height pushes the page (FD-10), and a flat zero line claims sales were zero when the request simply failed.

**Bad.**
```tsx
{data && <LineChart data={data} />}
```

**Good.**
```tsx
<div className="h-64">{loading ? <Skeleton className="size-full" /> : error ? <ChartError onRetry={refetch} /> : data.length === 0 ? <ChartEmpty range={range} /> : <LineChart data={data} />}</div>
```

**Check.** Visual: capture each chart loading, empty, failing and at 375px.

## CH-07 · Interaction adds detail, not decoration
Severity: info · Check: visual

**Rule.** Tooltips show the formatted value, unit and series name, appear on hover and focus, and follow the theme tokens. Hover highlights the hovered series and fades the rest. Entry animation is short (under 400ms), runs once, and is off under `prefers-reduced-motion` (MO-03). Big-number KPI tiles show the comparison that gives the number meaning ("+12% vs last month") with an arrow and text, not colour alone.

**Why.** Default tooltips are white boxes in dark mode with raw numbers; animated charts that redraw on every filter change make values hard to read and fail reduced-motion users.

**Bad.**
```tsx
<Tooltip /> <Line isAnimationActive animationDuration={1500} />
```

**Good.**
```tsx
<Tooltip content={<ChartTooltip format={currency} />} cursor={{ stroke: 'var(--border)' }} />
<Line isAnimationActive={!reducedMotion} animationDuration={300} />
```

**Check.** Visual: hover and Tab through a chart in dark mode; turn on reduced motion and reload.
