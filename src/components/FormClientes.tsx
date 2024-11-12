import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/utils/api";  // Instância do Axios configurada

function FormClientes() {
  const [cliente, setCliente] = useState({
    nome: "",
    cpf_cnpj: "",
    contato: "",
    endereco: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/clientes/${id}`)
        .then((res) => setCliente(res.data))
        .catch((err) => setError(`Erro ao carregar cliente: ${err.message}`));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cpf_cnpj") {
      setCliente({ ...cliente, cpf_cnpj: maskCPF_CNPJ(value) });
    } else if (name === "contato") {
      setCliente({ ...cliente, contato: maskContato(value) });
    } else {
      setCliente({ ...cliente, [name]: value });
    }
  };

  // Função para aplicar máscara de CPF/CNPJ
  const maskCPF_CNPJ = (value: string) => {
    value = value.replace(/\D/g, "");

    if (value.length <= 11) {
      return value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return value
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .substring(0, 18);
    }
  };

  // Função para aplicar máscara de telefone
  const maskContato = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.put(`/clientes/${id}`, cliente);
      } else {
        await api.post("/clientes", cliente);
      }
      navigate("/clientes");
    } catch (err: any) {
      // Verifica se o erro está relacionado ao CPF/CNPJ duplicado
      if (err.response && err.response.data.message === 'CPF/CNPJ já cadastrado') {
        setError("CPF/CNPJ já cadastrado. Por favor, utilize um valor diferente.");
      } else {
        setError(`Erro ao salvar cliente: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-16 left-4 max-w-md p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Cliente" : "Adicionar Cliente"}</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="nome"
          value={cliente.nome}
          onChange={handleChange}
          placeholder="Nome do Cliente"
          required
        />
        <Input
          name="cpf_cnpj"
          value={cliente.cpf_cnpj}
          onChange={handleChange}
          placeholder="CPF/CNPJ"
          required
          maxLength={18}
        />
        <Input
          name="contato"
          value={cliente.contato}
          onChange={handleChange}
          placeholder="Contato"
          required
          maxLength={15}
        />
        <Input
          name="endereco"
          value={cliente.endereco}
          onChange={handleChange}
          placeholder="Endereço"
        />
        <Button type="submit" disabled={loading} className="mt-4">
          {loading ? "Salvando..." : "Salvar Cliente"}
        </Button>
      </form>
    </div>
  );
}

export default FormClientes;
