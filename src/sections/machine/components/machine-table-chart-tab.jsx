import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MachineRawTable from "./machine-raw-table";
import MachineCharts from "./machine-charts";

export default function MachineTableChartTab() {
  return (
    <Tabs defaultValue="chart">
      <TabsList>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
      </TabsList>
      <TabsContent value="chart">
        <MachineCharts />
      </TabsContent>      
      <TabsContent value="table">
        <MachineRawTable />
      </TabsContent>
    </Tabs>
  );
}