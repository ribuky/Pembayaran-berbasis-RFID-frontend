import api from '@/lib/axios';

export const authService = {
  async login(username: string, password: string) {
    const response = await api.post('/auth/login', {
      username,
      password,
    });

    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('access_token');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};