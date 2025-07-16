import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createFactory, updateFactory } from 'src/api/machinesServices';
import { Factory, Thermometer, Gauge, AlertTriangle, Copy, Clipboard, Check } from 'lucide-react';
import type { 
  Factory as FactoryType, 
  WarningCriteria, 
  CriteriaConfig, 
  InputChangeEvent, 
  FormSubmitEvent, 
  ButtonClickEvent 
} from 'src/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "src/components/ui/dialog";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { Button } from "src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { Switch } from "src/components/ui/switch";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "src/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Badge } from "src/components/ui/badge";

// Default warning criteria template
const DEFAULT_CRITERIA: WarningCriteria = {
  temperature: { enabled: false, condition: 'exceeds', value: 80 },
  pressure: { enabled: false, condition: 'exceeds', value: 100 },
  cycleTime: { enabled: false, condition: 'exceeds', value: 30 },
  meltTemperature: { enabled: false, condition: 'exceeds', value: 200 },
  moldTemperature: { enabled: false, condition: 'exceeds', value: 50 },
  screwRpm: { enabled: false, condition: 'exceeds', value: 100 },
};

interface FactoryDialogProps {
  open: boolean;
  handleClose: () => void;
  factoryIndex: number;
  isEditMode: boolean;
  factories: FactoryType[];
  setFactories: React.Dispatch<React.SetStateAction<FactoryType[]>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setFactoryDialogState: React.Dispatch<React.SetStateAction<boolean[]>>;
  setMachineDialogState: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const FactoryDialog: React.FC<FactoryDialogProps> = ({
  open,
  handleClose,
  factoryIndex,
  isEditMode,
  factories,
  setFactories,
  setIsEdit,
  setFactoryDialogState,
  setMachineDialogState
}) => {
  const [factoryName, setFactoryName] = useState<string>('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('factory');
  const [selectedMachine, setSelectedMachine] = useState<string>('factory');
  const [factoryCriteria, setFactoryCriteria] = useState<WarningCriteria>(DEFAULT_CRITERIA);
  const [machineCriteria, setMachineCriteria] = useState<Record<string, WarningCriteria>>({});
  const [copiedSettings, setCopiedSettings] = useState<WarningCriteria | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);
  
  const userId = localStorage.getItem('user_id') || '';

  // Use effect to set values when isEditMode or factoryIndex changes
  useEffect(() => {
    if (isEditMode && factories[factoryIndex]) {
      const factory = factories[factoryIndex];
      setFactoryName(factory.factoryName);
      setWidth(factory.factoryWidth);
      setHeight(factory.factoryHeight);
      
      // Load factory warning criteria if they exist
      if (factory.warningCriteria) {
        setFactoryCriteria(factory.warningCriteria);
      }
      
      // Load machine-specific warning criteria if they exist
      const machineSettings: Record<string, WarningCriteria> = {};
      if (factory.machines && factory.machines.length > 0) {
        factory.machines.forEach(machine => {
          if (machine.warningCriteria) {
            machineSettings[machine.machineId] = machine.warningCriteria;
          } else {
            machineSettings[machine.machineId] = { ...DEFAULT_CRITERIA };
          }
        });
      }
      setMachineCriteria(machineSettings);
      
      // Set the first machine as selected if available
      if (factory.machines && factory.machines.length > 0) {
        setSelectedMachine(factory.machines[0].machineId.toString());
      } else {
        setSelectedMachine('factory');
      }
    } else {
      // Reset values for the create factory mode
      setFactoryName('');
      setWidth('');
      setHeight('');
      setFactoryCriteria({ ...DEFAULT_CRITERIA });
      setMachineCriteria({});
      setSelectedMachine('factory');
    }
  }, [isEditMode, factoryIndex, factories]);

  // Reset copy/paste success messages after a delay
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
    if (pasteSuccess) {
      const timer = setTimeout(() => setPasteSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess, pasteSuccess]);

  const handleCreateFactory = async (event: FormSubmitEvent): Promise<void> => {
    event.preventDefault();
    
    const createNewFactoryRes = await createFactory({ 
      factoryName, 
      userId, 
      factoryIndex: factories.length, 
      width: parseInt(width, 10), 
      height: parseInt(height, 10),
      warningCriteria: factoryCriteria
    });
    
    const factoryId = createNewFactoryRes.factoryId;
    const machines = [];
    const newFactory = {
      factoryName,
      userId,
      factoryId,
      factoryIndex: factories.length,
      machines,
      factoryWidth: parseInt(width, 10),
      factoryHeight: parseInt(height, 10),
      warningCriteria: factoryCriteria
    };
    
    insertFactoryToState(factories.length, newFactory);
    setFactoryDialogState((prevFactoryDialogState) => [...prevFactoryDialogState, false]);
  
    // Reset form values
    setFactoryName('');
    setWidth('');
    setHeight('');
    handleClose();
  };

  const insertFactoryToState = (factoryIndex, factory) => {
    setFactories((prevFactories) => [...prevFactories, factory]);
    setMachineDialogState((prevMachineDialogState) => [...prevMachineDialogState, false]);
  };

  const handleUpdateFactory = async (event: FormSubmitEvent): Promise<void> => {
    event.preventDefault();
    
    const factoryId = factories[factoryIndex].factoryId;
    
    // Check if factory size is sufficient for existing machines
    if (isEditMode && factories[factoryIndex].machines.length > 0) {
      const lastMachineIndex = Math.max(
        ...factories[factoryIndex].machines.map(machine => machine.machineIndex)
      );
      
      if (lastMachineIndex >= parseInt(width, 10) * parseInt(height, 10)) {
      alert('工廠大小不足以容納所有機台');
      return;
    }
    }
    
    const updateNewFactoryRes = await updateFactory({ 
      factoryName, 
      userId, 
      factoryIndex, 
      width: parseInt(width, 10), 
      height: parseInt(height, 10), 
      factoryId,
      warningCriteria: factoryCriteria
    });
    
    updateFactoryInState(updateNewFactoryRes);
    setFactoryName('');
    setWidth('');
    setHeight('');
    setIsEdit(false);
    handleClose();
  };

  const updateFactoryInState = (updatedFactoryData) => {
    setFactories((prevFactories) => {
      const updatedFactories = prevFactories.map((factory) => {
        if (factory.factoryId === updatedFactoryData.factoryId) {
          // Update factory info
          const updatedFactoryObj = {
              ...factory,
            factoryName: updatedFactoryData.factoryName,
            factoryWidth: updatedFactoryData.width,
            factoryHeight: updatedFactoryData.height,
            warningCriteria: factoryCriteria
          };
          
          // Update machine-specific warning criteria
          if (updatedFactoryObj.machines && updatedFactoryObj.machines.length > 0) {
            updatedFactoryObj.machines = updatedFactoryObj.machines.map(machine => ({
              ...machine,
              warningCriteria: machineCriteria[machine.machineId] || { ...DEFAULT_CRITERIA }
            }));
          }
          
          return updatedFactoryObj;
        }
        return factory;
      });
      
      return updatedFactories;
    });
  };

  const handleCriteriaChange = useCallback((metric, field, value) => {
    if (selectedMachine === 'factory') {
      // Update factory criteria
      setFactoryCriteria(prev => ({
        ...prev,
        [metric]: {
          ...prev[metric],
          [field]: value
        }
      }));
    } else {
      // Update machine criteria
      setMachineCriteria(prev => ({
        ...prev,
        [selectedMachine]: {
          ...prev[selectedMachine],
          [metric]: {
            ...(prev[selectedMachine]?.[metric] || DEFAULT_CRITERIA[metric]),
            [field]: value
          }
        }
      }));
    }
  }, [selectedMachine, factoryCriteria, machineCriteria, setFactoryCriteria, setMachineCriteria]);

  const getCurrentCriteria = useMemo(() => {
    if (selectedMachine === 'factory') {
      return factoryCriteria;
    }
    return machineCriteria[selectedMachine] || { ...DEFAULT_CRITERIA };
  }, [selectedMachine, factoryCriteria, machineCriteria]);

  const handleCopySettings = useCallback(() => {
    const currentSettings = getCurrentCriteria;
    setCopiedSettings(JSON.parse(JSON.stringify(currentSettings)));
    setCopySuccess(true);
  }, [getCurrentCriteria]);

  const handlePasteSettings = () => {
    if (!copiedSettings) return;
    
    if (selectedMachine === 'factory') {
      setFactoryCriteria(JSON.parse(JSON.stringify(copiedSettings)));
    } else {
      setMachineCriteria(prev => ({
        ...prev,
        [selectedMachine]: JSON.parse(JSON.stringify(copiedSettings))
      }));
    }
    setPasteSuccess(true);
  };

  const handleApplyToAll = () => {
    const currentSettings = getCurrentCriteria;
    const settings = JSON.parse(JSON.stringify(currentSettings));
    
    // Get all machine IDs
    const machineIds = isEditMode && factories[factoryIndex]?.machines 
      ? factories[factoryIndex].machines.map(m => m.machineId.toString())
      : [];
    
    // Apply settings to all machines
    const updatedMachineCriteria = { ...machineCriteria };
    machineIds.forEach(id => {
      updatedMachineCriteria[id] = settings;
    });
    
    setMachineCriteria(updatedMachineCriteria);
    setPasteSuccess(true);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-slate-600" />
          {isEditMode ? "編輯工廠" : "新增工廠"}
        </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "編輯工廠資訊和設定警告條件" 
              : "新增工廠並設定警告條件"}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="factory">工廠資訊</TabsTrigger>
            <TabsTrigger value="warnings">警告條件</TabsTrigger>
          </TabsList>
          
          <TabsContent value="factory" className="space-y-4 py-4">
            <form id="factory-form" onSubmit={isEditMode ? handleUpdateFactory : handleCreateFactory}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="factoryName">工廠名稱</Label>
                  <Input
            id="factoryName"
            value={factoryName}
            onChange={(e: InputChangeEvent) => setFactoryName(e.target.value)}
                    placeholder="輸入工廠名稱"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="factoryWidth">寬</Label>
                    <Input
              id="factoryWidth"
                      type="number"
                      min="1"
              value={width}
              onChange={(e: InputChangeEvent) => setWidth(e.target.value)}
                      placeholder="工廠寬度"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="factoryHeight">長</Label>
                    <Input
              id="factoryHeight"
                      type="number"
                      min="1"
              value={height}
              onChange={(e: InputChangeEvent) => setHeight(e.target.value)}
                      placeholder="工廠長度"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="warnings" className="py-4">
            {isEditMode && (
              <div className="mb-4">
                <Label htmlFor="machine-select" className="mb-2 block">選擇機台</Label>
                <div className="flex gap-2">
                  <Select 
                    value={selectedMachine} 
                    onValueChange={setSelectedMachine}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇機台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="factory">工廠預設設定</SelectItem>
                      {factories[factoryIndex]?.machines?.map(machine => (
                        <SelectItem key={machine.machineId} value={machine.machineId.toString()}>
                          {machine.machineName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handleCopySettings}
                  >
                    {copySuccess ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copySuccess ? "已複製" : "複製設定"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={handlePasteSettings}
                    disabled={!copiedSettings}
                  >
                    {pasteSuccess ? <Check className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
                    {pasteSuccess ? "已貼上" : "貼上設定"}
                  </Button>
                  
                  {selectedMachine !== 'factory' && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleApplyToAll}
                    >
                      應用到所有機台
                    </Button>
                  )}
                </div>
                
                <div className="mt-3">
                  <Badge variant="outline" className="text-xs">
                    {selectedMachine === 'factory' 
                      ? '工廠預設設定將應用於所有未配置的新機台' 
                      : `正在配置: ${factories[factoryIndex]?.machines?.find(m => m.machineId.toString() === selectedMachine)?.machineName}`}
                  </Badge>
                </div>
              </div>
            )}
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="temperature">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span>溫度監控</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temp-enabled" className="flex items-center gap-2">
                        <span>溫度 (°C)</span>
                      </Label>
                      <Switch
                        id="temp-enabled"
                        checked={getCurrentCriteria.temperature?.enabled || false}
                        onCheckedChange={(checked) => handleCriteriaChange('temperature', 'enabled', checked)}
                      />
                    </div>
                    
                    {getCurrentCriteria.temperature?.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={getCurrentCriteria.temperature?.condition || 'exceeds'}
                          onValueChange={(value) => handleCriteriaChange('temperature', 'condition', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exceeds">超過</SelectItem>
                            <SelectItem value="drops_below">低於</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="number"
                          value={getCurrentCriteria.temperature?.value || 80}
                          onChange={(e) => handleCriteriaChange('temperature', 'value', parseFloat(e.target.value))}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="pressure">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-blue-500" />
                    <span>壓力監控</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 p-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pressure-enabled" className="flex items-center gap-2">
                        <span>壓力 (bar)</span>
                      </Label>
                      <Switch
                        id="pressure-enabled"
                        checked={getCurrentCriteria.pressure?.enabled || false}
                        onCheckedChange={(checked) => handleCriteriaChange('pressure', 'enabled', checked)}
                      />
                    </div>
                    
                    {getCurrentCriteria.pressure?.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={getCurrentCriteria.pressure?.condition || 'exceeds'}
                          onValueChange={(value) => handleCriteriaChange('pressure', 'condition', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="exceeds">超過</SelectItem>
                            <SelectItem value="drops_below">低於</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="number"
                          value={getCurrentCriteria.pressure?.value || 100}
                          onChange={(e) => handleCriteriaChange('pressure', 'value', parseFloat(e.target.value))}
                          min="0"
                          step="0.1"
                        />
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="other">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>其他參數</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-1">
                    {/* Cycle Time */}
                    <Card className="border-dashed">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm">循環時間</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cycle-enabled">
                              循環時間 (秒)
                            </Label>
                            <Switch
                              id="cycle-enabled"
                              checked={getCurrentCriteria.cycleTime?.enabled || false}
                              onCheckedChange={(checked) => handleCriteriaChange('cycleTime', 'enabled', checked)}
                            />
                          </div>
                          
                          {getCurrentCriteria.cycleTime?.enabled && (
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={getCurrentCriteria.cycleTime?.condition || 'exceeds'}
                                onValueChange={(value) => handleCriteriaChange('cycleTime', 'condition', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="exceeds">超過</SelectItem>
                                  <SelectItem value="drops_below">低於</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
                                type="number"
                                value={getCurrentCriteria.cycleTime?.value || 30}
                                onChange={(e) => handleCriteriaChange('cycleTime', 'value', parseFloat(e.target.value))}
                                min="0"
                                step="0.1"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Melt Temperature */}
                    <Card className="border-dashed">
                      <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm">熔體溫度</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="melt-enabled">
                              熔體溫度 (°C)
                            </Label>
                            <Switch
                              id="melt-enabled"
                              checked={getCurrentCriteria.meltTemperature?.enabled || false}
                              onCheckedChange={(checked) => handleCriteriaChange('meltTemperature', 'enabled', checked)}
                            />
                          </div>
                          
                          {getCurrentCriteria.meltTemperature?.enabled && (
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={getCurrentCriteria.meltTemperature?.condition || 'exceeds'}
                                onValueChange={(value) => handleCriteriaChange('meltTemperature', 'condition', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="exceeds">超過</SelectItem>
                                  <SelectItem value="drops_below">低於</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
              type="number"
                                value={getCurrentCriteria.meltTemperature?.value || 200}
                                onChange={(e) => handleCriteriaChange('meltTemperature', 'value', parseFloat(e.target.value))}
                                min="0"
                                step="0.1"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="pt-2">
          <Button variant="outline" type="button" onClick={handleClose}>
            取消
          </Button>
          <Button type="submit" form="factory-form">
            {isEditMode ? "更新" : "新增"}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
  );
};


export default React.memo(FactoryDialog);
