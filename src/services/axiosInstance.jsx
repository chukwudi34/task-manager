import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Helper functions
export const apiHelpers = {
  // Helper for file uploads
  uploadFile: (url, formData, onUploadProgress) => {
    return axiosInstance.post(url, formData, {
      onUploadProgress,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Helper for JSON requests
  post: (url, data) => {
    return axiosInstance.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Helper for GET requests
  get: (url, params) => {
    return axiosInstance.get(url, { params });
  },

  // Helper for PUT requests
  put: (url, data) => {
    return axiosInstance.put(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  // Helper for DELETE requests
  delete: (url) => {
    return axiosInstance.delete(url);
  },
};

export default axiosInstance;
