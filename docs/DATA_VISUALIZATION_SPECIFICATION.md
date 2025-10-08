# Data Visualization Specification for i-Connect Clone

## 1. Realtime Machine Monitoring

### Machine Overview Dashboard

* **Visualization:** Grid of machine cards (traffic-light style color coding).
* **Data:**

  * STS (status): 1=Standby, 2=Production.
  * OPM (operation mode).
  * Cycle count (CYCN).
* **Display:**

  * **Icon + color**: Green (Producing), Yellow (Standby), Red (Alarm).
  * **KPIs:** Current cycle time, part count, utilization %.

---

## 2. Process Stability & SPC Monitoring

### Cycle Time Stability

* **Chart:** **Control Chart (X-bar/R chart)**.
* **X-axis:** Cycle number (CYCN) or timestamp.
* **Y-axis:** Cycle time (ECYCT).
* **Additional Lines:** Mean, Upper Control Limit (UCL), Lower Control Limit (LCL).
* **Use:** Detect drift, instability, or abnormal variation.

### Injection Pressure / Velocity

* **Chart:** **Line Chart (multi-series)**.
* **X-axis:** Time within a cycle (EISS → EIPSE).
* **Y-axis:** Pressure (EIPM, ESIPP) or Velocity (EIVM).
* **Overlay:** Expected profile vs. actual curve.
* **Use:** Compare actual injection curve with set parameters.

### Switchover Monitoring

* **Chart:** **Scatter Plot**.
* **X-axis:** Switchover stroke (ESIPS).
* **Y-axis:** Switchover pressure (ESIPP).
* **Color:** Pass/Fail (quality outcome).
* **Use:** Identify stability around optimal switchover window.

---

## 3. Quality & Defect Tracking

### Yield & Defect Ratio

* **Chart:** **Stacked Bar Chart**.
* **X-axis:** Shift/Day.
* **Y-axis:** Part count.

  * Green = Good parts (JobGoodPartsCounter).
  * Red = Bad parts (JobBadPartsCounter).
* **Use:** Quickly spot shifts/days with high defect rates.

### Defect Cause Correlation

* **Chart:** **Pareto Chart** (bar + cumulative line).
* **X-axis:** Defect categories (scrap reason codes, alarms).
* **Y-axis (left):** Frequency.
* **Y-axis (right):** Cumulative %.
* **Use:** Apply 80/20 rule for improvement focus.

---

## 4. Temperature Monitoring

### Heater Band Temperatures

* **Chart:** **Multi-line Chart**.
* **X-axis:** Timestamp.
* **Y-axis:** Temperature (T1–T10, ET1–ET10).
* **Use:** Spot deviations between heater zones, ensure thermal balance.

### Oil Temperature (OT)

* **Chart:** **Trend Line with Threshold Bands**.
* **X-axis:** Time.
* **Y-axis:** Oil Temp (OT).
* **Reference Lines:** Normal operating range.
* **Use:** Detect cooling issues.

---

## 5. Production & OEE Reporting

### Production Output

* **Chart:** **Cumulative Line Chart**.
* **X-axis:** Time (hour/shift/day).
* **Y-axis:** Parts produced (good + bad).
* **Use:** Track if production is on pace to meet targets.

### OEE Dashboard

* **Chart:** **Gauge Charts** (3 circular gauges).

  * Availability.
  * Performance.
  * Quality.
* **Overall OEE:** Composite gauge.
* **Use:** Executive-level KPI snapshot.

---

## 6. Alarm & Event Visualization

### Alarm Timeline

* **Chart:** **Gantt / Timeline Chart**.
* **X-axis:** Time.
* **Y-axis:** Machine ID.
* **Markers:** Alarm events (color-coded by severity).
* **Use:** See when/why machines stop, correlate with process data.

### Operator Parameter Changes

* **Chart:** **Audit Trail Table + Highlighted Line Overlay**.
* **X-axis:** Time.
* **Y-axis:** Changed parameter value.
* **Overlay:** Highlight on the trend line where operator changes occurred.
* **Use:** Trace root cause of instability.

---

## 7. Advanced Analytics Visuals

### Correlation Plots

* **Chart:** **Scatter Plot Matrix**.
* **Variables:** Cycle time vs. pressure, temperature vs. defect rate.
* **Use:** Discover relationships between process parameters and quality.

### Trend Summaries

* **Chart:** **Heatmap**.
* **X-axis:** Time of day.
* **Y-axis:** Machine ID.
* **Color:** Cycle time deviation or defect %.
* **Use:** Identify problematic machines/shifts at a glance.

---

## 8. Design Principles

* **Consistency:** Use same color coding across charts (e.g., Red=Alarm/Bad, Green=Good).
* **Drill-down:** From plant-level → machine-level → cycle-level.
* **Interactivity:** Zoom in on SPC charts, hover for parameter details.
* **Comparisons:** Overlay actual vs. set values for quick deviation detection.

---