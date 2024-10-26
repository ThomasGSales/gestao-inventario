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
import api from "@/utils/api";  // Instância do Axios configurada

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  contato: string;
  endereco: string;
}

function ListClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroNome, setFiltroNome] = useState<string>("");
  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState<string>("");
  const [ordem, setOrdem] = useState<string>("nome");

  // Função para formatar CPF ou CNPJ
  const formatCpfCnpj = (value: string) => {
    let cpfCnpj = value.replace(/\D/g, ''); // Remove tudo que não for número
    if (cpfCnpj.length <= 11) {
      // CPF
      cpfCnpj = cpfCnpj.replace(/(\d{3})(\d)/, "$1.$2");
      cpfCnpj = cpfCnpj.replace(/(\d{3})(\d)/, "$1.$2");
      cpfCnpj = cpfCnpj.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ
      cpfCnpj = cpfCnpj.replace(/^(\d{2})(\d)/, "$1.$2");
      cpfCnpj = cpfCnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      cpfCnpj = cpfCnpj.replace(/\.(\d{3})(\d)/, ".$1/$2");
      cpfCnpj = cpfCnpj.replace(/(\d{4})(\d)/, "$1-$2");
    }
    return cpfCnpj;
  };

  // Função para formatar o número de contato
  const formatContato = (value: string) => {
    let contato = value.replace(/\D/g, ''); // Remove tudo que não for número
    contato = contato.replace(/^(\d{2})(\d)/g, "($1) $2"); // Adiciona o DDD
    if (contato.length >= 11) {
      contato = contato.replace(/(\d{5})(\d{4})$/, "$1-$2");  // Formata para (XX) XXXXX-XXXX
    } else {
      contato = contato.replace(/(\d{4})(\d{0,4})$/, "$1-$2");  // Formata para (XX) XXXX-XXXX
    }
    return contato;
  };

  // Fetch clientes com filtro
  const fetchClientes = () => {
    let query = `/clientes?`;

    if (filtroNome) {
      query += `nome=${encodeURIComponent(filtroNome)}&`;
    }
    if (filtroCpfCnpj) {
      query += `cpf_cnpj=${encodeURIComponent(filtroCpfCnpj)}&`;
    }
    query += `ordem=${encodeURIComponent(ordem)}`;

    api.get(query)
      .then((res) => setClientes(res.data))
      .catch((err) => setError(`Erro ao carregar clientes: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClientes();
  }, [filtroNome, filtroCpfCnpj, ordem]);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      api.delete(`/clientes/${id}`)
        .then(() => {
          setClientes(clientes.filter((cliente) => cliente.id !== id));
        })
        .catch((err) => console.error("Erro ao excluir cliente:", err));
    }
  };

  if (loading) return <p>Carregando clientes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex space-x-4 mb-4">
        <Input
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <Input
          placeholder="Filtrar por CPF/CNPJ"
          value={filtroCpfCnpj}
          onChange={(e) => setFiltroCpfCnpj(e.target.value)}
        />
        <Select onValueChange={setOrdem} value={ordem}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nome">Nome</SelectItem>
            <SelectItem value="cpf_cnpj">CPF/CNPJ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {clientes.length > 0 ? (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{cliente.id}</TableCell>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{formatCpfCnpj(cliente.cpf_cnpj)}</TableCell> {/* Aplicando a formatação de CPF/CNPJ */}
                <TableCell>{formatContato(cliente.contato)}</TableCell> {/* Aplicando a formatação de Contato */}
                <TableCell>{cliente.endereco}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/clientes/edit/${cliente.id}`}>
                      <Button variant="default" size="sm">
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
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
        <p>Nenhum cliente encontrado.</p>
      )}
    </div>
  );
}

export default ListClientes;