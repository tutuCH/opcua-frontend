# Product Requirement Design: OPC-UA Dashboard

## 1. Introduction

This document outlines the product requirements and design for the OPC-UA Dashboard. It serves as a central resource for all stakeholders to understand the project's goals, features, and success metrics.

---

## 2. Vision and Goals

The OPC-UA Dashboard aims to provide a user-friendly interface for monitoring and managing industrial machines that use the OPC-UA protocol. The dashboard will enable users to view real-time data, track machine performance, and receive timely warnings about potential issues.

### Success Metrics

* **Usability:** Intuitive and easy for both technical and non-technical users.
* **Reliability:** Accurate, up-to-date information with minimal downtime.
* **Scalability:** Handle a growing number of machines and users without performance degradation.

---

## 3. Features

### 3.1 User Authentication

* **Sign-up:** Clean form (username, email, password, show/hide toggle). Link to Terms/Privacy. Auto-login on success.
* **Login:** Email + password, “Remember me”, “Forgot password”. Redirect to dashboard.
* **Password Recovery:** Email link → reset form.
* **Protected Routes:** Redirect unauthorized users with message.

### 3.2 Factory Dashboard

* **Overview:** Grid of machine cards: status (green/yellow/red), name, key KPI (production rate).
* **Status:** Real-time updates; hover tooltips.
* **Navigation:** Click card → machine detail page.

### 3.3 Machine Dashboard

* **Detailed View:** Header + breadcrumb. Sections: real-time, history, details.
* **Real-time Data:** Gauges, charts, numerical readouts.
* **Historical Data:** Line/bar charts with ranges (1h/24h/7d), zoom/pan.

### 3.4 Records and History

* **Logging:** All data saved to DB. “Records” page to view.
* **Analysis:** Filterable table by machine/date/parameter. Sortable.
* **Export:** CSV/PDF export.

### 3.5 Warnings and Notifications

* **Warning System:** Header bell, red dot if new warnings. Dropdown with timestamps.
* **Notifications:** User profile → select categories + email alerts.

### 3.6 Error Handling

* **404 Page:** Friendly message + Home link.
* **Error Boundary:** Runtime error screen with “Reload” + “Contact Support”.

### 3.7 AI-Powered Assistant

* **Anomaly Detection:** Toast notifications with “View trend”, “Explain”.
* **Recommendations:** Panel with suggestions, evidence, confidence levels.
* **Predictive Maintenance:** Alerts with probability, component, “Create work order”.
* **Natural Language Interface:** Chat widget for Q\&A and actions.

### 3.8 Device Onboarding

* Wizard: Broker credentials → topic discovery → field mapping → validation → naming.
* Payload preview; health status indicators.
* Device appears on dashboard within 10s after setup.

### 3.9 Multi-Site and Hierarchy

* Site switcher in nav; filter by site/line.
* Breadcrumbs show full hierarchy.

### 3.10 OEE & KPI Snapshot

* OEE mini-badge on machine cards.
* Factory header shows OEE, throughput, schedule adherence.

### 3.11 Production Planning & Scheduling

* **Kanban:** Pending, In Progress, Done. Drag cards.
* **Gantt:** Timeline per machine, with conflicts flagged.
* **Best Fit:** Suggest optimal machine based on status + history.

### 3.12 Master Data

* Admin > Master Data: Parts, Molds, Materials, Tools.
* Readiness states (Ready, Setup, Maintenance).
* Scheduling blocked if “Maintenance” unless override reason given.

### 3.13 Cell & Peripheral Integration

* Machine detail → “Cell” tab with peripherals.
* Status pills (OK/Warning/Error).
* Peripheral alarms propagate to main machine card.

### 3.14 Alarm Triage & SOP Playbooks

* **Alarms Tab:** Clustered by type, with “Impact” badge.
* **Playbooks:** Linked steps, notes, safety.
* **Actions:** Acknowledge, assign, add note. Logged with user + timestamp.

### 3.15 Maintenance & Work Orders

* “Maintenance” page with work orders (Open/In Progress/Closed).
* Create WO directly from alert.
* Charts for MTTR/MTBF.

### 3.16 Quality, SPC & Traceability

* SPC charts (X-bar/MR) for CT and key process variables.
* Traceability filters: Part, Mold, Material Lot, Cavity, Operator, Shift.
* Run reports downloadable per lot.

### 3.17 Reports & Auto-Reporting

* Templates: Daily Production, Downtime Pareto, Alarm Summary, Parameter Drift.
* Schedule daily/weekly emails with links + attachments.
* Reports exportable as PDF/CSV/XLSX.

### 3.18 RBAC & Audit Logs

* Admin > Roles with permission matrix.
* Audit log of all user actions.
* Disabled buttons show tooltips if permission missing.

### 3.19 MES/ERP Handoff

* Admin > Integrations: Orders In, Completions Out.
* API credentials + schema preview.
* Activity tab: last sync, success/failure counts, retries.

### 3.20 AI-Assisted Scheduling & What-If

* “What-If” panel on Schedule page.
* Tweak assumptions → see ETA impact.
* “Recommend sequence” rearranges jobs virtually.
* Applying updates Gantt + audit log.

