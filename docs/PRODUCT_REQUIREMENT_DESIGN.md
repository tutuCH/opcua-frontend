# Product Requirement Design: OPC-UA Dashboard

## 1. Introduction

This document outlines the product requirements and design for the OPC-UA Dashboard. It serves as a central resource for all stakeholders to understand the project's goals, features, and success metrics.

## 2. Vision and Goals

The OPC-UA Dashboard aims to provide a user-friendly interface for monitoring and managing industrial machines that use the OPC-UA protocol. The dashboard will enable users to view real-time data, track machine performance, and receive timely warnings about potential issues.

### Success Metrics:

* Usability: The dashboard should be intuitive and easy to use for both technical and non-technical users.
* Reliability: The dashboard should provide accurate and up-to-date information with minimal downtime.
* Scalability: The dashboard should be able to handle a growing number of machines and users without performance degradation.

## 3. Features

### 3.1. User Authentication

* **User Sign-up**

  * **UX Design:** A clean and simple sign-up form with fields for username, email, and password. The password field has a “show/hide” option. A link to the terms of service and privacy policy is included. Upon successful sign-up, the user is automatically logged in and redirected to the factory dashboard.
* **User Login**

  * **UX Design:** A login form with fields for email and password. A “Remember me” checkbox is available. A link to “Forgot Password” is provided. Upon successful login, the user is redirected to the factory dashboard.
* **Password Recovery**

  * **UX Design:** A form where the user enters their email address. An email with a password reset link is sent. The link leads to a page to set a new password.
* **Protected Routes**

  * **UX Design:** If a non-authenticated user tries to access a protected page, they are redirected to the login page. A message indicates that login is required.

### 3.2. Factory Dashboard

* **Factory Overview**

  * **UX Design:** The factory dashboard displays a grid of cards, each representing a machine. Each card shows a status indicator (green=running, yellow=idle, red=error), machine name, and a key performance indicator (e.g., production rate).
* **Machine Status**

  * **UX Design:** The status indicator updates in real time. Hover shows a tooltip with more details.
* **Navigation**

  * **UX Design:** Clicking a machine card navigates to the detailed machine dashboard.

### 3.3. Machine Dashboard

* **Detailed Machine View**

  * **UX Design:** A header with machine name and breadcrumb back to the factory dashboard. Sections for real-time data, historical data, and machine details.
* **Real-time Data**

  * **UX Design:** Gauges, charts, and numerical readouts update in real time.
* **Historical Data**

  * **UX Design:** Line/bar charts with selectable ranges (last hour, 24 hours, 7 days). Zoom in/out and pan.

### 3.4. Records and History

* **Data Logging**

  * **UX Design:** All machine data is logged to a database. Users view data in a “Records” page.
* **Historical Analysis**

  * **UX Design:** A table with filters for machine, date range, and parameters. Sortable by any column.
* **Data Export**

  * **UX Design:** Export filtered data to CSV or PDF via an “Export” button.

### 3.5. Warnings and Notifications

* **Warning System**

  * **UX Design:** A notification bell in the header shows a red dot on new warnings. Clicking opens a dropdown list of recent warnings with timestamps and links.
* **Notification System**

  * **UX Design:** In profile settings, users choose email notifications and select warning categories.

### 3.6. Error Handling

* **Page Not Found**

  * **UX Design:** A friendly 404 page with a clear message and a link to Home.
* **Error Boundary**

  * **UX Design:** A friendly runtime error screen with “Reload” and “Contact support”.

### 3.7. AI-Powered Assistant

* **Proactive Anomaly Detection**

  * **UX Design:** When anomalies are detected, a dashboard toast appears with a short description and a deep link to the machine dashboard with the anomaly highlighted on the chart.
  * **Acceptance:** The toast includes “View trend”, “Explain” buttons; clicking “Explain” opens a side panel with the cause hypothesis and relevant timestamps.
* **Real-time Optimization Recommendations**

  * **UX Design:** A “Recommendations” panel on the machine dashboard lists suggested actions with expected impact (e.g., “Reduce cooling time by 2s, +4% throughput”). Each row has “Apply later” and “Add to checklist”.
  * **Acceptance:** Recommendations show evidence (last 100 cycles stats) and confidence labels.
