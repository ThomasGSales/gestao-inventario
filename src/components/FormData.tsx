import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Fornecedor {
  FornecedorID: number;
  Nome: string;
}

interface DataToInsert {
  id?: string;
  nome: string;
  descricao: string;
  preco: string;
  quantidade: string;
  imagem: File | null;
  fornecedorId: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  imagem: string;
  fornecedorId: number;
}

function FormData() {
  const [dataToInsert, setDataToInsert] = useState<DataToInsert>({
    nome: "",
    descricao: "",
    preco: "",
    quantidade: "",
    imagem: null,
    fornecedorId: "",  });
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const navigate = useNavigate();
  const { ProductID } = useParams<{ ProductID: string }>();

  // Buscar fornecedores disponíveis
  useEffect(() => {
    fetch("http://localhost:3000/fornecedores")
      .then((res) => res.json())
      .then((data: Fornecedor[]) => setFornecedores(data))
      .catch((err) => console.error("Erro ao buscar fornecedores:", err));
  }, []);

  // Buscar dados do produto se ProductID estiver presente
  useEffect(() => {
    if (ProductID) {
      fetch(`http://localhost:3000/produtos/${ProductID}`)
        .then((res) => res.json())
        .then((foundItem: Produto) => {
          setDataToInsert({
            id: foundItem.id.toString(),
            nome: foundItem.nome,
            descricao: foundItem.descricao,
            preco: foundItem.preco.toString(),
            quantidade: foundItem.quantidade.toString(),
            imagem: null,
            fornecedorId: foundItem.fornecedorId.toString(),
          });
        })
        .catch((err) => console.error("Erro ao buscar produto:", err));
    }
  }, [ProductID]);

  // No handleSubmit, o código permanece o mesmo
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new window.FormData();
  
    formData.append("nome", dataToInsert.nome);
    formData.append("descricao", dataToInsert.descricao);
    formData.append("preco", dataToInsert.preco);
    formData.append("quantidade", dataToInsert.quantidade);
    formData.append("fornecedorId", dataToInsert.fornecedorId);
  
    if (dataToInsert.imagem) {
      formData.append("imagem", dataToInsert.imagem);
    }
  
    const method = ProductID ? "PUT" : "POST";
    const url = ProductID
      ? `http://localhost:3000/produtos/${ProductID}`
      : "http://localhost:3000/produtos";
  
    fetch(url, {
      method: method,
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ao salvar: ${res.statusText}`);
        return res.json();
      })
      .then(() => navigate("/produtos"))
      .catch((err) => console.error("Erro ao salvar produto:", err));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDataToInsert({
        ...dataToInsert,
        imagem: e.target.files[0],
      });
    }
  };

  const handleSelectChange = (value: string) => {
    setDataToInsert({
      ...dataToInsert,
      fornecedorId: value,
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDataToInsert({
      ...dataToInsert,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome do Produto</Label>
          <Input
            type="text"
            value={dataToInsert.nome}
            name="nome"
            onChange={handleChange}
            placeholder="Nome do Produto"
            required
          />
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            type="text"
            value={dataToInsert.descricao}
            name="descricao"
            onChange={handleChange}
            placeholder="Descrição do Produto"
            required
          />
        </div>
        <div>
          <Label htmlFor="preco">Preço</Label>
          <Input
            type="number"
            value={dataToInsert.preco}
            name="preco"
            onChange={handleChange}
            placeholder="Preço"
            required
          />
        </div>
        <div>
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            type="number"
            value={dataToInsert.quantidade}
            name="quantidade"
            onChange={handleChange}
            placeholder="Quantidade"
            required
          />
        </div>
        <div>
          <Label htmlFor="imagem">Imagem do Produto</Label>
          <Input
            type="file"
            name="imagem"
            accept="image/*"
            onChange={handleImageChange}
            required={!ProductID}
          />
        </div>
        <div>
          <Label htmlFor="fornecedorId">Fornecedor</Label>
          <Select onValueChange={handleSelectChange} value={dataToInsert.fornecedorId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {fornecedores.map((fornecedor) => (
                <SelectItem key={fornecedor.FornecedorID} value={fornecedor.FornecedorID.toString()}>
                  {fornecedor.Nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">{ProductID ? "Atualizar" : "Salvar"}</Button>
      </form>
    </div>
  );
}

export default FormData;