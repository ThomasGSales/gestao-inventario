// TransacoesFinanceiras.tsx
import { Link } from "react-router-dom";
import ListTransacoes from "../components/ListTransacoes";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext'; // Importando o contexto de autenticação

const TransacoesFinanceiras = () => {
  const { user } = useAuth(); // Obtendo o usuário autenticado

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 ml-4">Gerenciamento de Transações Financeiras</h1>

      {/* Verifica se o usuário é admin para mostrar o botão */}
      {user && user.role === 'admin' && (
        <div className="ml-4">
          <Link to="/transacoes/new">
            <Button>Adicionar Transação</Button>
          </Link>
        </div>
      )}

      <ListTransacoes />
    </div>
  );
};

export default TransacoesFinanceiras;