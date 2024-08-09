import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { createFactory } from 'src/api/machinesServices';

FactoryDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  factory: PropTypes.object,
  factoryIndex: PropTypes.number,
  setFactories: PropTypes.func,
};

export default function FactoryDialog(props) {
  const { open, handleClose, factory, factoryIndex, setFactories } = props;
  const [factoryName, setFactoryName] = React.useState('');

  const handleCreateFactoy = async (factoryName) => {
    let userId = 1; // hard coded for now
    const createNewFactoryRes = await createFactory({factoryName, userId, factoryIndex});
    const factoryId = createNewFactoryRes.factoryId;
    const machines = [];
    insertFactoryToState(factoryIndex, {
      factoryName,
      userId,
      factoryId,
      factoryIndex,
      machines,
    });
    // Clear the text fields
    setFactoryName('');
    // handleClose();
  }

  const submitConnection = async (event) => {
    event.preventDefault();
    handleCreateFactoy(factoryName);
  };

  const insertFactoryToState = (factoryIndex, factory) => {
    setFactories((prevFactories) => [...prevFactories, factory]);
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
            id="factoryName"
            name="廠房匿名"
            label="廠房匿名"
            fullWidth
            variant="standard"
            value={factoryName}
            onChange={(e) => setFactoryName(e.target.value)}
          />          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
