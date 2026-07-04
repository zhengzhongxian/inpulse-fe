import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.inkpulse.com/api/v1';

export const authClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to attach Bearer Access Token
authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('inkpulse_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401/403 and rotate refresh token
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            return authClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('inkpulse_refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem('inkpulse_access_token', newAccessToken);
        localStorage.setItem('inkpulse_refresh_token', newRefreshToken);

        authClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return authClient(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Breach detected or invalid refresh token: 403 Forbidden or 401 Unauthorized
        if (refreshError.response?.status === 403 || refreshError.response?.status === 401) {
          logOutClient();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const logOutClient = () => {
  localStorage.removeItem('inkpulse_access_token');
  localStorage.removeItem('inkpulse_refresh_token');
  window.location.reload();
};

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

export const logoutApi = (refreshToken: string) => {
  return authClient.post('/auth/logout', { refreshToken });
};

export const registerSendOtpApi = (email: string, deviceId: string, browserFingerprint: string) => {
  return authClient.post('/auth/register/send-otp', { email, deviceId, browserFingerprint });
};

export const registerVerifyApi = (registerData: any) => {
  return authClient.post('/auth/register/verify', registerData);
};

export const getUserProfileApi = () => {
  return authClient.get('/users/profile');
};

export const updateUserProfileApi = (profileData: any) => {
  if (profileData instanceof FormData) {
    return authClient.put('/users/profile', profileData, {
      headers: {
        'Content-Type': undefined,
      },
    });
  }
  return authClient.put('/users/profile', profileData);
};

export const createUserAddressApi = (addressData: any) => {
  return authClient.post('/users/addresses', addressData);
};

export const updateUserAddressApi = (addressId: string, addressData: any) => {
  return authClient.put(`/users/addresses/${addressId}`, addressData);
};

export const deleteUserAddressApi = (addressId: string) => {
  return authClient.delete(`/users/addresses/${addressId}`);
};

export const changePasswordApi = (passwordData: any) => {
  return authClient.post('/users/change-password', passwordData);
};
