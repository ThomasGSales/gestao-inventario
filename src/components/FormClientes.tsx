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
      // Buscar cliente existente para edição
      api.get(`/clientes/${id}`)
        .then((res) => setCliente(res.data))
        .catch((err) => setError(`Erro ao carregar cliente: ${err.message}`));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  // Função para aplicar a máscara de CPF ou CNPJ
  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (value.length <= 11) {
      // CPF
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ
      value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    }
    setCliente({ ...cliente, cpf_cnpj: value });
  };

  // Função para aplicar a máscara de celular
  const handleContatoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");  // Adiciona parênteses no DDD
    if (value.length >= 11) {
      value = value.replace(/(\d{5})(\d{4})$/, "$1-$2");  // Adiciona hífen entre o número
    } else {
      value = value.replace(/(\d{4})(\d{0,4})$/, "$1-$2");  // Adiciona hífen para números menores
    }
    setCliente({ ...cliente, contato: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        // Atualiza cliente existente
        await api.put(`/clientes/${id}`, cliente);
      } else {
        // Cria um novo cliente
        await api.post("/clientes", cliente);
      }
      navigate("/clientes");
    } catch (err: any) {
      setError(`Erro ao salvar cliente: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? "Editar Cliente" : "Adicionar Cliente"}</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit}>
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
          onChange={handleCpfCnpjChange}  // Usando a função de máscara CPF/CNPJ
          placeholder="CPF/CNPJ"
          required
          maxLength={18}  // Limite de 18 caracteres contando os pontos, barras e hífen
        />
        <Input
          name="contato"
          value={cliente.contato}
          onChange={handleContatoChange}  // Usando a função de máscara de celular
          placeholder="Contato"
          required
          maxLength={15}  // Limite de 15 caracteres (formato (XX) XXXXX-XXXX)
        />
        <Input
          name="endereco"
          value={cliente.endereco}
          onChange={handleChange}
          placeholder="Endereço"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Cliente"}
        </Button>
      </form>
    </div>
  );
}

export default FormClientes;