import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "@/utils/api";

function FormTransacao() {
  const [tipo, setTipo] = useState<"Entrada" | "Saída">("Entrada");
  const [valor, setValor] = useState<string>("");
  const [data, setData] = useState<string>(new Date().toISOString().split("T")[0]);
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransacao = async () => {
      if (id) {
        const response = await api.get(`/transacoes/${id}`);
        const { tipo, valor, data, produtoId, pedidoId } = response.data;
        setTipo(tipo);
        setValor(valor.toFixed(2).replace('.', ','));
        setData(data);
        setProdutoId(produtoId || null);
        setPedidoId(pedidoId || null);
      }
    };

    const fetchData = async () => {
      try {
        const produtosResponse = await api.get("/produtos");
        setProdutos(produtosResponse.data);
        const pedidosResponse = await api.get("/pedidos");
        setPedidos(pedidosResponse.data);
      } catch (error) {
        console.error("Erro ao buscar produtos ou pedidos:", error);
      } finally {
        await fetchTransacao();
      }
    };

    fetchData();
  }, [id]);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    inputValue = inputValue.replace(/[^0-9,]/g, "");
    if (inputValue.includes(",")) {
      const [inteira, decimal] = inputValue.split(",");
      inputValue = `${inteira},${decimal.slice(0, 2)}`;
    }
    setValor(inputValue);
  };

  const handleProdutoSelect = (value: string) => {
    const selectedId = Number(value);
    setProdutoId(produtoId === selectedId ? null : selectedId);
  };

  const handlePedidoSelect = (value: string) => {
    const selectedId = Number(value);
    setPedidoId(pedidoId === selectedId ? null : selectedId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedValue = parseFloat(valor.replace(",", "."));
    const payload = {
      tipo,
      valor: formattedValue >= 0 ? formattedValue : 0,
      data,
      produtoId,
      pedidoId: pedidoId || undefined,
    };

    try {
      if (id) {
        await api.put(`/transacoes/${id}`, payload);
      } else {
        await api.post("/transacoes", payload);
      }
      navigate("/transacoes");
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    }
  };

  return (
    <div className="absolute top-16 left-4 max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Editar Transação" : "Registrar Transação"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <Select onValueChange={(value) => setTipo(value as "Entrada" | "Saída")} value={tipo}>
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entrada">Entrada</SelectItem>
              <SelectItem value="Saída">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Input
            type="text"
            placeholder="Valor da transação"
            value={valor}
            onChange={handleValorChange}
            required
            className="w-full"
          />
        </div>

        <div className="w-full">
          <Input
            type="date"
            placeholder="Data da transação"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="w-full"
          />
        </div>

        <div className="w-full">
          <Select onValueChange={handleProdutoSelect} value={produtoId?.toString() || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o Produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map((produto: any) => (
                <SelectItem key={produto.id} value={produto.id.toString()}>
                  {produto.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select onValueChange={handlePedidoSelect} value={pedidoId?.toString() || ""}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o Pedido (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {pedidos.map((pedido: any) => (
                <SelectItem key={pedido.id} value={pedido.id.toString()}>
                  Pedido #{pedido.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full mt-4">
          {id ? "Atualizar Transação" : "Salvar Transação"}
        </Button>
      </form>
    </div>
  );
}

export default FormTransacao;