* **Predictive Maintenance**

  * **UX Design:** Maintenance alerts in the machine dashboard show failure probability, likely component, and “Create work order” button.
  * **Acceptance:** Alerts include a trend link and recent parameter changes that support the prediction.
* **Natural Language Interface**

  * **UX Design:** A chat icon in the bottom-right opens a messaging-style assistant. Users can ask questions (“Why is cycle time rising?”) or trigger actions (“Email yesterday’s downtime report”).
  * **Acceptance:** Responses include quick-action chips (e.g., “Open chart”, “Generate report”).

---

### 3.8. Device Onboarding (Broker/Server, Topic Mapping, Health)

* **UX Design:** An “Add Device” wizard with steps: Broker credentials → Topic discovery → Field mapping → Validation → Naming and grouping. A live payload preview shows detected fields. Health status (connected, lag, last message) appears on completion.
* **Acceptance:** After mapping, the device appears on the factory dashboard within 10 seconds with a green “Connected” badge. Topic lag and last-seen timestamps are visible in the device drawer.

### 3.9. Multi-Site and Hierarchy (Sites → Lines → Machines)

* **UX Design:** A site switcher in the top nav. The dashboard can be filtered by site/line. Breadcrumbs on machine pages show the full path.
* **Acceptance:** Users can view all sites or a single site; filters persist across page loads.

### 3.10. OEE and KPI Snapshot

* **UX Design:** Each machine card shows an OEE mini-badge with Availability, Performance, Quality breakdown on hover. A factory header band shows today’s OEE, throughput, and on-time schedule adherence.
* **Acceptance:** KPI calculations update at least every minute and match the data visible in records.

### 3.11. Production Planning & Scheduling (Kanban + Gantt)

* **UX Design:** A “Schedule” page with two tabs:

  * **Kanban:** Columns for Pending, In Progress, Done. Cards include Part, Mold, Material, Target Qty, ETA. Drag-and-drop to assign to a machine.
  * **Gantt:** A timeline view of jobs per machine, showing changeovers and constraints. Drag edges to resize. Conflicts highlight in red with tooltips.
* **Acceptance:** Dragging a job to a machine calculates ETA and flags conflicts (machine capability, mold not ready, material shortage). A “Best fit” button suggests machines based on live status and historical performance.

### 3.12. Master Data (Parts, Molds, Materials, Tools)

* **UX Design:** An Admin > Master Data area with tables for Parts, Molds, Materials, and Tools. Each record has readiness state (Ready, Setup, Maintenance), and compatibility tags (e.g., tonnage range, mold dimensions).
* **Acceptance:** Scheduling blocks assignment when readiness is “Maintenance” and prompts to override with a reason.

### 3.13. Cell & Peripheral Integration (Dryers, MTCs, Robots)

* **UX Design:** The machine detail page includes a “Cell” tab listing connected peripherals with simple status pills (OK, Warning, Error) and key readings (e.g., dryer dew point, MTC set/actual temp, robot cycle time).
* **Acceptance:** Peripherals show up as tiles; if a peripheral alarms, the main machine card shows a “Cell warning” badge.

### 3.14. Alarm Triage & SOP Playbooks

* **UX Design:** The “Alarms” tab clusters repeating alarms and displays an “Impact” badge (e.g., “High: 18 min lost today”). Each alarm type links to an SOP playbook with steps, safety notes, and a checklist. Users can acknowledge, add a note, and assign to a teammate.
* **Acceptance:** Acknowledgements are timestamped with user ID; completing a playbook checklist marks the alarm as “Resolved” and logs the resolution.

### 3.15. Maintenance & Work Orders (CMMS-lite)

* **UX Design:** A “Maintenance” page shows Work Orders (Open, In Progress, Closed), scheduled PMs, and MTTR/MTBF charts. From any alert, users can “Create work order”, which opens a modal with machine, symptom, checklist, and due date.
* **Acceptance:** Work orders appear immediately in the Maintenance list and link back to the originating machine/alarm.

