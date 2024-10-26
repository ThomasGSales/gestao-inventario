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
  const { FornecedorID } = useParams<{ FornecedorID: string }>(); // ID opcional para edição

  useEffect(() => {
    if (FornecedorID) {
      // Buscar dados do fornecedor para edição
      fetch(`http://localhost:3000/fornecedores/${FornecedorID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`, // Incluindo o token JWT
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
        "Authorization": `Bearer ${localStorage.getItem('token')}`, // Incluindo o token JWT
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
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="Nome">Nome do Fornecedor</Label>
          <Input
            type="text"
            name="Nome"
            value={fornecedor.Nome}
            onChange={handleChange}
            placeholder="Nome do Fornecedor"
            required
          />
        </div>
        <div>
          <Label htmlFor="CNPJ">CNPJ</Label>
          <Input
            type="text"
            name="CNPJ"
            value={fornecedor.CNPJ}
            onChange={handleChange}
            placeholder="CNPJ"
            required
          />
        </div>
        <div>
          <Label htmlFor="Contato">Contato</Label>
          <Input
            type="text"
            name="Contato"
            value={fornecedor.Contato}
            onChange={handleChange}
            placeholder="Contato"
            required
          />
        </div>
        <div>
          <Label htmlFor="Endereco">Endereço</Label>
          <Input
            type="text"
            name="Endereco"
            value={fornecedor.Endereco}
            onChange={handleChange}
            placeholder="Endereço"
          />
        </div>
        <Button type="submit">{FornecedorID ? "Atualizar" : "Salvar"}</Button>
      </form>
    </div>
  );
}

export default FormFornecedor;