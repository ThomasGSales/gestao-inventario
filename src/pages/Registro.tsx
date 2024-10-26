import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const Registro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, role }),
      });

      if (response.ok) {
        navigate('/login'); // Redireciona para o login após registro
      } else {
        const data = await response.json();
        setError(data.message || 'Erro ao registrar');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor');
    }
  };

  return (
    <div id="registro" className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6 bg-gray-100 shadow-lg rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Registrar</h2>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSenha(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label>Tipo de Usuário</Label>
            <select
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Registrar
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Registro;