### 3.16. Quality, SPC & Traceability

* **UX Design:** A “Quality” tab provides SPC charts (X-bar/MR) for CT and key process variables with configurable control limits. A “Traceability” view lets users filter runs by Part, Mold, Material Lot, Cavity, Operator, and Shift. Each lot/run has a downloadable run report.
* **Acceptance:** SPC warnings create soft alerts; clicking a point opens the exact cycles in the Records page. Traceability filters return results under 2 seconds for 1M+ records.

### 3.17. Reports & Auto-Reporting

* **UX Design:** A “Reports” page with templates: Daily Production, Downtime Pareto, Alarm Summary, Parameter Drift. Users pick time ranges and recipients, then click “Schedule” to set daily/weekly emails. Reports open in the browser and can export to PDF/CSV/XLSX.
* **Acceptance:** Scheduled emails arrive at the set time with links and attachments. Report values match dashboard KPIs for the same range.

### 3.18. Role-Based Access Control (RBAC) and Audit Logs

* **UX Design:** Admin > Roles defines permissions (view machines, edit schedule, acknowledge alarms, manage master data, view reports). An “Audit” page lists user actions (who, what, when), including alarm acks and schedule changes.
* **Acceptance:** Users without permission see disabled buttons with tooltips explaining the restriction. All state-changing actions appear in the audit list.

### 3.19. MES/ERP Handoff (Boundaries & APIs)

* **UX Design:** Admin > Integrations shows toggles for “Orders In” and “Completions Out” with API credentials. A compact schema preview explains required fields. An “Activity” subtab shows last sync, success/failure counts, and retry controls.
* **Acceptance:** When enabled, newly created jobs can be imported from MES; job completions (good/reject counts) can be posted back. Sync errors present clear messages and retry buttons.

### 3.20. AI-Assisted Scheduling & What-If

* **UX Design:** On the Schedule page, a right-side “What-If” panel allows users to select a job and tweak assumptions (cycle time, staffing, changeover duration). The panel shows the new ETA and impact on other jobs. A “Recommend sequence” button rearranges jobs virtually; users can “Apply” or “Discard”.
* **Acceptance:** Applying a recommendation updates the Gantt and creates an audit log entry with the agent’s rationale.

---

## 4. Architecture and Technology Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS.
* **Routing:** React Router.
* **Authentication:** JWT-based authentication.
* **Data Visualization:** Chart.js or a similar library.
* **State Management:** React Context API or a similar library.

**Additions:**

* **Ingestion:** OPC UA client service and MQTT subscriber (for gateways), normalizing payloads into a shared schema.
* **Data Stores:** Time-series database for telemetry; relational database for metadata, jobs, alarms, work orders, master data.
* **Realtime:** WebSocket/SSE channel for live cards, charts, toasts, and AI messages.
* **Reporting:** Server-side report generator (PDF/CSV/XLSX) and scheduler.
* **AI Services:** Anomaly/scoring service, ETA forecaster, SOP retrieval, and chat service with action tools.
* **Integrations:** REST/GraphQL endpoints for MES/ERP handoff; email service for scheduled reports and notifications.

---

## 5. Future Enhancements

* **Automated Process Control (Guarded)**

  * **UX Design:** Controlled “apply” flows where recommended parameter changes can be pushed to approved interfaces with dual confirmation and rollback.
* **Deeper Robot/Peripheral Recipes**

  * **UX Design:** Recipe comparison and verification for the whole cell before starting a run.
* **Multi-language Support**

  * **UX Design:** A language switcher in the header to select the preferred language.
* **Customizable Dashboards**

  * **UX Design:** Drag-and-drop widgets, resizable panels, and saved layouts per user role.
* **Mobile App (Companion)**

  * **UX Design:** A simplified mobile app for alarms, acknowledgements, work orders, and quick schedule edits.

---

### Notes for implementation

* Use consistent empty states, loading skeletons, and error toasts across all new pages.
* Each new feature includes a bottom “Help & SOP” link that opens contextual docs in a side panel.
* All time ranges use the global time picker and remember user preferences.
