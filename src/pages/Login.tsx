import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // UseNavigate para redirecionamento
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext'; // Importando o useAuth para acessar o contexto

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Usando o contexto de autenticação
  const navigate = useNavigate(); // Para redirecionamento

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, senha); // Chama a função de login do contexto
      navigate('/'); // Redireciona para a página inicial ou outra rota após login bem-sucedido
    } catch (err) {
      setError('Falha ao realizar login. Verifique suas credenciais.');
    }
  };

  return (
    <div id="login" className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Login</h2>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Entrar
          </Button>
        </form>
        <p className="text-center mt-4">
          Não tem uma conta? <Link to="/register" className="text-blue-600">Registre-se aqui</Link>
        </p>
      </Card>
    </div>
  );
};  

export default Login;