import React from 'react';
import '../style/Home.css';
import inventoryImage from '../assets/inventory.png';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="content-box">
        <div className="text-section">
          <h1>Bem-vindo ao Sistema de Gestão de Inventário</h1>
          <p>Organize, monitore e otimize seu estoque e suas transações com segurança e praticidade.</p>
          <p>Nosso sistema oferece soluções intuitivas para controle de produtos, fornecedores, pedidos e transações financeiras, tudo em uma única plataforma.</p>
        </div>
        
        <div className="image-section">
          <img src={inventoryImage} alt="Sistema de Inventário" className="inventory-image"/>
        </div>

        <div className="features-section">
          <div className="feature">
            <span className="feature-icon">📦</span>
            <h3>Gestão de Produtos</h3>
            <p>Controle total do seu inventário, com cadastros, edições e exclusões rápidas e fáceis.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">👥</span>
            <h3>Gerenciamento de Clientes</h3>
            <p>Mantenha um registro completo de clientes e histórico de compras para atendimento personalizado.</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <h3>Relatórios Detalhados</h3>
            <p>Gere relatórios de estoque, transações financeiras e muito mais para insights valiosos.</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Pretex. Todos os direitos reservados. Contato: suporte@pretex.com</p>
      </footer>
    </div>
  );
};

export default Home;