import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Definição do tipo de fornecedor
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

  const navigate = useNavigate();
  const { FornecedorID } = useParams<{ FornecedorID: string }>();

  useEffect(() => {
    if (FornecedorID) {
      fetch(`http://localhost:3000/fornecedores/${FornecedorID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao buscar fornecedor.");
          return res.json();
        })
        .then((foundFornecedor: Fornecedor) => {
          setFornecedor(foundFornecedor);
        })
        .catch((err) => console.error(err));
    }
  }, [FornecedorID]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const method = FornecedorID ? "PUT" : "POST";
    const url = FornecedorID
      ? `http://localhost:3000/fornecedores/${FornecedorID}`
      : "http://localhost:3000/fornecedores";

    fetch(url, {
      method: method,
      body: JSON.stringify(fornecedor),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ao salvar: ${res.statusText}`);
        return res.json();
      })
      .then(() => navigate("/fornecedores"))
      .catch((err) => console.error("Erro ao salvar fornecedor:", err));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFornecedor({
      ...fornecedor,
      [e.target.name]: e.target.value,
    });
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
            placeholder="CNPJ"
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
            placeholder="Contato"
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
        <Button type="submit" className="w-full lg:w-1/2 mx-auto">{FornecedorID ? "Atualizar" : "Salvar"}</Button>
      </form>
    </div>
  );
}

export default FormFornecedor;