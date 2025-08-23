# OPC UA – Valid Supported Node List

### IMM\_MES\_InterfaceType

* **CycleParametersEventType** – ObjectType: Event&#x20;
* **LogbookEventType** – ObjectType: Event&#x20;
* **InjectionUnits** – ObjectType: Object&#x20;
* **Jobs** – ObjectType: Object&#x20;
* **MachineConfiguration** – ObjectType: Object&#x20;
* **MachineInformation** – ObjectType: Object&#x20;
* **MachineMESConfiguration** – ObjectType: Object&#x20;
* **MachineMESStatus** – ObjectType: Object&#x20;
* **MachineStatus** – ObjectType: Object&#x20;
* **Moulds** – ObjectType: Object&#x20;
* **PowerUnits** – ObjectType: Object&#x20;
* **ProductionDatasetManagement** – ObjectType: Object&#x20;

---

### CycleParametersEventType (Variables)

* **BoxBadPartsCounter** – DataType: DOUBLE – MachineItemID: `Q2C1C302`, `N1C5K805`&#x20;
* **BoxCycleCounter** – DataType: DOUBLE – MachineItemID: `Q2C1C300`&#x20;
* **BoxGoodPartsCounter** – DataType: DOUBLE – MachineItemID: `P1C1C305`, `N1C5K805`&#x20;
* **BoxPartsCounter** – DataType: DOUBLE – MachineItemID: `Q2C1C300`, `N1C5K805`&#x20;
* **CycleTime** – DataType: DOUBLE – MachineItemID: `VAT1T300`&#x20;
* **JobBadPartsCounter** – DataType: DOUBLE – MachineItemID: `Q2C1C302`, `N1C5K805`&#x20;
* **JobCycleCounter** – DataType: DOUBLE – MachineItemID: `Q2C1C300`&#x20;
* **JobGoodPartsCounter** – DataType: DOUBLE – MachineItemID: `P1C1C305`, `N1C5K805`&#x20;
* **JobName** – DataType: STRING – MachineItemID: `N1WKK800`&#x20;
* **JobPartsCounter** – DataType: DOUBLE – MachineItemID: `Q2C1C300`&#x20;
* **MachineCycleCounter** – DataType: DOUBLE – MachineItemID: `SMC1C307`&#x20;
* **PartId** – DataType: STRING – MachineItemID: `N1WKK803`&#x20;

---

### InjectionUnit\_1

