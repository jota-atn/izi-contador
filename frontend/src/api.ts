import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

export const getRelatorio = async () => {
  const response = await api.get('/relatorio');
  return response.data;
};
