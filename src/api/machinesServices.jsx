import axios from 'axios';

export const getFactoriesMachinesByUserId = async (userId) => {
try {
  const response = await axios.get(`http://localhost:3000/machines/factories-machines/${userId}`);
    const data = response.data;
    return data;
  } catch (error) {
    // Handle any errors that occur during the request
    console.error('Error getting factories and machines by userId:', error);
    throw error;
  }
};

export const connectByIpAddress = async (ipAddress) => {
  try {
    const requestBody = {
      endpoint: ipAddress,
    };
    const response = await axios.post(`http://localhost:3000/opcua/connect`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      const data = response.data;
      return data;
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting factories and machines by userId:', error);
      throw error;
    }
};

export const disconnectByIpAddress = async (ipAddress) => {
  try {
    const requestBody = {
      endpoint: ipAddress,
    };
    const response = await axios.post(`http://localhost:3000/opcua/disconnect`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      const data = response.data;
      return data;
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting factories and machines by userId:', error);
      throw error;
    }
};

export const insertMachine = async (createMachineReq) => {
  const { machineIpAddress, machineName, machineIndex, userId, factoryId, factoryIndex } = createMachineReq;
  try {
    const requestBody = {
      machineIpAddress,
      machineName,
      machineIndex,
      userId,
      factoryId,
      factoryIndex,
  }
    const response = await axios.post(`http://localhost:3000/machines`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      const data = response.data;
      return data;
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting factories and machines by userId:', error);
      throw error;
    }
};

export const removeMachine = async (machineId) => {
  try {
    const response = await axios.delete(`http://localhost:3000/machines/${machineId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      const data = response.data;
      return data;
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting factories and machines by userId:', error);
      throw error;
    }
};

export const createFactory = async (updateMachineReq) => {
  const { factoryName, userId, factoryIndex } = updateMachineReq;
  try {
    const requestBody = {
      factoryName,
      userId,
      factoryIndex,
  }
  console.log(`requestBody: ${JSON.stringify(requestBody)}`);
    const response = await axios.post(`http://localhost:3000/factories`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      const data = response.data;
      return data;
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting factories and machines by userId:', error);
      throw error;
    }
}

export const removeFactory = async (factoryId) => {
  try {
    const response = await axios.delete(`http://localhost:3000/factories/${factoryId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      const data = response.data;
      return data;
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Error getting factories and machines by userId:', error);
      throw error;
    }
}