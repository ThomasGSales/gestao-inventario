import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/utils/api";
import { Trash } from "lucide-react";

interface Produto {
  id: number;
  nome: string;
  preco: number;
}

interface Cliente {
  id: number;
  nome: string;
}

interface ItemPedido {
  produtoId: number;
  quantidade: number;
  precoUnitario: string;
}

function FormPedidos() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("Pendente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    // Fetch Clientes e Produtos
    const fetchData = async () => {
      try {
        const [clientesRes, produtosRes] = await Promise.all([
          api.get("/clientes"),
          api.get("/produtos")
        ]);
        setClientes(clientesRes.data);
        setProdutos(produtosRes.data);

        if (id) {
          // Carrega o pedido se estivermos editando
          const pedidoRes = await api.get(`/pedidos/${id}`);
          const pedido = pedidoRes.data;

          if (!pedido.itens) throw new Error("Itens do pedido não encontrados.");

          setClienteId(pedido.clienteId);
          setStatus(pedido.status);
          setItens(pedido.itens.map((item: any) => ({
            ...item,
            precoUnitario: formatPrice(item.precoUnitario)
          })));
        }
      } catch (err: any) {
        setError(`Erro ao carregar dados: ${err.message}`);
      }
    };

    fetchData();
  }, [id]);

  // Função para formatar o preço
  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return num > 0 ? num.toFixed(2).replace(".", ",") : "1,00";
  };

  // Formata o preço quando o input perde o foco
  const handleBlurPrice = (index: number) => {
    const updatedItens = [...itens];
    const price = parseFloat(updatedItens[index].precoUnitario.replace(",", "."));
    updatedItens[index].precoUnitario = formatPrice(price);
    setItens(updatedItens);
  };

  const handleAddItem = () => {
    setItens([...itens, { produtoId: 0, quantidade: 1, precoUnitario: "1,00" }]);
  };

  const handleItemChange = (index: number, field: keyof ItemPedido, value: any) => {
    const updatedItens = [...itens];
    updatedItens[index] = { ...updatedItens[index], [field]: value };
    setItens(updatedItens);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const payload = {
      clienteId,
      status,
      itens: itens.map(item => ({
        ...item,
        precoUnitario: parseFloat(item.precoUnitario.replace(",", "."))
      })),
    };
  
    try {
      if (id) {
        // Editando pedido
        await api.put(`/pedidos/${id}`, payload);
      } else {
        // Criando novo pedido
        await api.post("/pedidos", payload);
      }
      navigate("/pedidos");
    } catch (err: any) {
      setError(`Erro ao salvar pedido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-16 left-4 max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Pedido" : "Adicionar Pedido"}</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          {clientes.length > 0 && (
            <Select onValueChange={(value) => setClienteId(Number(value))} value={clienteId?.toString() || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id.toString()}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mb-4">
          <Select onValueChange={setStatus} value={status}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold">Itens do Pedido</h3>
          {itens.map((item, index) => (
            <div key={index} className="flex space-x-4 mb-2 items-center">
              <Select
                value={item.produtoId.toString()}
                onValueChange={(value) => handleItemChange(index, "produtoId", Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id.toString()}>
                      {produto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={item.quantidade}
                onChange={(e) => handleItemChange(index, "quantidade", Number(e.target.value))}
                placeholder="Quantidade"
                min="1"
              />

              <Input
                type="text"
                value={item.precoUnitario}
                onChange={(e) => handleItemChange(index, "precoUnitario", e.target.value)}
                onBlur={() => handleBlurPrice(index)}
                placeholder="Preço Unitário"
              />

              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button type="button" onClick={handleAddItem}>
            Adicionar Item
          </Button>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Pedido"}
        </Button>
      </form>
    </div>
  );
}

export default FormPedidos;