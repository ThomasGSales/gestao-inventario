import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/utils/api"; // Instância do Axios configurada

interface Pedido {
  id: number;
  clienteId: number;
  status: string;
  total: number;
  data: string;
}

interface Cliente {
  id: number;
  nome: string;
}

function ListPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const [ordemTotal, setOrdemTotal] = useState<string>("");

  // Buscar todos os clientes e salvar no estado
  const fetchClientes = async () => {
    try {
      const response = await api.get("/clientes");
      const clientesData = response.data.reduce((acc: any, cliente: Cliente) => {
        acc[cliente.id] = cliente.nome;
        return acc;
      }, {});
      setClientes(clientesData);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    }
  };

  const fetchPedidos = async () => {
    setLoading(true);
    let query = `/pedidos?`;

    if (filtroCliente && !isNaN(Number(filtroCliente))) {
      query += `clienteId=${encodeURIComponent(filtroCliente)}&`;
    }
    if (filtroStatus) {
      query += `status=${encodeURIComponent(filtroStatus)}&`;
    }
    if (ordemTotal) {
      query += `ordemTotal=${encodeURIComponent(ordemTotal)}&`;
    }

    try {
      const response = await api.get(query);
      setPedidos(response.data);
    } catch (err:any) {
      setError(`Erro ao carregar pedidos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes(); // Carrega os clientes uma vez ao montar o componente
    fetchPedidos(); // Carrega os pedidos
  }, [filtroCliente, filtroStatus, ordemTotal]);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      api.delete(`/pedidos/${id}`)
        .then(() => {
          setPedidos(pedidos.filter((pedido) => pedido.id !== id));
        })
        .catch((err) => console.error("Erro ao excluir pedido:", err));
    }
  };

  if (loading) return <p>Carregando pedidos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-2 lg:space-y-0 mb-4">
        <Input
          className="lg:w-1/3 w-full"
          placeholder="Filtrar por cliente ID"
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
          type="number"
        />

        <Select onValueChange={setFiltroStatus} value={filtroStatus}>
          <SelectTrigger className="lg:w-1/3 w-full">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setOrdemTotal} value={ordemTotal}>
          <SelectTrigger className="lg:w-1/3 w-full">
            <SelectValue placeholder="Ordenar por total" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Total Crescente</SelectItem>
            <SelectItem value="desc">Total Decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        {pedidos.length > 0 ? (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
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
                  <TableCell>
                    {pedido.clienteId} - {clientes[pedido.clienteId] || "Cliente desconhecido"}
                  </TableCell>
                  <TableCell>{pedido.status}</TableCell>
                  <TableCell>R$ {pedido.total.toFixed(2)}</TableCell>
                  <TableCell>{pedido.data}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center">Nenhum pedido encontrado.</p>
        )}
      </div>
    </div>
  );
}

export default ListPedidos;
