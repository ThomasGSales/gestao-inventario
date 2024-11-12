import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "@/utils/api"; // Instância do Axios configurada

interface Fornecedor {
  FornecedorID?: number;
  Nome: string;
  CNPJ: string;
  Contato: string;
  Endereco: string;
}

function FormFornecedor() {
  const [fornecedor, setFornecedor] = useState<Fornecedor>({
    Nome: "",
    CNPJ: "",
    Contato: "",
    Endereco: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { FornecedorID } = useParams<{ FornecedorID: string }>();

  useEffect(() => {
    if (FornecedorID) {
      api.get(`/fornecedores/${FornecedorID}`)
        .then((res) => setFornecedor(res.data))
        .catch((err) => console.error("Erro ao buscar fornecedor:", err));
    }
  }, [FornecedorID]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (FornecedorID) {
        await api.put(`/fornecedores/${FornecedorID}`, fornecedor);
      } else {
        await api.post("/fornecedores", fornecedor);
      }
      navigate("/fornecedores");
    } catch (err: any) {
      if (err.response && err.response.data.message === "CNPJ já cadastrado") {
        setError("CNPJ já cadastrado. Por favor, utilize um valor diferente.");
      } else {
        setError("Erro ao salvar fornecedor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Aplicar máscara para CNPJ e Contato
    if (name === "CNPJ") {
      setFornecedor({ ...fornecedor, CNPJ: maskCNPJ(value) });
    } else if (name === "Contato") {
      setFornecedor({ ...fornecedor, Contato: maskContato(value) });
    } else {
      setFornecedor({ ...fornecedor, [name]: value });
    }
  };

  // Função para aplicar máscara de CNPJ
  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  };

  // Função para aplicar máscara de telefone
  const maskContato = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  };

  return (
    <div className="absolute top-16 left-4 max-w-md p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="Nome" className="mb-1 font-medium">Nome do Fornecedor</Label>
          <Input
            type="text"
            name="Nome"
            className="w-full"
            value={fornecedor.Nome}
            onChange={handleChange}
            placeholder="Nome do Fornecedor"
            required
          />
        </div>
        <div>
          <Label htmlFor="CNPJ" className="mb-1 font-medium">CNPJ</Label>
          <Input
            type="text"
            name="CNPJ"
            className="w-full"
            value={fornecedor.CNPJ}
            onChange={handleChange}
            placeholder="XX.XXX.XXX/XXXX-XX"
            required
          />
        </div>
        <div>
          <Label htmlFor="Contato" className="mb-1 font-medium">Contato</Label>
          <Input
            type="text"
            name="Contato"
            className="w-full"
            value={fornecedor.Contato}
            onChange={handleChange}
            placeholder="(XX) XXXXX-XXXX"
            required
          />
        </div>
        <div>
          <Label htmlFor="Endereco" className="mb-1 font-medium">Endereço</Label>
          <Input
            type="text"
            name="Endereco"
            className="w-full"
            value={fornecedor.Endereco}
            onChange={handleChange}
            placeholder="Endereço"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button type="submit" className="w-full lg:w-1/2 mx-auto" disabled={loading}>
          {loading ? "Salvando..." : FornecedorID ? "Atualizar" : "Salvar"}
        </Button>
      </form>
    </div>
  );
}

export default FormFornecedor;
