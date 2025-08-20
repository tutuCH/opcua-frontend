# Real-time production status (運轉狀態畫面)

What data are shown. Machine status by color, current utilization, latest cycle time, current shot count, current molding condition name and mold name, plus indication of whether setpoints changed.&#x20;

Chart type. A live “tile grid”/card dashboard per machine with small KPI badges and color status.

How to optimize.

* Use a color-blind-safe palette and encode state with shape/labels, not color alone.
* Add sparklines for last 60 minutes of cycle time and shot rate on each tile.
* Surface “changed setpoints” with a pill badge and link to the condition-change diff.
* Let users pin critical machines and group tiles by line, mold family, or material.
* Provide latency badges (data age) and a subtle alarm banner when alarms exist.
* Virtualize rendering for >60 tiles; poll at 2–5s, but downsample to 10–15s render cadence to keep the UI smooth.

---

# “24-hour quality” view

What data are shown. Quality metrics over the last 24h, visible stability/variation, suspected causes of degradation, current molding conditions, and “expert know-how” context.&#x20;

Chart type. Time-series panel (one or more lines) with thresholds; optionally SPC overlays.

How to optimize.

* Use SPC bands (target ± spec, ±1/2/3σ).
* Add automatic regime change markers when conditions or molds change.
* Provide dual y-axes only if units differ drastically; otherwise normalize to z-scores and stack.
* Offer binning (1/5/15-minute) and outlier toggles; default to robust smoothing (e.g., median over 5 points).
* Add brush-and-zoom and link to the “Summary/Overview” timeline for the same window.

---

# Daily / Weekly / Monthly reports (日报・周报・月报)

What data are shown. For each machine, mold, and condition: shot counts, defect counts/rates, utilization, and rollups by day, then aggregated to week and month. Stored for one year; calendar/date picker to retrieve.&#x20;

Chart/table type. Tabular report with KPIs; optional small bar/line charts per row.

How to optimize.

* Pin key columns (date, machine, mold, condition).
* Add conditional formatting for defect rate and utilization thresholds.
* Provide subtotal rows by mold and condition; add drill-through to the 24h quality and “Summary” charts.
* Export to CSV/XLSX with the same filters; keep totals visible when scrolled (sticky footer).
* For weekly/monthly, add small multiples: stacked bars by defect category and a line for utilization.

---

# Detailed shot records (实绩的详细书面)

What data are shown. Every shot’s measured items (up to 30 custom items/machine): temperatures, times, positions, pressures, speeds, etc.; system can hold \~4.5 million shots.&#x20;

Chart/table type. Large fact table plus time-series detail when a row is selected.

How to optimize.

* Use column presets (Pressure/Speed/Position/Temperature groups).
* Add row-level anomaly flags based on SPC/I-MR rules and highlight them.
* Provide column histograms in headers for quick distribution peeks; enable range filters.
* Offer downsampling (LTTB) for plotting thousands of points without losing shape.
* Make time and shot number interchangeable x-axes for plots.

---

# Downtime reason log (停机原因履历 with PDA capture)

What data are shown. Start/end time, duration, reason codes (machine, auxiliary, mold), notes; entry via PDA on the floor.&#x20;

Chart/table type. Event table plus Pareto and timeline.

How to optimize.

* Display a Pareto bar chart of downtime by category and by machine for the selected range.
* Add a timeline lane per machine showing downtime blocks; color by category; click to edit notes.
* Provide MTBF/MTTR cards and trend lines.
* Ensure reason taxonomies are hierarchical and filterable.

---

# Trend chart (趋势图形)

What data are shown. Variation of injection-phase metrics across thousands of shots; emphasis on deviation over time.&#x20;

Chart type. Time-series variance/line chart; can be shown as “value and deviation from target.”

How to optimize.

* Show target and control limits; annotate drifts and step changes.
* Add an “overlay by mold/material” toggle to see stability differences when conditions switch.
* Offer a “variance heat strip” under the line (higher intensity = larger deviation).
* Enable “compare two time windows” with ghosting to validate improvements after changes.

---

# Correlation chart (相关图形)

