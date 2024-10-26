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
import api from "@/utils/api";  // Usando Axios para chamadas API
import { Trash } from "lucide-react";  // Importando o ícone de lixeira

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
  precoUnitario: string; // Manter como string para exibir a formatação
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
  const { id } = useParams();  // Para editar, obtemos o ID do pedido via URL

  useEffect(() => {
    // Fetch Clientes
    api.get("/clientes")
      .then((res) => setClientes(res.data))
      .catch((err) => setError(`Erro ao carregar clientes: ${err.message}`));
  
    // Fetch Produtos
    api.get("/produtos")
      .then((res) => setProdutos(res.data))
      .catch((err) => setError(`Erro ao carregar produtos: ${err.message}`));
    
    // Se estivermos editando, buscar dados do pedido
    if (id) {
      api.get(`/pedidos/${id}`)
        .then((res) => {
          const pedido = res.data;
  
          if (!pedido.itens) {
            setError("Itens do pedido não encontrados.");
            return;
          }
  
          setClienteId(pedido.clienteId);
          setStatus(pedido.status);
          // Verifica se `pedido.itens` existe antes de fazer o mapeamento
          setItens(pedido.itens?.map((item: any) => ({
            ...item,
            precoUnitario: formatPrice(item.precoUnitario), // Formata o preço inicial
          })) || []);
        })
        .catch((err) => setError(`Erro ao carregar pedido: ${err.message}`));
    }
  }, [id]);
  // Função para formatar o preço (maior que 0 e com 2 casas decimais)
  const formatPrice = (price: number | string) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return num > 0 ? num.toFixed(2).replace(".", ",") : "1,00"; // Garantindo valor mínimo 1,00
  };

  // Formata o preço somente quando o input perde o foco
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
    const updatedItens = itens.filter((_, i) => i !== index);
    setItens(updatedItens);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      clienteId,
      status,
      itens: itens.map(item => ({
        ...item,
        precoUnitario: parseFloat(item.precoUnitario.replace(",", "."))  // Converter para número antes de enviar
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
      navigate("/pedidos");  // Redireciona para a lista de pedidos
    } catch (err: any) {
      setError(`Erro ao salvar pedido: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Pedido" : "Adicionar Pedido"}</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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
                onBlur={() => handleBlurPrice(index)}  // Formata o preço quando o campo perde o foco
                placeholder="Preço Unitário"
              />

              {/* Ícone de lixeira para remover item */}
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