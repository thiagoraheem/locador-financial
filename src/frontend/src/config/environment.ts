// Environment Configuration
// This file centralizes environment-specific configurations

export interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'production' | 'staging';
  enableLogs: boolean;
  apiTimeout: number;
}

// Get environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const disableLogs = process.env.REACT_APP_DISABLE_LOGS === 'true';
  
  // Default API URL based on environment
  let defaultApiUrl = 'http://localhost:8000'; // Backend is running on port 8000
  if (isProduction) {
    // In production, try to detect common production URLs
    defaultApiUrl = 'http://localhost:8000'; // Default production backend port
  }
  
  return {
    apiUrl: process.env.REACT_APP_API_URL || defaultApiUrl,
    environment: isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
    enableLogs: !isProduction && !disableLogs,
    apiTimeout: isProduction ? 60000 : 30000, // 60s for production, 30s for development
  };
};

// Export current configuration
export const config = getEnvironmentConfig();

// Validation function to check if configuration is valid
export const validateConfig = (): boolean => {
  const { apiUrl } = config;
  
  if (!apiUrl) {
    console.error('API URL is not configured. Please set REACT_APP_API_URL environment variable.');
    return false;
  }
  
  // Basic URL validation
  try {
    new URL(apiUrl);
    return true;
  } catch (error) {
    console.error('Invalid API URL format:', apiUrl);
    return false;
  }
};

// Log configuration in development
if (config.enableLogs) {
  console.log('Environment Configuration:', config);
  validateConfig();
}