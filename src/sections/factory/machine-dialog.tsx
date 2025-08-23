import React, { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { insertMachine } from 'src/api/machinesServices';
import type { Factory, Machine } from 'src/types';

interface MachineDialogProps {
  open: boolean;
  handleClose: () => void;
  machineIndex: number;
  factory: Factory;
  factoryIndex: number;
  setFactories: React.Dispatch<React.SetStateAction<Factory[]>>;
}

interface MachineFormData {
  machineIpAddress: string;
  machineName: string;
  machineIndex: number;
  userId: string;
  factoryId: string;
  factoryIndex: number;
  machineId?: string;
}

const MachineDialog: React.FC<MachineDialogProps> = ({
  open,
  handleClose,
  factory,
  factoryIndex,
  setFactories,
  machineIndex,
}) => {
  const [ipAddress, setIpAddress] = useState<string>('');
  const [machineName, setMachineName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const userId = localStorage.getItem('user_id') || '';

  const handleEstablishConnection = async (
    ipAddress: string,
    machineName: string,
    machineIndex: number
  ): Promise<void> => {
    const factoryId = factory.id;
    
    try {
      const insertMachineRes = await insertMachine({
        machineIpAddress: ipAddress,
        machineName,
        machineIndex,
        factoryId,
        factoryIndex,
      });

      const newMachine: MachineFormData = {
        machineIpAddress: ipAddress,
        machineName,
        machineIndex,
        userId,
        factoryId,
        factoryIndex,
        machineId: insertMachineRes.machineId,
      };

      insertMachineToState(factoryIndex, newMachine);

      // Clear the text fields
      setIpAddress('');
      setMachineName('');
      handleClose();
    } catch (error) {
      console.error('Failed to insert machine:', error);
      // TODO: Add proper error handling/notification
    }
  };

  const submitConnection = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    
    if (!ipAddress.trim() || !machineName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await handleEstablishConnection(ipAddress, machineName, machineIndex);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMachineToState = (factoryIndex: number, machine: MachineFormData): void => {
    setFactories((prevFactories: Factory[]) => {
      const updatedFactories = [...prevFactories];
      const targetFactory = { ...updatedFactories[factoryIndex] };
      
      // Create new machine object that matches the Machine interface
      const newMachine: Machine = {
        id: machine.machineId || '',
        machineId: machine.machineId || '',
        machineIpAddress: machine.machineIpAddress,
        machineName: machine.machineName,
        machineIndex: machine.machineIndex,
        factoryId: machine.factoryId,
        factoryIndex: machine.factoryIndex,
      };

      const updatedMachines = [...(targetFactory.machines || []), newMachine];

      // Sort the machines by machineIndex
      updatedMachines.sort((a, b) => a.machineIndex - b.machineIndex);

      targetFactory.machines = updatedMachines;
      updatedFactories[factoryIndex] = targetFactory;
      return updatedFactories;
    });
  };

  const handleDialogClose = (): void => {
    if (!isSubmitting) {
      setIpAddress('');
      setMachineName('');
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新增機器</DialogTitle>
          <DialogDescription>
            請輸入機器名稱和IP地址
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={submitConnection} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="machineName">機器名稱</Label>
            <Input
              id="machineName"
              name="machineName"
              placeholder="輸入機器名稱"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              required
              autoFocus
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP地址</Label>
            <Input
              id="ipAddress"
              name="ipAddress"
              placeholder="例如: 192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleDialogClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !ipAddress.trim() || !machineName.trim()}
            >
              {isSubmitting ? '新增中...' : '新增機器'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MachineDialog;
