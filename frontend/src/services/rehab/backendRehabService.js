import apiClient from "../axiosInstance";

// Rehabilitation Service URL (Java Backend)
// Assuming it runs on port 4006 based on application.properties
const REHAB_SERVICE_URL = "http://localhost:4006"; 

const BackendRehabService = {
    // Generate recommendation (creates profile if needed)
    createRehabProfile: async (inmateId, inmateData) => {
        const response = await apiClient.post(`${REHAB_SERVICE_URL}/rehabilitation/recommend`, {
            inmateId,
            inmateData
        });
        return response.data;
    },

    // Get existing profile
    getProfile: async (inmateId) => {
        const response = await apiClient.get(`${REHAB_SERVICE_URL}/rehabilitation/profile/${inmateId}`);
        return response.data;
    },

    // Get all profiles
    getAllProfiles: async () => {
        const response = await apiClient.get(`${REHAB_SERVICE_URL}/rehabilitation/profiles`);
        return response.data;
    },

    // Get recommendations
    getRecommendations: async (inmateId) => {
        const response = await apiClient.get(`${REHAB_SERVICE_URL}/rehabilitation/recommendations/${inmateId}`);
        return response.data;
    },

    // Get medical reports
    getMedicalReports: async (inmateId) => {
        const response = await apiClient.get(`${REHAB_SERVICE_URL}/rehabilitation/medical-reports/${inmateId}`);
        return response.data;
    },

    // Get counseling notes
    getCounselingNotes: async (inmateId) => {
        const response = await apiClient.get(`${REHAB_SERVICE_URL}/rehabilitation/counseling-notes/${inmateId}`);
        return response.data;
    },

    // Get progress logs
    getProgressLogs: async (inmateId) => {
        const response = await apiClient.get(`${REHAB_SERVICE_URL}/rehabilitation/progress-logs/${inmateId}`);
        return response.data;
    }
};

export default BackendRehabService;