* **ScrewDiameter** – DataType: DOUBLE – MachineItemID: `SYC3K002`&#x20;
* **TemperatureZone\_1.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H000`&#x20;
* **TemperatureZone\_1.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H000`&#x20;
* **TemperatureZone\_1.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H050`&#x20;
* **TemperatureZone\_2.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H001`&#x20;
* **TemperatureZone\_2.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H001`&#x20;
* **TemperatureZone\_2.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H051`&#x20;
* **TemperatureZone\_3.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H002`&#x20;
* **TemperatureZone\_3.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H002`&#x20;
* **TemperatureZone\_3.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H052`&#x20;
* **TemperatureZone\_4.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H003`&#x20;
* **TemperatureZone\_4.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H003`&#x20;
* **TemperatureZone\_4.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H053`&#x20;
* **TemperatureZone\_5.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H004`&#x20;
* **TemperatureZone\_5.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H004`&#x20;
* **TemperatureZone\_5.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H054`&#x20;
* **TemperatureZone\_6.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H005`&#x20;
* **TemperatureZone\_6.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H005`&#x20;
* **TemperatureZone\_6.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H055`&#x20;
* **TemperatureZone\_7.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H006`&#x20;
* **TemperatureZone\_7.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H006`&#x20;
* **TemperatureZone\_7.StandbyTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H056`&#x20;

---

### MachineInformation

* **SerialNumber** – DataType: DOUBLE – MachineItemID: `SYC6K005`&#x20;

---

### MachineStatus

* **MachineMode(\*)** – DataType: DOUBLE – MachineItemID: `VAC3A100`
  (*Values: 0=Initial, 1=ModeOff, 2=Stand-by, 4=Manual, 8=Semi-Automatic, 16=Automatic, 32=Semi\&Full-automatic*)&#x20;

---

### Mould\_1

* **TemperatureZone\_1.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H011`&#x20;
* **TemperatureZone\_1.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H011`&#x20;
* **TemperatureZone\_2.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H012`&#x20;
* **TemperatureZone\_2.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H012`&#x20;
* **TemperatureZone\_3.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H013`&#x20;
* **TemperatureZone\_3.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H013`&#x20;
* **TemperatureZone\_4.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H014`&#x20;
* **TemperatureZone\_4.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H014`&#x20;
* **TemperatureZone\_5.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H015`&#x20;
* **TemperatureZone\_5.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H015`&#x20;
* **TemperatureZone\_6.ActualTemperature** – DataType: DOUBLE – MachineItemID: `T2H1H016`&#x20;
* **TemperatureZone\_6.NominalTemperature** – DataType: DOUBLE – MachineItemID: `T1H1H015`&#x20;

---

### GeneralActualType

* **Shot count** – DataType: DOUBLE – MachineItemID: `Q2C1C300`&#x20;
* **Cycle time** – DataType: DOUBLE – MachineItemID: `VAT1T300`&#x20;
* **Machine status(\*)** – DataType: DOUBLE – MachineItemID: `VAC3A073`
  (*Values: 0=PowerOff, 1=Operating, 2=Stop, 4=Alarm, 8=Automatic mode disabled*)&#x20;


---
Got it ✅
We can extend the document by adding a new section for **ELINK – Collected Data Variables (采集数据列表)** based on the user manual (sections 1.2.1 to 1.2.4).

Here’s the updated draft with the new section appended:

---

# OPC UA – Valid Supported Node List

*(your existing content remains unchanged here …)*

---

# ELINK – Collected Data Variables (采集数据列表)

### 1.2.1 过程数据 (Process Data)

* **CYCN** – Cycle number
* **ECYCT** – Cycle time
* **EISS** – Injection stroke start
* **EIVM** – Injection V max
* **EIPM** – Injection pressure max
* **ESIPT** – Switch Inj pack time
* **ESIPP** – Switch Inj pack pressure
* **ESIPS** – Switch Inj pack stroke
* **EIPT** – Injection time
* **EIPSE** – Injection stroke end
* **EPLST** – Plasticizing time
* **EPLSSE** – Plasticizing stroke end
* **EPLSPM** – Plasticizing pressure max
* **ET1…ET10** – Barrel zone production temperatures

---

### 1.2.2 温度数据 (Temperature Data)

* **OPM** – Operate mode (0=Manual, 1=Semi-auto, 2=Photo-electric auto, 3=Timer auto, 4=Die setup)
* **STS** – Machine status (1=Standby, 2=Production)
* **T1…T10** – Temperature sensors
* **OT** – Oil temperature

---

### 1.2.3 工艺数据 (Technology / Process Parameters)

* **TS1…TS10** – Set temperatures
* **IP1…IP10** – Injection pressures
* **IV1…IV10** – Injection speeds
* **IS1…IS10** – Injection positions
* **IT1…IT10** – Injection times
* **ITUSE** – Injection by time (1=enabled, 0=disabled)
* **ISUSE** – Injection by position (1=enabled, 0=disabled)
* **IPT** – Hold pressure switch time
* **IPS** – Hold pressure switch position
* **IPP** – Hold pressure switch pressure
* **PP1…PP10** – Holding pressures
* **PV1…PV10** – Holding speeds
* **PT1…PT10** – Holding times
* **SBS1, SBT1** – Pre-plasticizing retract distance / time
* **PLLT** – Plasticizing limit time
* **PLV1…PLV10** – Plasticizing screw speeds
* **PLP1…PLP10** – Plasticizing pressures
* **PLBP1…PLBP10** – Plasticizing back pressures
* **PLS1…PLS10** – Plasticizing positions
* **SBV2, SBP2, SBS2, SBT2** – Screw back movement parameters
* **CT** – Cooling time
* **MCV1…MCV10** – Clamp close speeds
* **MCP1…MCP10** – Clamp close pressures
* **MCS1…MCS10** – Clamp close positions
* **MOV1…MOV10** – Clamp open speeds
* **MOP1…MOP10** – Clamp open pressures
* **MOS1…MOS10** – Clamp open positions
* **EFDT, EFV1…3, EFP1…3, EFS1…3** – Ejector forward params
* **EBDT, EBV1…3, EBP1…3, EBS1…3** – Ejector back params
* **CP1M…CP4M** – Core pull mode (0=unused, 1=core, 2=unscrewing)
* **CPIxxx / CPOxxx** – Core pull in/out parameters
* **CFP, CFV, CFS, CFT** – Seat forward parameters
* **CBP, CBV, CBS, CBT, CBDT** – Seat back parameters

---

### 1.2.4 操作日志 (Operation Log)

Each log entry includes:

* **varId** – Variable ID changed
* **value** – New value
* **lastValue** – Previous value
* **modifyTime** – Modification timestamp

Example:

```json
{"devId":"C02","topic":"realtime","sendTime":"2025-08-01 10:49:01","sendStamp":1754016541000,"time":"2025-08-01 10:49:00","timestamp":1754016540000,"Data":{"ATST":0,"OPM":-1,"STS":1,"T1":0,"T2":0,"T3":0,"T4":0,"T5":0,"T6":0,"T7":0}}
```
