import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * SPEC ALIGNMENT NOTES
 * - Replaced external gauge lib with in-house SemiDonutGauge (PieChart-based).
 * - Added: Utilization on machine cards, X-bar chart with Mean/UCL/LCL, Injection Profile plot,
 *   Heater zones T1–T10, Oil temperature with thresholds, Cumulative production chart,
 *   Pareto of defects, Alarm timeline (mock), Operator-change overlay with ReferenceLines.
 * - Kept Test Panel; expanded tests to cover new datasets.
 */

/********************** Mock Data ************************/
// 1) Cycle Time series for SPC (X-bar)
const cycleData = Array.from({ length: 40 }, (_, i) => ({
  cycle: i + 1,
  time: 25 + Math.sin(i / 6) * 1.8 + (Math.random() - 0.5) * 0.8,
}));
const mean = cycleData.reduce((a, b) => a + b.time, 0) / cycleData.length;
const variance = cycleData.reduce((a, b) => a + (b.time - mean) ** 2, 0) / cycleData.length;
const sd = Math.sqrt(variance);
const UCL = mean + 3 * sd;
const LCL = Math.max(0, mean - 3 * sd);

// 2) Switchover window scatter (ESIPS vs ESIPP)
const switchoverData = Array.from({ length: 50 }, () => ({
  stroke: 30 + Math.random() * 5,
  pressure: 90 + Math.random() * 12,
}));

// 3) Injection profile within a cycle (time vs pressure/velocity)
const profileData = Array.from({ length: 60 }, (_, i) => {
  const t = i / 59; // 0..1
  // Mock curves
  const vel = 120 * Math.sin(Math.min(Math.PI, t * Math.PI));
  const pres = 60 + 40 * Math.pow(Math.sin(t * Math.PI), 1.6);
  return { t: +(t * 100).toFixed(1), velocity: +vel.toFixed(1), pressure: +pres.toFixed(1) };
});

// 4) Heater band temperatures T1..T10
const temperatureData = Array.from({ length: 24 }, (_, i) => {
  const base = 216 + (Math.sin(i / 3) * 1.2);
  const obj = { time: i };
  for (let z = 1; z <= 10; z++) obj[`T${z}`] = +(base + (z - 5) * 0.3 + (Math.random() - 0.5) * 0.8).toFixed(1);
  return obj;
});

// 5) Oil temperature trend with thresholds
const oilTempData = Array.from({ length: 24 }, (_, i) => ({
  time: i,
  OT: 42 + Math.sin(i / 4) * 2 + (Math.random() - 0.5) * 0.7,
}));
const OT_MIN = 40;
const OT_MAX = 48;

