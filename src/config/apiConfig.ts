// Centralized API Configuration
export interface APIConfig {
  credIssuer: {
    // Relative path: proxied to https://api.credissuer.com by nginx (prod) and Vite (dev)
    baseUrl: string;
    issueEndpoint: string;
    issuedEndpoint: string;
    statusPollIntervalMs: number;
    statusPollTimeoutMs: number;
    credentialTemplateId: string;
    modeOfIssuance: string;
    apiToken: string;
    issuerInfo: {
      orgCode: string;
      email: string;
    };
  };
}

const env = import.meta.env;

// Production API Configuration
export const apiConfig: APIConfig = {
  credIssuer: {
    baseUrl: '/api/credentials',
    issueEndpoint: '/issue/client/bulk',
    issuedEndpoint: '/issued',
    statusPollIntervalMs: 3000,
    statusPollTimeoutMs: 5 * 60 * 1000,
    credentialTemplateId: env.VITE_CREDISSUER_TEMPLATE_ID || '',
    modeOfIssuance: 'issue',
    apiToken: env.VITE_CREDISSUER_API_TOKEN || '',
    issuerInfo: {
      orgCode: env.VITE_CREDISSUER_ORG_CODE || '',
      email: env.VITE_CREDISSUER_ISSUER_EMAIL || ''
    }
  }
};

// Helper function to build the Digital ID issuance URL
export const buildCredentialIssueUrl = (): string => {
  const { baseUrl, issueEndpoint, credentialTemplateId, modeOfIssuance } = apiConfig.credIssuer;
  const params = new URLSearchParams({
    credential_template: credentialTemplateId,
    mode_of_issuance: modeOfIssuance
  });
  return `${baseUrl}${issueEndpoint}?${params.toString()}`;
};

// Helper function to build the issuance status URL for a transaction
export const buildIssuedCredentialsUrl = (transactionId: string): string => {
  const { baseUrl, issuedEndpoint } = apiConfig.credIssuer;
  const params = new URLSearchParams({ offset: '0', limit: '10' });
  return `${baseUrl}${issuedEndpoint}/${encodeURIComponent(transactionId)}?${params.toString()}`;
};

// Public endpoint returning a QR image that adds the credential to CredIssuer Wallet
export const buildOfferQrUrl = (credentialId: string): string =>
  `https://api.credissuer.com/api/mdl/offer-qr/${encodeURIComponent(credentialId)}`;

export const getCredIssuerHeaders = (): Record<string, string> => ({
  'Authorization': `Bearer ${apiConfig.credIssuer.apiToken}`,
  'Content-Type': 'application/json'
});

export const getCredIssuerStatusHeaders = (): Record<string, string> => ({
  'Authorization': `Bearer ${apiConfig.credIssuer.apiToken}`
});
