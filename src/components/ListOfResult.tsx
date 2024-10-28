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
import { useAuth } from '@/context/AuthContext';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  imagem: string;
  fornecedorId: number;
  fornecedorNome?: string;
}

function ListOfResult() {
  const [result, setResult] = useState<Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroNome, setFiltroNome] = useState<string>("");
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>("");
  const [ordemPreco, setOrdemPreco] = useState<string>("");

  const { user } = useAuth();

  const fetchProdutos = () => {
    let query = `/produtos?`;

    if (filtroNome) {
      query += `nome=${encodeURIComponent(filtroNome)}&`;
    }
    if (filtroFornecedor) {
      query += `fornecedorId=${encodeURIComponent(filtroFornecedor)}&`;
    }
    if (ordemPreco) {
      query += `ordemPreco=${encodeURIComponent(ordemPreco)}&`;
    }

    api.get(query)
      .then((res) => setResult(res.data))
      .catch((err) => setError(`Erro ao carregar produtos: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProdutos();
  }, [filtroNome, filtroFornecedor, ordemPreco]);

  useEffect(() => {
    api.get("/fornecedores")
      .then((res) => {
        const fornecedorMap = res.data.reduce((map: { [x: string]: any; }, fornecedor: { FornecedorID: string | number; Nome: any; }) => {
          map[fornecedor.FornecedorID] = fornecedor.Nome;
          return map;
        }, {} as Record<number, string>);
        setFornecedores(fornecedorMap);
        setLoading(false);
      })
      .catch((err) => setError(`Erro ao carregar fornecedores: ${err.message}`));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      api.delete(`/produtos/${id}`)
        .then(() => {
          setResult(result.filter((item) => item.id !== id));
        })
        .catch((err) => console.error("Erro ao excluir produto:", err));
    }
  };

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      {/* Filtros responsivos */}
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-2 lg:space-y-0 mb-4">
        <Input
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="lg:w-1/3 w-full"
        />
        
        <div className="lg:w-1/3 w-full">
          <Select onValueChange={setFiltroFornecedor} value={filtroFornecedor}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(fornecedores).map(([id, nome]) => (
                <SelectItem key={id} value={id}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:w-1/3 w-full">
          <Select onValueChange={setOrdemPreco} value={ordemPreco}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordenar por preço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Preço Crescente</SelectItem>
              <SelectItem value="desc">Preço Decrescente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela responsiva */}
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.imagem && (
                    <img
                      src={`http://localhost:3000${item.imagem}`}
                      alt={item.nome}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                </TableCell>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>R$ {item.preco.toFixed(2).replace(".", ",")}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>{fornecedores[item.fornecedorId]}</TableCell>
                <TableCell>
                  {user && user.role === 'admin' && (
                    <div className="flex space-x-2">
                      <Link to={`/modify/${item.id}`}>
                        <Button variant="default" size="sm">
                          Modificar
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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
      </div>

      {result.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-4">
          <p className="text-lg font-semibold">Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}

export default ListOfResult;