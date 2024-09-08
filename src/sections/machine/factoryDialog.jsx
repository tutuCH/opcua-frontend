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
  const { open, handleClose, factoryIndex, setFactories } = props;
  const [factoryName, setFactoryName] = React.useState('');

  const handleCreateFactory = async (factoryName) => {
    let userId = 1; // hard coded for now
    const createNewFactoryRes = await createFactory({ factoryName, userId, factoryIndex });
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
    // Close the dialog after submission
    handleClose();
  };

  const submitConnection = async (event) => {
    event.preventDefault();
    handleCreateFactory(factoryName);
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
          onSubmit: submitConnection,
        }}
        aria-labelledby="factory-dialog-title"
      >
        <DialogTitle id="factory-dialog-title">Create New Factory</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create a new factory, please enter the factory name here.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="factoryName"
            label="Factory Name"
            fullWidth
            variant="standard"
            value={factoryName}
            onChange={(e) => setFactoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} aria-hidden="false" aria-modal="true">
            Cancel
          </Button>
          <Button type="submit" aria-hidden="false" aria-modal="true">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
