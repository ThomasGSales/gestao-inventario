# Sistema de Gestão de Inventário - React + TypeScript + Vite
## Visão Geral
Este projeto é um sistema de gerenciamento de inventário, projetado para facilitar o controle de produtos, clientes, fornecedores, pedidos, transações financeiras e usuários. Ele utiliza uma arquitetura baseada em React com TypeScript para o frontend e Node.js com SQLite para o backend.

### Objetivo do Projeto
O sistema permite o cadastro, edição, exclusão e listagem de diferentes entidades como produtos, clientes, e fornecedores, além de funcionalidades de busca avançada e filtragem. A aplicação é responsiva, com controle de acesso baseado em permissões, e fornece relatórios detalhados para apoiar a tomada de decisão.

## Funcionalidades Principais
1. **Gestão de Produtos**: CRUD de produtos, incluindo upload de imagens.
2. **Gestão de Clientes e Fornecedores**: Cadastro, edição, exclusão e filtros para clientes e fornecedores.
3. **Controle de Pedidos e Itens**: Criação de pedidos e gerenciamento de itens de pedido associados.
4. **Transações Financeiras**: Registro de entradas e saídas de produtos.
5. **Autenticação de Usuários**: Registro e login com controle de permissões.
6. **Relatórios Detalhados**: Estoque, transações financeiras e vendas.

## Estrutura do Projeto

O projeto está dividido em duas pastas principais:

- **Backend (inventoryapp/db)**: Contém a lógica de negócios e APIs para a aplicação.
- **Frontend (inventoryapp)**: Interface do usuário construída com React.

## Configurando o Frontend

Para configurar o frontend, siga os passos abaixo:

1. No terminal, navegue até a pasta principal da aplicação:
   ```bash
   cd inventoryapp
   ```
2. Instale o ReactDOM para navegação
   ```bash
   npm install react-router-dom
   ```

## Configuração do Backend

Para iniciar o backend, siga os passos abaixo:

 1. Navegue até a pasta do backend e faça os seguintes comandos:
   ```bash
cd inventoryapp/db
   ```
  ```bash
npm init -y
  ```
  ```bash
npm i nodemon -D
  ```
  ```bash
npm i sqlite3
  ```
 ```bash
npm install multer express bcryptjs jsonwebtoken cors
 ```
2. Para iniciar o servidor, use o comando:
  ```bash
   npx nodemon server.js
  ```
3. Para iniciar a aplicação, use o comando:
```bash
npm run dev
```

## Tecnologias Utilizadas
- Frontend: ReactJS + TypeScript + Vite + Shadcn/ui.
- Backend: Node.js + Express.
- Banco de Dados: SQLite.
- Autenticação: JsonWebToken e Bcrypt para hash de senhas.
- Controle de Imagens: Upload via Multer.
- Controle de CORS: Middleware de segurança CORS configurado.





