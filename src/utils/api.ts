// api.ts (configuração para Axios)
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',  // URL do backend
});

// Interceptar todas as requisições para adicionar o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Recuperar o token do localStorage
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;  // Adicionar o token no cabeçalho Authorization
  }
  return config;
});

export default api;