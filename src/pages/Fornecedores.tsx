import React from 'react';
import { Link } from 'react-router-dom';
import ListFornecedores from '../components/ListFornecedores';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext'; // Importando o contexto de autenticação

const Fornecedores: React.FC = () => {
  const { user } = useAuth(); // Obtendo o usuário autenticado

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Fornecedores</h1>
      
      {/* Verifica se o usuário é admin para mostrar o botão */}
      {user && user.role === 'admin' && (
        <div className="my-4">
          <Link to="/fornecedor/new">
            <Button variant="default">Adicionar Novo Fornecedor</Button>
          </Link>
        </div>
      )}
      
      <ListFornecedores />
    </div>
  );
};

export default Fornecedores;