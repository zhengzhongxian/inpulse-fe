import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginApi = (loginData: any) => {
  return authClient.post('/auth/login', loginData);
};

export const sendOtpApi = (mfaSessionId: string, email: string) => {
  return authClient.post('/auth/mfa/send-otp', { mfaSessionId, email });
};

export const initPushApi = (mfaSessionId: string) => {
  return authClient.post('/auth/mfa/init-push', { mfaSessionId });
};

export const checkPushStatusApi = (mfaSessionId: string) => {
  return authClient.get(`/auth/mfa/status?sessionId=${mfaSessionId}`);
};

export const verifyMfaApi = (mfaData: any) => {
  return authClient.post('/auth/mfa/verify', mfaData);
};

export const simulateApprovePushApi = (mfaSessionId: string) => {
  return authClient.post('/auth/mfa/approve', { mfaSessionId });
};

export const logoutApi = (refreshToken: string, accessToken: string) => {
  return authClient.post(
    '/auth/logout',
    { refreshToken },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
};
