// HistoricoPedidosClienteModal.tsx
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";

interface Pedido {
  id: number;
  data: string;
  status: string;
  total: number;
  itens: { nome: string; quantidade: number; precoUnitario: number }[];
}

interface HistoricoPedidosClienteModalProps {
  clienteId: number;
  clienteNome: string;
  onClose: () => void;
}

function HistoricoPedidosClienteModal({ clienteId, clienteNome, onClose }: HistoricoPedidosClienteModalProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");

  useEffect(() => {
    fetchPedidos();
  }, [clienteId, filtroStatus]);

  const fetchPedidos = async () => {
    try {
      const statusQuery = filtroStatus !== "Todos" ? `?status=${filtroStatus}` : "";
      const response = await api.get(`/clientes/${clienteId}/pedidos${statusQuery}`);
      setPedidos(response.data);
    } catch (error) {
      console.error("Erro ao buscar pedidos do cliente:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-md max-w-3xl w-full">
        <h2 className="text-xl font-bold mb-4">Histórico de Pedidos de {clienteNome}</h2>
        
        <div className="flex space-x-4 mb-4">
          <Select onValueChange={setFiltroStatus} value={filtroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Itens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{new Date(pedido.data).toLocaleDateString()}</TableCell>
                <TableCell>{pedido.status}</TableCell>
                <TableCell>R$ {pedido.total.toFixed(2)}</TableCell>
                <TableCell>
                  <ul>
                    {pedido.itens.map((item, index) => (
                      <li key={index}>
                        {item.nome} - {item.quantidade} x R$ {item.precoUnitario.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button onClick={onClose} className="mt-4">Fechar</Button>
      </div>
    </div>
  );
}

export default HistoricoPedidosClienteModal;