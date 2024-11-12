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
import api from "@/utils/api";
import HistoricoPedidosClienteModal from "./HistoricoPedidosClienteModal";
import { useAuth } from "@/context/AuthContext"; // Importar o contexto de autenticação

interface Cliente {
  id: number;
  nome: string;
  cpf_cnpj: string;
  contato: string;
  endereco: string;
}

function ListClientes() {
  const { user } = useAuth(); // Acessar o contexto de autenticação
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [selectedClienteNome, setSelectedClienteNome] = useState<string>("");

  const [filtroNome, setFiltroNome] = useState<string>("");
  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState<string>("");
  const [ordem, setOrdem] = useState<string>("nome");

  const formatCpfCnpj = (value: string) => {
    let cpfCnpj = value.replace(/\D/g, '');
    if (cpfCnpj.length <= 11) {
      cpfCnpj = cpfCnpj.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      cpfCnpj = cpfCnpj.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    }
    return cpfCnpj;
  };

  const formatContato = (value: string) => {
    let contato = value.replace(/\D/g, '');
    contato = contato.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (contato.length >= 11) {
      contato = contato.replace(/(\d{5})(\d{4})$/, "$1-$2");
    } else {
      contato = contato.replace(/(\d{4})(\d{0,4})$/, "$1-$2");
    }
    return contato;
  };

  const fetchClientes = () => {
    let query = `/clientes?`;
    if (filtroNome) query += `nome=${encodeURIComponent(filtroNome)}&`;
    if (filtroCpfCnpj) query += `cpf_cnpj=${encodeURIComponent(filtroCpfCnpj)}&`;
    if (ordem) query += `ordem=${encodeURIComponent(ordem)}`;
    
    api.get(query)
      .then((res) => setClientes(res.data))
      .catch((err) => setError(`Erro ao carregar clientes: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClientes();
  }, [filtroNome, filtroCpfCnpj, ordem]);

  const handleOpenHistorico = (clienteId: number, clienteNome: string) => {
    setSelectedClienteId(clienteId);
    setSelectedClienteNome(clienteNome);
  };

  const handleCloseHistorico = () => {
    setSelectedClienteId(null);
    setSelectedClienteNome("");
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      api.delete(`/clientes/${id}`)
        .then(() => setClientes(clientes.filter((cliente) => cliente.id !== id)))
        .catch((err) => console.error("Erro ao excluir cliente:", err));
    }
  };

  if (loading) return <p>Carregando clientes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row lg:space-x-4 space-y-2 lg:space-y-0 mb-4">
        <Input
          className="lg:w-1/3 w-full"
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <div className="lg:w-1/3 w-full">
          <Input
            placeholder="Filtrar por CPF/CNPJ"
            value={filtroCpfCnpj}
            onChange={(e) => setFiltroCpfCnpj(e.target.value)}
          />
        </div>
        <div className="lg:w-1/3 w-full">
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
      </div>
      <div className="overflow-x-auto">
        {clientes.length > 0 ? (
          <Table className="min-w-full">
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
                  <TableCell>{formatCpfCnpj(cliente.cpf_cnpj)}</TableCell>
                  <TableCell>{formatContato(cliente.contato)}</TableCell>
                  <TableCell>{cliente.endereco}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => handleOpenHistorico(cliente.id, cliente.nome)}
                      >
                        Ver Histórico
                      </Button>
                      {user?.role === "admin" && ( // Exibir apenas para administradores
                        <>
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
                        </>
                      )}
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
      {selectedClienteId && (
        <HistoricoPedidosClienteModal
          clienteId={selectedClienteId}
          clienteNome={selectedClienteNome}
          onClose={handleCloseHistorico}
        />
      )}
    </div>
  );
}

export default ListClientes;