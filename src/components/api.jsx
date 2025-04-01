// api.js - Centralized API service module
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create an axios instance with default configurations
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/users/login', null, {
        params: { username, password }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Inspection Forms API
export const inspectionFormAPI = {
  // Get all forms
  getAllForms: async () => {
    try {
      const response = await apiClient.get('/inspection-forms');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get form by ID
  getFormById: async (id) => {
    try {
      const response = await apiClient.get(`/inspection-forms/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get forms by status
  getFormsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/inspection-forms/status/${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get forms by submitter
  getFormsBySubmitter: async (submitter) => {
    try {
      const response = await apiClient.get(`/inspection-forms/submitter/${submitter}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new form
  createForm: async (formData) => {
    try {
      const response = await apiClient.post('/inspection-forms', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Update existing form
  updateForm: async (id, formData) => {
    try {
      const response = await apiClient.put(`/inspection-forms/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Submit form for approval
  submitForm: async (id, submittedBy) => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/submit`, null, {
        params: { submittedBy }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Approve form
  approveForm: async (id, reviewedBy, comments = '') => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/approve`, null, {
        params: { reviewedBy, comments }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Reject form
  rejectForm: async (id, reviewedBy, comments) => {
    try {
      const response = await apiClient.post(`/inspection-forms/${id}/reject`, null, {
        params: { reviewedBy, comments }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// User Management API
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user by role
  getUsersByRole: async (role) => {
    try {
      const response = await apiClient.get(`/users/role/${role}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  auth: authAPI,
  inspectionForms: inspectionFormAPI,
  users: userAPI
};