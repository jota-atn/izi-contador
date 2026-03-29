import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const getRelatorio = async () => {
  const response = await api.get('/relatorio');
  return response.data;
};
