import axios from 'axios';

const API_URL = 'https://izi-contador-backend.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getRelatorio = async () => {
  try {
    const response = await api.get('/relatorio');
    return response.data;
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    throw error;
  }
};
