import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const buildEnvelope = (data = {}) => ({
  meta: { version: '1.0' },
  data,
});

const parseEnvelope = (payload) => {
  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'success')) {
    return payload;
  }

  // Backward compatibility for any non-enveloped responses.
  return {
    success: true,
    meta: { version: 'legacy' },
    data: payload,
  };
};

const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json();
  const envelope = parseEnvelope(payload);

  if (!response.ok || !envelope.success) {
    const message = envelope?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return envelope;
};

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const envelope = await apiFetch(endpoint, options);
      setLoading(false);
      return envelope.data;
    } catch (err) {
      const errorMsg = err.message || 'Unknown error occurred';
      setError(errorMsg);
      setLoading(false);
      throw err;
    }
  };

  return { request, loading, error };
};

export const authAPI = {
  login: async (username, password) => {
    const envelope = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(buildEnvelope({ username, password })),
    });

    return {
      success: envelope.success,
      user: envelope?.data?.user,
      error: envelope?.error?.message,
    };
  },
};

export const challengesAPI = {
  getAll: async () => {
    const envelope = await apiFetch('/challenges');
    return envelope?.data?.challenges || [];
  },

  solve: async (userID, challengeID) => {
    const envelope = await apiFetch(`/challenges/${challengeID}/solve`, {
      method: 'POST',
      body: JSON.stringify(buildEnvelope({ userID })),
    });

    return {
      success: envelope.success,
      message: envelope?.data?.message || '',
      error: envelope?.error?.message,
    };
  },
};

export const profileAPI = {
  get: async (userID) => {
    const envelope = await apiFetch('/profile', {
      method: 'POST',
      body: JSON.stringify(buildEnvelope({ userID })),
    });

    return envelope?.data?.profile || [];
  },
};
