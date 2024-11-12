import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";

interface Transacao {
  id: number;
  tipo: "Entrada" | "Saída";
  valor: number;
  data: string;
  produtoId: number;
  pedidoId?: number;
  produtoNome?: string;
  pedidoNome?: string;
}

function ListTransacoes() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [produtos, setProdutos] = useState<{ [key: number]: string }>({});
  const [pedidos, setPedidos] = useState<{ [key: number]: string }>({});
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [filtroData, setFiltroData] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProdutos();
    fetchPedidos();
  }, []);

  useEffect(() => {
    fetchTransacoes();
  }, [filtroTipo, filtroData, produtos, pedidos]);

  const fetchProdutos = async () => {
    try {
      const response = await api.get("/produtos");
      const produtosData = response.data.reduce((acc: any, produto: any) => {
        acc[produto.id] = produto.nome;
        return acc;
      }, {});
      setProdutos(produtosData);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await api.get("/pedidos");
      const pedidosData = response.data.reduce((acc: any, pedido: any) => {
        acc[pedido.id] = `Pedido #${pedido.id}`;
        return acc;
      }, {});
      setPedidos(pedidosData);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  const fetchTransacoes = async () => {
    try {
      const tipoQuery = filtroTipo !== "Todos" ? `&tipo=${filtroTipo}` : "";
      const dataQuery = filtroData ? `&data=${filtroData}` : "";
      const query = `/transacoes?${tipoQuery}${dataQuery}`;
      const response = await api.get(query);
      const transacoesData = response.data.map((transacao: Transacao) => ({
        ...transacao,
        produtoNome: produtos[transacao.produtoId] || "Produto desconhecido",
        pedidoNome: transacao.pedidoId ? pedidos[transacao.pedidoId] : "Nenhum pedido",
      }));
      setTransacoes(transacoesData);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/transacoes/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await api.delete(`/transacoes/${id}`);
        setTransacoes((prev) => prev.filter((transacao) => transacao.id !== id));
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-4">
        <Select onValueChange={setFiltroTipo} value={filtroTipo}>
          <SelectTrigger className="w-full md:w-auto">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Entrada">Entrada</SelectItem>
            <SelectItem value="Saída">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="Filtrar por data"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
          className="w-full md:w-auto"
        />
      </div>

      {/* Tabela de Transações (Responsive) */}
      <div className="overflow-x-auto">
        <Table className="min-w-full hidden md:table">
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Pedido</TableHead>
              {user?.role === "admin" && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transacoes.map((transacao) => (
              <TableRow key={transacao.id}>
                <TableCell>
                  {new Date(transacao.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                </TableCell>
                <TableCell>{transacao.tipo}</TableCell>
                <TableCell>R$ {transacao.valor.toFixed(2)}</TableCell>
                <TableCell>{transacao.produtoNome}</TableCell>
                <TableCell>{transacao.pedidoNome}</TableCell>
                {user?.role === "admin" && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm" onClick={() => handleEdit(transacao.id)}>
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(transacao.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Responsive Cards for Mobile */}
        <div className="md:hidden space-y-4">
          {transacoes.map((transacao) => (
            <div
              key={transacao.id}
              className="border rounded-lg p-4 shadow-sm flex flex-col space-y-2"
            >
              <div>
                <strong>Data:</strong>{" "}
                {new Date(transacao.data).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
              </div>
              <div>
                <strong>Tipo:</strong> {transacao.tipo}
              </div>
              <div>
                <strong>Valor:</strong> R$ {transacao.valor.toFixed(2)}
              </div>
              <div>
                <strong>Produto:</strong> {transacao.produtoNome}
              </div>
              <div>
                <strong>Pedido:</strong> {transacao.pedidoNome}
              </div>
              {user?.role === "admin" && (
                <div className="flex space-x-2">
                  <Button variant="default" size="sm" onClick={() => handleEdit(transacao.id)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(transacao.id)}>
                    Excluir
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ListTransacoes;