import apiClient from "../axiosInstance";

// AI Service URL - typically running on port 8001
const AI_SERVICE_URL = "http://localhost:8001/api/v1"; 

const RehabilitationService = {
    checkEligibility: async (inmateData) => {
        const response = await apiClient.post(`${AI_SERVICE_URL}/predictions/eligibility`, inmateData);
        return response.data;
    }
};

export default RehabilitationService;
