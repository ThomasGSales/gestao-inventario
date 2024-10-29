import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import Fornecedores from './pages/Fornecedores';
import Pedidos from './pages/Pedidos';
import ItensPedidos from './pages/ItensPedidos';
import Clientes from './pages/Clientes';
import TransacoesFinanceiras from './pages/TransacoesFinanceiras';
import FormData from './components/FormData';
import FormFornecedor from './components/FormFornecedor';
import FormPedidos from './components/FormPedidos';
import FormClientes from './components/FormClientes';
import Sobre from './pages/Sobre';
import './App.css';
import Login from './pages/Login';
import Registro from './pages/Registro';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Button } from "@/components/ui/button";
import PrivateRoute from "@/components/PrivateRoute";
import Relatorios from './pages/Relatorios';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth(); // Agora pegamos o estado de loading

  const handleLogout = () => {
    logout(); // Chama o logout do contexto
  };

  return (
    <div className="App">
      <nav>
        <div className="nav-container">
          <div className="logo">
            <Link to="/">PreTeX</Link>
          </div>

          {/* Menu Links */}
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link to="/sobre" onClick={() => setMenuOpen(false)}>Sobre</Link></li>

              {user && (
                <>
                  <li><Link to="/produtos" onClick={() => setMenuOpen(false)}>Produtos</Link></li>
                  <li><Link to="/fornecedores" onClick={() => setMenuOpen(false)}>Fornecedores</Link></li>
                  <li><Link to="/pedidos" onClick={() => setMenuOpen(false)}>Pedidos</Link></li>
                  {/* <li><Link to="/itenspedidos" onClick={() => setMenuOpen(false)}>Itens Pedidos</Link></li> */}
                  <li><Link to="/clientes" onClick={() => setMenuOpen(false)}>Clientes</Link></li>
                  <li><Link to="/transacoes" onClick={() => setMenuOpen(false)}>Transações Financeiras</Link></li>
                  <li><Link to="/relatorios" onClick={() => setMenuOpen(false)}>Relatórios</Link></li>
                </>
              )}

              {/* Adiciona o Login/Logout dentro do menu no modo responsivo */}
              <li className="auth-link">
                {user ? (
                  <Button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</Button>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                )}
              </li>
            </ul>
          </div>

          {/* Menu Icon */}
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={<Registro />} />

        {/* Rotas protegidas */}
        <Route path="/produtos" element={<PrivateRoute user={user} loading={loading}><Produtos /></PrivateRoute>} />
        <Route path="/fornecedores" element={<PrivateRoute user={user} loading={loading}><Fornecedores /></PrivateRoute>} />
        
        {/* Apenas admin pode criar e editar fornecedores */}
        <Route path="/fornecedor/new" element={<PrivateRoute user={user} requiredRole="admin" loading={loading}><FormFornecedor /></PrivateRoute>} />
        <Route path="/fornecedor/edit/:FornecedorID" element={<PrivateRoute user={user} requiredRole="admin" loading={loading}><FormFornecedor /></PrivateRoute>} />
        
        {/* Rotas para pedidos */}
        <Route path="/pedidos" element={<PrivateRoute user={user} loading={loading}><Pedidos /></PrivateRoute>} />
        <Route path="/addpedido" element={<PrivateRoute user={user} loading={loading}><FormPedidos /></PrivateRoute>} />
        <Route path="/editpedido/:id" element={<PrivateRoute user={user} loading={loading}><FormPedidos /></PrivateRoute>} />

        <Route path="/clientes" element={<PrivateRoute user={user} loading={loading}><Clientes /></PrivateRoute>} />
        <Route path="/clientes/new" element={<PrivateRoute user={user} requiredRole="admin" loading={loading}><FormClientes /></PrivateRoute>} />
        <Route path="/clientes/edit/:id" element={<PrivateRoute user={user} requiredRole="admin" loading={loading}><FormClientes /></PrivateRoute>} />

        {/* Outras rotas protegidas */}
        <Route path="/itenspedidos" element={<PrivateRoute user={user} loading={loading}><ItensPedidos /></PrivateRoute>} />
        <Route path="/transacoes" element={<PrivateRoute user={user} loading={loading}><TransacoesFinanceiras /></PrivateRoute>} />
        <Route path="/relatorios" element={<PrivateRoute user={user} loading={loading}><Relatorios /></PrivateRoute>} />
        <Route path="/modify/:ProductID" element={<PrivateRoute user={user} loading={loading}><FormData /></PrivateRoute>} />
        <Route path="/add" element={<PrivateRoute user={user} loading={loading}><FormData /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

function RootApp() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default RootApp;