---

## 4. Architecture and Technology Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS.
* **Routing:** React Router.
* **Authentication:** JWT.
* **Visualization:** Chart.js or similar.
* **State:** React Context API or similar.

**Additions:**

* **Ingestion:** OPC UA client + MQTT subscriber.
* **Data Stores:** Time-series DB (telemetry), relational DB (metadata, jobs, alarms, WOs).
* **Realtime:** WebSocket/SSE for live cards, charts, toasts, AI.
* **Reporting:** Server-side generator (PDF/CSV/XLSX).
* **AI Services:** Anomaly detection, ETA forecast, SOP retrieval, chat agent.
* **Integrations:** REST/GraphQL for MES/ERP; email service.

---

## 5. Future Enhancements

* Automated Process Control (with dual confirmation + rollback).
* Robot/Peripheral recipe comparison.
* Multi-language support (language switcher).
* Customizable dashboards (drag/drop, save layouts).
* Mobile companion app (alarms, WOs, schedule edits).

---

## 6. Visualization & Reporting Design

Detailed chart and table specifications for all visualization modules.

### 6.1 Real-Time Production Status (運轉狀態画面)

* Machine status, utilization, cycle time, shot count, condition, mold name, setpoint changes.
* **Tile grid dashboard** with KPIs.
* Optimizations: sparklines, setpoint pills, latency badges, group by line/mold/material, >60 tiles virtualized.

### 6.2 24-Hour Quality View

* Metrics: defect rate, stability, degradation causes.
* **Time-series with SPC overlays**.
* Optimizations: regime markers, z-score normalization, brush & zoom, binning.

### 6.3 Daily / Weekly / Monthly Reports

* Shot counts, defects, utilization.
* **KPI tables + embedded charts.**
* Optimizations: subtotals, drill-through, exports, sticky columns.

### 6.4 Detailed Shot Records

* Up to 30 items per machine, \~4.5M shots.
* **Fact table + time-series detail.**
* Optimizations: anomaly flags, histograms, range filters, downsampling.

### 6.5 Downtime Reason Log

* Start/end, duration, reason codes, notes.
* **Event table + Pareto + timeline.**
* Optimizations: MTBF/MTTR KPIs, hierarchical filtering.

### 6.6 Trend Chart

* Injection metrics across thousands of shots.
* **Time-series variance chart.**
* Optimizations: control limits, overlays, heat strips, window comparisons.

### 6.7 Correlation Chart

* Scatter of two variables.
* **Scatter plot with density contours.**
* Optimizations: regression fit, cross-filter, golden ranges.

### 6.8 Summary/Overview Timeline

* 24h lanes: Operation, Alarms, Condition changes, Downtime, KPI.
* **Multi-lane timeline.**
* Optimizations: vertical cursor, mini-map, interval bookmarks.

### 6.9 Utilization in Selected Window

* Utilization % + absolute times.
* **KPI tile + donut/bar.**
* Optimizations: compare to last week, OEE thresholds.

### 6.10 Equipment Gantt

* Orders, maintenance, changeover blocks.
* **Classic Gantt chart.**
* Optimizations: border styles for state, constraints, what-if mode, KPIs.

### 6.11 Traceability Tables

* Material → Molding → Inspection → Assembly → Delivery.
* **Master-detail tables + Sankey lineage.**
* Optimizations: QR search, batch health score, certificates, quarantine badges.

### 6.12 Multi-Machine Management

* Hierarchical view for 30–120 machines.
* **Tree + tile grid + rollups.**
* Optimizations: rollup KPIs, cross-site filters, mobile KPIs.

---

## 7. Material Consumption & Forecasting

### 7.1 Per-Cycle Data

* Capture cycle time (seconds).
* Capture plastic weight per shot (grams).

### 7.2 Factory Stock

* Manual entry of total stock (kg).
* KPI card on dashboard showing current stock.

### 7.3 Forecasting

* Compute usage/minute = cycle × grams.
* Deduct from stock; forecast depletion date/time.
* Safety stock alerts.
* What-if toggles: faster cycle, scrap %, job mix.

---

## 8. Additional Management Features

1. **Energy Monitoring:** Track kWh per cycle, cost, CO₂ footprint.
2. **Tooling Life Tracking:** Mold open/close counts, predict maintenance.
3. **Operator Performance:** Setup times, alarm response, yield per shift.
4. **Recipe Management:** Compare & validate condition sets.
5. **Scrap/Regrind Tracking:** Scrap % and regrind reuse; link to material forecast.
6. **Maintenance Knowledge Base:** Link alarms to SOPs + past resolutions.
7. **AI Demand Forecast:** From ERP orders, predict machine loading & raw material.
8. **Carbon Footprint Reporting:** Energy + material waste rolled up to sustainability KPIs.
9. **Batch Certification:** Auto-generate certificates for lot traceability + quality.
10. **Mobile Operator Alerts:** Lightweight app to acknowledge alarms & view KPIs.

---

## 9. Implementation Notes

* Use consistent empty states, loading skeletons, error toasts.
* “Help & SOP” link on each page → contextual docs.
* Global time picker + persistent user preferences.
