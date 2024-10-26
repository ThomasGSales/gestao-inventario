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

  const { user } = useAuth(); // Obtendo o papel do usuário

  // Fetch produtos com filtro
  const fetchProdutos = () => {
    let query = `/produtos?`;  // Base URL configurada no api.ts

    if (filtroNome) {
      query += `nome=${encodeURIComponent(filtroNome)}&`;
    }
    if (filtroFornecedor) {
      query += `fornecedorId=${encodeURIComponent(filtroFornecedor)}&`;
    }
    if (ordemPreco) {
      query += `ordemPreco=${encodeURIComponent(ordemPreco)}&`;
    }

    api.get(query)  // Usando api (Axios) para fazer a requisição
      .then((res) => setResult(res.data))
      .catch((err) => setError(`Erro ao carregar produtos: ${err.message}`));
  };

  useEffect(() => {
    fetchProdutos();
  }, [filtroNome, filtroFornecedor, ordemPreco]);

  useEffect(() => {
    // Fetch fornecedores
    api.get("/fornecedores")  // Usando api (Axios) para buscar fornecedores
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
      api.delete(`/produtos/${id}`)  // Usando api (Axios) para deletar produto
        .then(() => {
          setResult(result.filter((item) => item.id !== id));
        })
        .catch((err) => console.error("Erro ao excluir produto:", err));
    }
  };

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <Select onValueChange={setFiltroFornecedor} value={filtroFornecedor}>
          <SelectTrigger>
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
        <Select onValueChange={setOrdemPreco} value={ordemPreco}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Preço Crescente</SelectItem>
            <SelectItem value="desc">Preço Decrescente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {result.length > 0 ? (
        <Table className="w-full">
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
                      src={`http://localhost:3000${item.imagem}`}  // URL da imagem
                      alt={item.nome}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                </TableCell>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.preco}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>{fornecedores[item.fornecedorId]}</TableCell>
                <TableCell>
                  {/* Verifica se o usuário é admin antes de renderizar as ações */}
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
      ) : (
        <p>Nenhum produto encontrado.</p>
      )}
    </div>
  );
}

export default ListOfResult;