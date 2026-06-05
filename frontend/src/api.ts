import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost 
  ? 'http://127.0.0.1:8080/api' 
  : 'https://izi-contador-backend.onrender.com/api'; 

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