// 6) Yield by shift (stacked) & cumulative production over time
const yieldData = [
  { shift: "Shift 1", good: 950, bad: 50 },
  { shift: "Shift 2", good: 900, bad: 100 },
  { shift: "Shift 3", good: 970, bad: 30 },
];
const productionTimeline = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i + 1).toString().padStart(2, "0")}:00`,
  produced: 70 + Math.round(i * 5 + Math.random() * 10),
})).map((d, i, arr) => ({ ...d, cumulative: arr.slice(0, i + 1).reduce((a, b) => a + b.produced, 0) }));

// 7) Pareto of defect causes
const defectCauses = [
  { cause: "Short Shot", count: 42 },
  { cause: "Flash", count: 30 },
  { cause: "Burn Mark", count: 18 },
  { cause: "Warp", count: 12 },
  { cause: "Splay", count: 8 },
];
const totalDefects = defectCauses.reduce((a, b) => a + b.count, 0);
let running = 0;
const defectPareto = defectCauses.map((d) => {
  running += d.count;
  return { ...d, cumulativePct: +(running / totalDefects * 100).toFixed(1) };
});

// 8) Alarm timeline (mock) & Operator parameter changes overlay
const alarmEvents = [
  { machine: "M-01", t: 2, severity: "high" },
  { machine: "M-01", t: 9, severity: "med" },
  { machine: "M-02", t: 5, severity: "low" },
  { machine: "M-02", t: 16, severity: "high" },
  { machine: "M-03", t: 11, severity: "med" },
];
const sevColor = (s) => (s === "high" ? "#ef4444" : s === "med" ? "#f59e0b" : "#60a5fa");

const parameterTrend = Array.from({ length: 24 }, (_, i) => ({ time: i, value: 95 + Math.sin(i / 4) * 3 }));
const changeTimes = [6, 14, 18];

// 9) OEE gauges
const OEE = [
  { label: "Availability", value: 0.92, color: "#22c55e" },
  { label: "Performance", value: 0.87, color: "#3b82f6" },
  { label: "Quality", value: 0.95, color: "#f59e0b" },
];

const COLORS = ["#4ade80", "#f87171"]; // good / bad

/********************** Helpers ************************/
const clamp01 = (v) => Math.max(0, Math.min(1, v ?? 0));

/********************** Components ************************/
function SemiDonutGauge({ value, color = "#22c55e", size = 220, thickness = 24 }) {
  const v = Math.round(clamp01(value) * 100);
  const data = [
    { name: "value", value: v },
    { name: "remainder", value: 100 - v },
  ];
  const outer = size / 2;
  const inner = outer - thickness;

  return (
    <div className="relative" style={{ width: size, height: size / 2 }}>
      <PieChart width={size} height={size / 2}>
        <Pie
          startAngle={180}
          endAngle={0}
          data={data}
          dataKey="value"
          cx={size / 2}
          cy={size / 2}
          innerRadius={inner}
          outerRadius={outer}
          stroke="none"
        >
          <Cell key="val" fill={color} />
          <Cell key="rem" fill="#E5E7EB" />
        </Pie>
        <Tooltip formatter={(val) => `${val}%`} />
      </PieChart>
      <div className="absolute left-0 right-0 -bottom-2 text-center">
        <span className="text-xl font-bold">{v}%</span>
      </div>
    </div>
  );
}

function TestPanel() {
  // Minimal runtime tests to validate data shapes & assumptions.
  const tests = [];

  // Test 1: cycleData length and monotonic cycles
  tests.push({ name: "cycleData length", pass: cycleData.length >= 30, msg: `>=30 expected, got ${cycleData.length}` });
  const monotonic = cycleData.every((d, i) => (i === 0 ? true : d.cycle > cycleData[i - 1].cycle));
  tests.push({ name: "cycleData monotonic cycles", pass: monotonic, msg: monotonic ? "ok" : "non-monotonic" });

  // Test 2: switchoverData numeric fields
  const swValid = switchoverData.every((d) => typeof d.stroke === "number" && typeof d.pressure === "number");
  tests.push({ name: "switchoverData numeric", pass: swValid, msg: swValid ? "ok" : "invalid fields" });

  // Test 3: temperature keys present (T1..T10)
  const tZones = Array.from({ length: 10 }, (_, i) => `T${i + 1}`);
  const tempValid = temperatureData.every((d) => tZones.every((k) => typeof d[k] === "number"));
  tests.push({ name: "temperatureData T1..T10", pass: tempValid, msg: tempValid ? "ok" : "missing zone" });

  // Test 4: OEE values in [0,1]
  const oeeValid = OEE.every((g) => g.value >= 0 && g.value <= 1);
  tests.push({ name: "OEE bounds", pass: oeeValid, msg: oeeValid ? "ok" : "out of bounds" });

  // Test 5: Pareto cumulative ends at ~100%
  const last = defectPareto[defectPareto.length - 1]?.cumulativePct ?? 0;
  tests.push({ name: "Pareto cumulative", pass: Math.abs(last - 100) < 0.01, msg: `ends at ${last}%` });

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Test Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          {tests.map((t, i) => (
            <li key={i} className={t.pass ? "text-emerald-700" : "text-red-600"}>
              <span className="font-medium">{t.pass ? "PASS" : "FAIL"}:</span> {t.name} — {t.msg}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/********************** Page ************************/
export default function IConnectDashboard() {
  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* Machine Overview (cards with Utilization) */}
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Machine Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Machine 1", status: "Production", util: 0.88 },
            { name: "Machine 2", status: "Standby", util: 0.41 },
            { name: "Machine 3", status: "Production", util: 0.93 },
            { name: "Machine 4", status: "Alarm", util: 0.35 },
          ].map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl shadow text-center ${
                m.status === "Production" ? "bg-green-100" : m.status === "Standby" ? "bg-yellow-100" : "bg-red-100"
              }`}
            >
              <p className="font-bold">{m.name}</p>
              <p>
                Status: <span className={m.status === "Production" ? "text-green-600" : m.status === "Standby" ? "text-yellow-700" : "text-red-600"}>{m.status}</span>
              </p>
              <p>Utilization: {(m.util * 100).toFixed(0)}%</p>
              <p>Cycle Time: {mean.toFixed(1)}s</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabs for different analyses */}
      <Tabs defaultValue="spc" className="col-span-12">
        <TabsList>
          <TabsTrigger value="spc">SPC Monitoring</TabsTrigger>
          <TabsTrigger value="yield">Yield & Defects</TabsTrigger>
          <TabsTrigger value="temp">Temperature</TabsTrigger>
          <TabsTrigger value="oee">OEE</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>

        {/* SPC Charts */}
        <TabsContent value="spc" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* X-bar with UCL/LCL */}
          <Card>
            <CardHeader>
              <CardTitle>Cycle Time Stability (X-bar)</CardTitle>
            </CardHeader>
            <CardContent>
              <ComposedChart width={520} height={260} data={cycleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cycle" label={{ value: "Cycle #", position: "insideBottom", dy: 10 }} />
                <YAxis label={{ value: "Time (s)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="Cycle Time" dataKey="time" stroke="#2563eb" dot={false} />
                <ReferenceLine y={mean} label="Mean" stroke="#10b981" strokeDasharray="5 5" />
                <ReferenceLine y={UCL} label="UCL" stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={LCL} label="LCL" stroke="#ef4444" strokeDasharray="3 3" />
              </ComposedChart>
            </CardContent>
          </Card>

          {/* Injection profile */}
          <Card>
            <CardHeader>
              <CardTitle>Injection Profile (Within Cycle)</CardTitle>
            </CardHeader>
            <CardContent>
              <ComposedChart width={520} height={260} data={profileData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" label={{ value: "% of Cycle", position: "insideBottom", dy: 10 }} />
                <YAxis yAxisId="left" label={{ value: "Pressure (bar)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Velocity (mm/s)", angle: -90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" name="Pressure" dataKey="pressure" stroke="#ef4444" dot={false} />
                <Line yAxisId="right" type="monotone" name="Velocity" dataKey="velocity" stroke="#3b82f6" dot={false} />
              </ComposedChart>
            </CardContent>
          </Card>

          {/* Switchover scatter */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Switchover Window (ESIPS vs ESIPP)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScatterChart width={1080} height={260}>
                <CartesianGrid />
                <XAxis dataKey="stroke" name="Stroke (mm)" />
                <YAxis dataKey="pressure" name="Pressure (bar)" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter name="Shots" data={switchoverData} fill="#f97316" />
              </ScatterChart>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yield & Production */}
        <TabsContent value="yield" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Yield by Shift</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart width={520} height={260} data={yieldData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shift" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar name="Good" dataKey="good" stackId="a" fill="#4ade80" />
                <Bar name="Bad" dataKey="bad" stackId="a" fill="#f87171" />
              </BarChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cumulative Production</CardTitle>
            </CardHeader>
            <CardContent>
              <ComposedChart width={520} height={260} data={productionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar name="Produced" dataKey="produced" fill="#60a5fa" />
                <Line name="Cumulative" type="monotone" dataKey="cumulative" stroke="#0ea5e9" />
              </ComposedChart>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Pareto of Defect Causes</CardTitle>
            </CardHeader>
            <CardContent>
              <ComposedChart width={1080} height={260} data={defectPareto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cause" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" name="Count" dataKey="count" fill="#94a3b8" />
                <Line yAxisId="right" name="Cumulative %" type="monotone" dataKey="cumulativePct" stroke="#f59e0b" />
                <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 2" label="80%" />
              </ComposedChart>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temperature & Oil */}
        <TabsContent value="temp" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Heater Band Temperatures (T1–T10)</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart width={520} height={260} data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: "Time", position: "insideBottom", dy: 10 }} />
                <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                {Array.from({ length: 10 }, (_, i) => (
                  <Line key={i} type="monotone" dataKey={`T${i + 1}`} strokeWidth={1.5} stroke={`hsl(${(i * 36) % 360},70%,50%)`} dot={false} />
                ))}
                <Legend />
              </LineChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Oil Temperature (OT) with Thresholds</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart width={520} height={260} data={oilTempData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis label={{ value: "°C", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="OT" dataKey="OT" stroke="#10b981" dot={false} />
                <ReferenceLine y={OT_MIN} stroke="#f59e0b" strokeDasharray="4 2" label="Min" />
                <ReferenceLine y={OT_MAX} stroke="#f59e0b" strokeDasharray="4 2" label="Max" />
              </LineChart>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OEE Gauges (Semi-Donut) */}
        <TabsContent value="oee" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OEE.map((g, i) => (
            <Card key={i} className="flex flex-col items-center justify-center p-4">
              <CardTitle className="mb-2">{g.label}</CardTitle>
              <SemiDonutGauge value={g.value} color={g.color} />
              <p className="text-sm text-muted-foreground mt-2">Target ≥ 90%</p>
            </Card>
          ))}
        </TabsContent>

        {/* Events: Alarms timeline & Operator changes overlay */}
        <TabsContent value="events" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alarm Timeline (Mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScatterChart width={520} height={260}>
                <CartesianGrid />
                <XAxis dataKey="t" name="Time" />
                <YAxis dataKey="machine" type="category" allowDuplicatedCategory={false} />
                <Tooltip />
                {alarmEvents.map((e, idx) => (
                  <Scatter key={idx} data={[e]} name={e.severity} fill={sevColor(e.severity)} />
                ))}
                <Legend />
              </ScatterChart>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parameter Change Overlay</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart width={520} height={260} data={parameterTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="Setpoint" dataKey="value" stroke="#6366f1" dot={false} />
                {changeTimes.map((t, i) => (
                  <ReferenceLine key={i} x={t} stroke="#ef4444" strokeDasharray="3 3" label={`Change @ ${t}`} />
                ))}
              </LineChart>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests */}
        <TabsContent value="tests">
          <TestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
