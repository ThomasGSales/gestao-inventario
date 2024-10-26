import React from 'react';
import ListClientes from '../components/ListClientes'
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from '@/context/AuthContext';

const Clientes: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Clientes</h1>

      {user && user.role === 'admin' && (
        <div className="mb-4">
          <Link to="/clientes/new">
            <Button>Adicionar Cliente</Button>
          </Link>
        </div>
      )}
      <ListClientes />
    </div>
  );
};

export default Clientes;