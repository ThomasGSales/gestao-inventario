import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  user: { role: string } | null;
  loading: boolean;  // Adiciona o estado de carregamento
  children: JSX.Element;
  requiredRole?: string;  // Este prop verifica o papel
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ user, loading, children, requiredRole }) => {
  if (loading) {
    return <p>Carregando...</p>;  // Exibe um indicador de carregamento enquanto o usuário é verificado
  }

  if (!user) {
    return <Navigate to="/login" />;  // Redireciona para login se o usuário não estiver logado
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;  // Redireciona para home se o papel não for o esperado
  }

  return children;
};

export default PrivateRoute;