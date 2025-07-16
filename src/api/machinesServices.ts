import axios from 'axios';
import { sanitizeInput } from '../utils/validation';
import type {
  CreateMachineRequest,
  UpdateMachineRequest,
  CreateFactoryRequest,
  UpdateFactoryRequest,
  FactoriesMachinesResponse,
  OPCUAConnectionRequest,
  OPCUAConnectionResponse,
  ApiResponse
} from '../types';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') as string;

// Helper function to get the authorization headers
const getAuthHeaders = (): { Authorization: string; 'Content-Type': string } => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getFactoriesMachinesByUserId = async (): Promise<FactoriesMachinesResponse> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/machines/factories-machines`, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error getting factories and machines by userId:', error);
    throw error;
  }
};

export const connectByIpAddress = async (ipAddress: string): Promise<OPCUAConnectionResponse> => {
  try {
    const requestBody: OPCUAConnectionRequest = {
      endpoint: ipAddress,
    };
    const response = await axios.post(`${BACKEND_URL}/opcua/connect`, requestBody, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error connecting by IP address:', error);
    throw error;
  }
};

export const disconnectByIpAddress = async (ipAddress: string): Promise<OPCUAConnectionResponse> => {
  try {
    const requestBody: OPCUAConnectionRequest = {
      endpoint: ipAddress,
    };
    const response = await axios.post(`${BACKEND_URL}/opcua/disconnect`, requestBody, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error disconnecting by IP address:', error);
    throw error;
  }
};

export const insertMachine = async (createMachineReq: CreateMachineRequest): Promise<ApiResponse> => {
  const { machineIpAddress, machineName, machineIndex, factoryId, factoryIndex } =
    createMachineReq;
  try {
    const requestBody = {
      machineIpAddress: sanitizeInput(machineIpAddress),
      machineName: sanitizeInput(machineName),
      machineIndex,
      factoryId,
      factoryIndex,
    };
    console.log(requestBody);
    const response = await axios.post(`${BACKEND_URL}/machines`, requestBody, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error inserting machine:', error);
    throw error;
  }
};

export const removeMachine = async (machineId: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/machines/${machineId}`, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error removing machine:', error);
    throw error;
  }
};

export const createFactory = async (updateMachineReq: CreateFactoryRequest): Promise<ApiResponse> => {
  const { factoryName, factoryIndex, width, height } = updateMachineReq;
  try {
    const requestBody = {
      factoryName: sanitizeInput(factoryName),
      factoryIndex,
      width,
      height,
    };
    const response = await axios.post(`${BACKEND_URL}/factories`, requestBody, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error creating factory:', error);
    throw error;
  }
};

export const updateFactory = async (updateFactoryReq: UpdateFactoryRequest): Promise<ApiResponse> => {
  const { factoryName, factoryIndex, width, height, factoryId } = updateFactoryReq;
  try {
    const requestBody = {
      factoryName: sanitizeInput(factoryName),
      factoryIndex,
      width,
      height,
    };
    const response = await axios.patch(`${BACKEND_URL}/factories/${factoryId}`, requestBody, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error creating factory:', error);
    throw error;
  }
};

export const removeFactory = async (factoryId: string): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/factories/${factoryId}`, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error removing factory:', error);
    throw error;
  }
};

export const updateMachineIndex = async (updateMachineReq: UpdateMachineRequest): Promise<ApiResponse> => {
  const { machineId, machineIndex, factoryId } = updateMachineReq;
  try {
    const response = await axios.post(`${BACKEND_URL}/machines/update-index`,{
      machineId,
      machineIndex,
      factoryId,
    }, {
      headers: getAuthHeaders(),
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error updating machine index:', error);
    throw error;
  }
}  