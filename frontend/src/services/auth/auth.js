import axiosInstanceNoToken from "../axiosInstanceNoToken";

const login = async (credentials) => {
  try {
    const response = await axiosInstanceNoToken.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const register = async (credentials) => {
  try {
    const response = await axiosInstanceNoToken.post("/api/auth/register", credentials);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

const logout = async () => {
  try {
    localStorage.removeItem("token");
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export { login, register, logout };
