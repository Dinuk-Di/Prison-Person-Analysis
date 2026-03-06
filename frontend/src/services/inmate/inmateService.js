import { createApiClient } from "../axiosInstance.js";

// Fallback to the Python API address if VITE_INMATE_SERVICE_URL is missing
const baseURL = import.meta.env.VITE_INMATE_SERVICE_URL || "http://127.0.0.1:5010";

const apiClient = createApiClient(baseURL);

const InmateService = {
    getAllInmates: async () => {
        const response = await apiClient.get("/api/inmate/all");
        return response.data;
    },

    getInmateById: async (id) => {
        const response = await apiClient.get(`/inmates/${id}`);
        return response.data;
    },

    createInmate: async (inmateData) => {
        const response = await apiClient.post("/api/inmate/register", inmateData);
        return response.data;
    },

    updateInmate: async (id, inmateData) => {
        const response = await apiClient.put(`/inmates/${id}`, inmateData);
        return response.data;
    },

    deleteInmate: async (id) => {
        await apiClient.delete(`/inmates/${id}`);
    }
};

export default InmateService;
