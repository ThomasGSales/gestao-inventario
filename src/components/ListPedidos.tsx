import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/utils/api";  // Use a instância Axios configurada
import { useAuth } from '@/context/AuthContext'; // Importando o contexto de autenticação

interface Pedido {
  id: number;
  clienteId: number;
  status: string;
  total: number;
  data: string;
}

function ListPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [ordemTotal, setOrdemTotal] = useState<string>("");

  const { user } = useAuth(); // Obtendo o papel do usuário

  // Fetch pedidos com filtro
  const fetchPedidos = () => {
    let query = `/pedidos?`;  // Base URL configurada no api.ts

    if (filtroCliente) {
      query += `clienteId=${encodeURIComponent(filtroCliente)}&`;
    }
    if (filtroStatus) {
      query += `status=${encodeURIComponent(filtroStatus)}&`;
    }
    if (ordemTotal) {
      query += `ordemTotal=${encodeURIComponent(ordemTotal)}&`;
    }

    api.get(query)  // Usando api (Axios) para fazer a requisição
      .then((res) => setPedidos(res.data))
      .catch((err) => setError(`Erro ao carregar pedidos: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPedidos();
  }, [filtroCliente, filtroStatus, ordemTotal]);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      api.delete(`/pedidos/${id}`)  // Usando api (Axios) para deletar pedido
        .then(() => {
          setPedidos(pedidos.filter((pedido) => pedido.id !== id));
        })
        .catch((err) => console.error("Erro ao excluir pedido:", err));
    }
  };

  if (loading) return <p>Carregando pedidos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Filtrar por cliente ID"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        />
        <Select onValueChange={setFiltroStatus} value={filtroStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setOrdemTotal} value={ordemTotal}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por total" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Total Crescente</SelectItem>
            <SelectItem value="desc">Total Decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pedidos.length > 0 ? (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.clienteId}</TableCell>
                <TableCell>{pedido.status}</TableCell>
                <TableCell>R$ {pedido.total.toFixed(2)}</TableCell>
                <TableCell>{pedido.data}</TableCell>
                <TableCell>
                  {user && user.role === 'admin' && (
                    <div className="flex space-x-2">
                      <Link to={`/editpedido/${pedido.id}`}>
                        <Button variant="default" size="sm">
                          Modificar
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(pedido.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <p className="text-lg font-semibold">Nenhum pedido encontrado.</p>
        </div>
      )}
    </div>
  );
}

export default ListPedidos;