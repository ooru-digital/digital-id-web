// Centralized API Configuration
export interface APIConfig {
  userCreation: {
    baseUrl: string;
    endpoint: string;
  };
}

// Production API Configuration
export const apiConfig: APIConfig = {
  userCreation: {
    baseUrl: 'https://id.assembly.govstack.global',
    endpoint: '/api/users/create'
  }
};

// Helper function to build user creation URL
export const buildUserCreationUrl = (): string => {
  return apiConfig.userCreation.baseUrl + apiConfig.userCreation.endpoint;
};
