import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { connectByIpAddress, insertMachine } from 'src/api/machinesServices';

MachineDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  factory: PropTypes.object,
  factoryIndex: PropTypes.number,
  setFactories: PropTypes.func,
};

export default function MachineDialog(props) {
  const { open, handleClose, factory, factoryIndex, setFactories } = props;
  const [ipAddress, setIpAddress] = React.useState('');
  const [machineName, setMachineName] = React.useState('');

  const handleEstablishConnection = async (ipAddress, machineName) => {
    const connectByIpAddressRes = await connectByIpAddress(ipAddress);
    const machineIndex = factory.machines?.length;
    let userId = 1; // hard coded for now
    const factoryId = factory.factoryId;
    const insertMachineRes = await insertMachine({
      machineIpAddress: ipAddress, 
      machineName, 
      machineIndex,
      userId,
      factoryId, 
      factoryIndex,
    });
    insertMachineToState(factoryIndex, {
      machineIpAddress: ipAddress,
      machineName,
      machineIndex,
      userId,
      factoryId,
      factoryIndex,
      machineId: insertMachineRes.machineId,
    });
    // Clear the text fields
    setIpAddress('');
    setMachineName('');
    // handleClose();
  }

  const submitConnection = async (event) => {
    event.preventDefault();
    handleEstablishConnection(ipAddress, machineName);
  };

  const insertMachineToState = (factoryIndex, machine) => {
    setFactories((prevFactories) => {
      const updatedFactories = [...prevFactories];
      const targetFactory = { ...updatedFactories[factoryIndex] };
      const updatedMachines = [...targetFactory.machines, machine];

      // Sort the machines by machineIndex
      updatedMachines.sort((a, b) => a.machineIndex - b.machineIndex);

      targetFactory.machines = updatedMachines;
      updatedFactories[factoryIndex] = targetFactory;
      return updatedFactories;
    });
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event) => {submitConnection(event)},
        }}
      >
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to your machine, please enter your IP address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="machineName"
            name="machineName"
            label="Machine Name"
            fullWidth
            variant="standard"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
          />          
          <TextField
            required
            margin="dense"
            id="ipAddress"
            name="ipAddress"
            label="IP Address"
            fullWidth
            variant="standard"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Subscribe</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
