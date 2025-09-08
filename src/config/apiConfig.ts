// Centralized API Configuration
export interface APIConfig {
  userCreation: {
    baseUrl: string;
    endpoint: string;
  };
  ocr: {
    dmsBaseUrl: string;
    csrfToken: string;
    sessionId: string;
    authToken: string;
  };
  llm: {
    apiKey: string;
    baseUrl: string;
    model: string;
  };
}

// Production API Configuration
export const apiConfig: APIConfig = {
  userCreation: {
    baseUrl: 'https://dev-test.credissuer.com',
    endpoint: '/api/users/create'
  },
  ocr: {
    dmsBaseUrl: 'https://dms.credissuer.com',
    csrfToken: 'DSHvszpKwC1rH3CluyIayGzAImLUuOaS',
    sessionId: '0uqqyicrmuh3xm2e10tuf30a024v12b2',
    authToken: 'Basic YWRtaW46UEBwZXJOZ3gmNzg5'
  },
  llm: {
    apiKey: '97a8565c386608873d7cac933cbca995f6b42a2c',
    baseUrl: 'https://staging.credissuer.com/api/credentials/llm-extraction',
    model: 'gpt-4o-mini'
  }
};

// Helper function to build user creation URL
export const buildUserCreationUrl = (): string => {
  return apiConfig.userCreation.baseUrl + apiConfig.userCreation.endpoint;
};

// Common headers for OCR API
export const getOCRHeaders = () => ({
  'X-CSRFToken': apiConfig.ocr.csrfToken,
  'Authorization': apiConfig.ocr.authToken
});

// Common headers for LLM API (now using CredIssuer endpoint)
export const getLLMHeaders = () => ({
  'Authorization': `Bearer ${apiConfig.llm.apiKey}`,
  'Content-Type': 'application/json'
});