What data are shown. Any two recorded items’ relationship, with ability to define acceptable ranges and click outliers to open their shot details.&#x20;

Chart type. Scatter plot with optional density contours; quadrant thresholds.

How to optimize.

* Add brush selection that cross-filters the shot table and opens shot traces.
* Provide regression fit (linear/LOESS) and R²; show Pearson/Spearman quickly.
* Support coloring by mold/material/batch; shape by machine/shift.
* Let users save “golden ranges” that also drive live alarms.

---

# Summary/Overview timeline (总括图形)

What data are shown. A 24-hour horizontal time axis showing machine operation states, quality signals, molding condition change history, alarms, stop reasons, and links to shot records. Clicking a region reveals details.&#x20;

Chart type. Multi-lane event timeline (Gantt-like) with stacked metrics below.

How to optimize.

* Use separate lanes: Operation state, Alarms, Condition changes, Downtime, and a compact quality KPI track.
* Add synchronized vertical cursor across lanes; hover shows consolidated tooltips.
* Provide “jump to” buttons: open the exact window in Trend/Correlation/Shot table.
* Support mini-map for fast navigation; allow bookmarking a time interval.

---

# Utilization within selected window

What data are shown. The utilization rate calculated for the exact time span selected on the Summary chart; also supports historical comparison.&#x20;

Chart type. KPI tile + small donut/bar; optional comparison sparkline.

How to optimize.

* Show absolute time in run/idle/alarm/stop buckets beside the percentage.
* Enable “compare to last week same window” so improvements are obvious.
* Color ranges should match the site’s OEE targets and be consistent across the app.

---

# Equipment Gantt (设备甘特图) with real-time scheduling

What data are shown. Machine-level schedule blocks for orders, planned mold maintenance, setup/changeover durations; late jobs indicated by color; generates instruction sheets; integrates real-time performance back into the plan.&#x20;

Chart type. Classic Gantt chart with machine as rows and time on x-axis.

How to optimize.

* Encode job status by border style (planned/started/blocked/done) and lateness by fill.
* Snap jobs to mold readiness and material availability; show soft/hard constraints icons.
* Provide “what-if” mode with resource loading bars and clash warnings.
* Attach KPIs to blocks (expected vs actual cycle time); late-risk forecast using current OEE.
* Offer bulk actions (drag to shift; right-click to split; auto-resequence).

---

# Traceability tables (材料／模具／成型／检验／组装／交货)

What data are shown. Materials: name, code, batch, receipt date, supplier, quality info. Molding step: machine, product, mold, batch, date, quantity, condition. Inspection: dates, counts, defect rates, quality info. Assembly: dates, station/line, operator, outputs, defect rates. Delivery: due date, product, batch, instruction, operator, carrier. One-year retention.&#x20;

Chart/table type. Linked master-detail tables with batch lineage.

How to optimize.

* Make lineage a first-class view: a Sankey/graph from material batch → mold → lots → shipments.
* Add “batch health” score aggregating defect rates across downstream steps.
* Provide QR/barcode search and exportable certificates (auto-compile relevant records).
* Use row-level badges for quarantined/hold lots.

---

# Multi-machine management (30 → 120 machines)

What data are shown. Hierarchical grouping by floor/group/server; same real-time indicators and drill-downs at scale; remote access via Web/i-mode for status and alarms.&#x20;

Chart type. Hierarchical tree + tile grid and section-level rollup charts.

How to optimize.

* Show rollups at each node (avg utilization, alarms, WIP) with trend arrows.
* Enable cross-site filters (mold/material/batch) and side-by-side site comparisons.
* For mobile, collapse charts into tappable KPIs with quick alarm acknowledgements.

---

## Cross-cutting visualization best practices for iii-System in your OPC-UA stack

Use consistent units and time zones, batch/lot and mold IDs as first-class filters, downsample time-series for responsiveness, and keep alarm colors consistent across all views. Add role-based presets (quality, production, maintenance). Implement brushing & linking between Summary ↔ Trend ↔ Correlation ↔ Shot table so one selection answers “what, when, why” in seconds.