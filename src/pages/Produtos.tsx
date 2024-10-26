import { Link } from "react-router-dom";
import ListOfResult from "../components/ListOfResult";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext'; // Importando o contexto de autenticação

const Produtos = () => {
  const { user } = useAuth(); // Obtendo o usuário autenticado

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 ml-4">Gerenciamento de Produtos</h1>

      {/* Verifica se o usuário é admin para mostrar o botão */}
      {user && user.role === 'admin' && (
        <div className="ml-4">
          <Link to="/add">
            <Button>Adicionar Produto</Button>
          </Link>
        </div>
      )}

      <ListOfResult />
    </div>
  );
};

export default Produtos;