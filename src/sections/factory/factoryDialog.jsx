import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { createFactory, updateFactory } from 'src/api/machinesServices';

FactoryDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  factory: PropTypes.object,
  factoryIndex: PropTypes.number,
  setFactories: PropTypes.func,
  isEditMode: PropTypes.bool,
  setIsEdit: PropTypes.func,
  setFactoryDialogState: PropTypes.func,
  setMachineDialogState: PropTypes.func,
};

export default function FactoryDialog(props) {
  const { open, handleClose, factoryIndex, isEditMode, factories, setFactories, setIsEdit, setFactoryDialogState, setMachineDialogState } = props;
  const [factoryName, setFactoryName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const userId = localStorage.getItem('user_id');

  // Use effect to set values when isEditMode or factoryIndex changes
  useEffect(() => {
    if (isEditMode && factories[factoryIndex]) {
      setFactoryName(factories[factoryIndex].factoryName);
      setWidth(factories[factoryIndex].factoryWidth);
      setHeight(factories[factoryIndex].factoryHeight);
    } else {
      // Reset values for the create factory mode
      setFactoryName('');
      setWidth('');
      setHeight('');
    }
  }, [isEditMode, factoryIndex, factories]); // Add dependencies for re-rendering when values change

  const handleCreateFactory = async (factoryName, width, height) => {
    const createNewFactoryRes = await createFactory({ factoryName, userId, factoryIndex: factories.length, width, height });
    const factoryId = createNewFactoryRes.factoryId;
    const machines = [];
    const newFactory = {
      factoryName,
      userId,
      factoryId,
      factoryIndex: factories.length,
      machines,
      factoryWidth: width,
      factoryHeight: height,
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

  const submitConnection = async (event) => {
    event.preventDefault();
    if (isEditMode) {
      await handleUpdateFactory(factoryName, width, height);
    } else {
      await handleCreateFactory(factoryName, width, height);
    }
  };

  const handleUpdateFactory = async (factoryName, width, height) => {
    const factoryId = factories[factoryIndex].factoryId;
    const lastMachineIndex = factories[factoryIndex].machines.sort((a, b) => a.machineIndex - b.machineIndex)[factories[factoryIndex].machines.length - 1].machineIndex;
    if (lastMachineIndex >= width * height) {
      alert('工廠大小不足以容納所有機台');
      return;
    }
    const updateNewFactoryRes = await updateFactory({ factoryName, userId, factoryIndex, width, height, factoryId });
    updateFactoryInState(updateNewFactoryRes);
    setFactoryName('');
    setWidth('');
    setHeight('');
    setIsEdit(false);
    handleClose();
  };

  const updateFactoryInState = (updatedFactory) => {
    setFactories((prevFactories) =>
      prevFactories.map((factory) =>
        factory.factoryId === updatedFactory.factoryId
          ? {
              ...factory,
              factoryName: updatedFactory.factoryName,
              factoryWidth: updatedFactory.width,
              factoryHeight: updatedFactory.height,
            }
          : factory
      )
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: submitConnection,
        }}
        aria-labelledby="factory-dialog-title"
      >
        <DialogTitle id="factory-dialog-title">
          {isEditMode ? "編輯工廠" : "新增工廠"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To {isEditMode ? "edit" : "create"} a factory, please enter the factory name, width, and height here.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="factoryName"
            label="工廠名稱"
            fullWidth
            variant="standard"
            value={factoryName}
            onChange={(e) => setFactoryName(e.target.value)}
          />
          
          {/* Row with two fields: Width and Height */}
          <Box display="flex" justifyContent="space-between" gap={2} sx={{ mt: 2 }}>
            <TextField
              required
              margin="dense"
              id="factoryWidth"
              label="寬"
              variant="standard"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              type="number"
              slotProps={{ htmlInput: {min: 0} }}
              fullWidth
            />
            <TextField
              required
              margin="dense"
              id="factoryHeight"
              label="長"
              variant="standard"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              type="number"
              slotProps={{ htmlInput: {min: 0} }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} aria-hidden="false" aria-modal="true">
            Cancel
          </Button>
          <Button type="submit" aria-hidden="false" aria-modal="true">
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
