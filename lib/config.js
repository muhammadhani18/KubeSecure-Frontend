// API Configuration
export const API_CONFIG = {
  // FastAPI Backend URL
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL,
  
  // API Endpoints
  ENDPOINTS: {
    SCAN_IMAGE: "/api/scan-image",
    HEALTH: "/health"
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`;
}; 