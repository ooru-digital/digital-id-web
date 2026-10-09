// Centralized API Configuration
export interface APIConfig {
  credIssuer: {
    // Relative path: proxied to https://api.credissuer.com by nginx (prod) and Vite (dev)
    baseUrl: string;
    issueEndpoint: string;
    issuedEndpoint: string;
    presentationEndpoint: string;
    statusPollIntervalMs: number;
    statusPollTimeoutMs: number;
    credentialTemplateId: string;
    modeOfIssuance: string;
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
    presentationEndpoint: '/presentation',
    statusPollIntervalMs: 3000,
    statusPollTimeoutMs: 5 * 60 * 1000,
    credentialTemplateId: env.VITE_ISSUER_TEMPLATE_ID || '',
    modeOfIssuance: 'issue_and_notify',
    issuerInfo: {
      orgCode: env.VITE_ISSUER_ORG_CODE || '',
      email: env.VITE_ISSUER_EMAIL || ''
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

// Returns a signed CDN link to the credential's PDF presentation
export const buildPresentationUrl = (): string =>
  `${apiConfig.credIssuer.baseUrl}${apiConfig.credIssuer.presentationEndpoint}`;

// Public endpoint returning a QR image that adds the credential to CredIssuer Wallet
export const buildOfferQrUrl = (credentialId: string): string =>
  `https://api.credissuer.com/api/mdl/offer-qr/${encodeURIComponent(credentialId)}`;

// The API token is never sent from the browser: nginx (prod) and Vite (dev) add the
// Authorization header when proxying, so it stays out of the JavaScript bundle.
export const getCredIssuerHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json'
});
