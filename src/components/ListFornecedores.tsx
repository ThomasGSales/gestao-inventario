import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext'; // Importando o contexto para verificar o papel do usuário
import api from "@/utils/api"; // Usando Axios para as requisições

// Interface para representar um fornecedor
interface Fornecedor {
  FornecedorID: number;
  Nome: string;
  CNPJ: string;
  Contato: string;
  Endereco: string;
}

function ListFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filtro, setFiltro] = useState<string>(""); // Para filtrar pelo nome ou contato
  const [ordemNome, setOrdemNome] = useState<string>("asc"); // Ordenação pelo nome
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Obtenha o papel do usuário

  // Fetch fornecedores com filtro e ordenação
  const fetchFornecedores = () => {
    // Parâmetros de filtro e ordenação na query string
    const query = `/fornecedores?ordem=${encodeURIComponent(ordemNome)}&filtro=${encodeURIComponent(filtro)}`;

    setLoading(true);
    api.get(query)
      .then((res) => setFornecedores(res.data))
      .catch((err) => setError(`Erro ao carregar fornecedores: ${err.message}`))
      .finally(() => setLoading(false));
  };

  // Efeito para buscar fornecedores ao mudar o filtro ou a ordem
  useEffect(() => {
    fetchFornecedores();
  }, [filtro, ordemNome]);  // Atualiza quando o filtro ou a ordem mudar

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      // Excluir fornecedor
      api.delete(`/fornecedores/${id}`)
        .then(() => {
          setFornecedores(fornecedores.filter((item) => item.FornecedorID !== id));
        })
        .catch((err) => console.error("Erro ao excluir fornecedor:", err));
    }
  };

  if (loading) return <p>Carregando fornecedores...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 overflow-x-auto">
      {/* Filtro de Nome ou Contato */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nome ou contato"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* Ordenação por Nome */}
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setOrdemNome} value={ordemNome}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por Nome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Nome (A-Z)</SelectItem>
            <SelectItem value="asc">Nome (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela de Fornecedores */}
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fornecedores.map((fornecedor) => (
            <TableRow key={fornecedor.FornecedorID}>
              <TableCell>{fornecedor.Nome}</TableCell>
              <TableCell>{fornecedor.CNPJ}</TableCell>
              <TableCell>{fornecedor.Contato}</TableCell>
              <TableCell>{fornecedor.Endereco}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {user && user.role === 'admin' && (
                    <>
                      <Link to={`/fornecedor/edit/${fornecedor.FornecedorID}`}>
                        <Button variant="default" size="sm">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(fornecedor.FornecedorID)}
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                  {/* Usuário comum (user) não verá as opções de edição e exclusão */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ListFornecedores;