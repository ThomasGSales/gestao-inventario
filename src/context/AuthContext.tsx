import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../utils/api';

// Definindo a interface para os dados do contexto
interface AuthContextData {
  user: { id: string; name: string; role: string } | null;
  token: string | null;
  loading: boolean;  // Novo estado de carregamento
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, role?: string) => Promise<void>;
  logout: () => void;
}

// Criando o contexto com um valor inicial vazio
const AuthContext = createContext<AuthContextData | undefined>(undefined);

// Hook para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);  // Adiciona o estado de carregamento

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);  // Termina o carregamento após ler o localStorage
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await api.post('/login', { email, senha });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const register = async (nome: string, email: string, senha: string, role: string = 'user') => {
    await api.post('/register', { nome, email, senha, role });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};