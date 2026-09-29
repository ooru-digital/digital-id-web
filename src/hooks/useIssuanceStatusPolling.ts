import { useEffect, useRef, useState } from 'react';
import { apiConfig } from '../config/apiConfig';
import {
  fetchIssuanceStatus,
  isCompletedStatus,
  isFailedStatus
} from '../services/credIssuer';

const MAX_CONSECUTIVE_ERRORS = 5;

interface PollingCallbacks {
  onCompleted: (svgUrl?: string, credentialId?: string) => void;
  onFailed: (message: string) => void;
}

// Polls the issuance status for `transactionId` until it is Completed, failed or times out.
// Passing null stops polling.
export function useIssuanceStatusPolling(transactionId: string | null, callbacks: PollingCallbacks) {
  const [status, setStatus] = useState<string | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    setStatus(null);
    if (!transactionId) return;

    const { statusPollIntervalMs, statusPollTimeoutMs } = apiConfig.credIssuer;
    const controller = new AbortController();
    const startedAt = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let consecutiveErrors = 0;

    const poll = async () => {
      try {
        const data = await fetchIssuanceStatus(transactionId, controller.signal);
        if (controller.signal.aborted) return;
        consecutiveErrors = 0;
        setStatus(data.status);

        const credential = data.results?.[0] ?? null;
        if (isCompletedStatus(data.status)) {
          if (credential && isFailedStatus(credential.status)) {
            callbacksRef.current.onFailed(
              `Digital ID issuance failed with status "${credential.status}". (Transaction ID: ${transactionId})`
            );
          } else {
            callbacksRef.current.onCompleted(credential?.svg_url, credential?.credential_id);
          }
          return;
        }
        if (isFailedStatus(data.status)) {
          callbacksRef.current.onFailed(
            `Digital ID issuance failed with status "${data.status}". (Transaction ID: ${transactionId})`
          );
          return;
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        consecutiveErrors += 1;
        console.error('Issuance status polling failed:', error);
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          const message = error instanceof Error ? error.message : 'Unable to fetch issuance status.';
          callbacksRef.current.onFailed(`${message} (Transaction ID: ${transactionId})`);
          return;
        }
      }

      if (Date.now() - startedAt >= statusPollTimeoutMs) {
        callbacksRef.current.onFailed(
          `Digital ID issuance is taking longer than expected. Please check again later using Transaction ID: ${transactionId}`
        );
        return;
      }

      timer = setTimeout(poll, statusPollIntervalMs);
    };

    poll();

    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [transactionId]);

  return status;
}
