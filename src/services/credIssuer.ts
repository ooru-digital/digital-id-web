import {
  buildCredentialIssueUrl,
  buildIssuedCredentialsUrl,
  getCredIssuerHeaders,
  getCredIssuerStatusHeaders
} from '../config/apiConfig';
import type { DigitalIdCredentialData } from '../utils/digitalIdCredential';

export interface IssuancePayload {
  issuer_info: {
    org_code: string;
    email: string;
  };
  issuer_credential_template_id: string;
  credential_data: DigitalIdCredentialData[];
}

export interface IssuanceResponse {
  message: string;
  transaction_id: string;
  credential_template_id: string;
  issuer_credential_template_id: string;
  template_type: string;
  applied_count: number;
  programme_name: string;
  programme_code: string;
  batch_name: string;
  batch_code: string;
}

export interface IssuanceStatusResponse {
  status: string;
  results?: { status: string }[];
}

export class CredIssuerError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'CredIssuerError';
  }
}

const extractErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const errorData = await response.json();
    const apiMessage = errorData.message || errorData.detail || errorData.error;
    if (typeof apiMessage === 'string' && apiMessage) {
      return apiMessage;
    }
  } catch (e) {
    console.error('Failed to parse error response:', e);
  }
  return fallback;
};

export const issueDigitalId = async (payload: IssuancePayload): Promise<IssuanceResponse> => {
  const response = await fetch(buildCredentialIssueUrl(), {
    method: 'POST',
    headers: getCredIssuerHeaders(),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      `Registration failed. Please try again. (Error: ${response.status})`
    );
    throw new CredIssuerError(message, response.status);
  }

  const data: IssuanceResponse = await response.json();
  if (!data.transaction_id) {
    throw new CredIssuerError('Issuance was accepted but no transaction ID was returned.');
  }
  return data;
};

export const fetchIssuanceStatus = async (
  transactionId: string,
  signal?: AbortSignal
): Promise<IssuanceStatusResponse> => {
  const response = await fetch(buildIssuedCredentialsUrl(transactionId), {
    method: 'GET',
    headers: getCredIssuerStatusHeaders(),
    signal
  });

  if (!response.ok) {
    const message = await extractErrorMessage(
      response,
      `Unable to fetch issuance status. (Error: ${response.status})`
    );
    throw new CredIssuerError(message, response.status);
  }

  return response.json();
};

export const isCompletedStatus = (status?: string | null): boolean =>
  status?.trim().toLowerCase() === 'completed';

export const isFailedStatus = (status?: string | null): boolean =>
  !!status && /fail|error|reject|cancel/i.test(status);
