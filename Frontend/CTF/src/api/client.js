import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setLoading(false);
      return data;
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
  login: (username, password) => {
    return fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json());
  },
};

export const challengesAPI = {
  getAll: () => {
    return fetch(`${API_URL}/challenges`)
      .then(r => r.json());
  },

  solve: (userID, challengeID) => {
    return fetch(`${API_URL}/challenges/${challengeID}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID }),
    }).then(r => r.json());
  },
};

export const profileAPI = {
  get: (userID) => {
    return fetch(`${API_URL}/profile?userID=${userID}`)
      .then(r => r.json());
  },
};
