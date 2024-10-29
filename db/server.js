const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Configuração do servidor Express
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para permitir CORS
app.use(cors());

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('empresa.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão estabelecida com sucesso.');
  }
});

// Criação da tabela Usuários
db.run(
  `CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user'
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Usuários:', err.message);
    } else {
      console.log('Tabela Usuários criada com sucesso.');
    }
  }
);

// Criação da tabela Fornecedores
db.run(
  `CREATE TABLE IF NOT EXISTS Fornecedores(
    FornecedorID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    CNPJ TEXT UNIQUE NOT NULL,
    Contato TEXT,
    Endereco TEXT
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Fornecedores:', err.message);
    } else {
      console.log('Tabela Fornecedores criada com sucesso.');
    }
  }
);

// Criação da tabela Produtos
db.run(
  `CREATE TABLE IF NOT EXISTS Produtos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco FLOAT,
    quantidade INTEGER,
    imagem TEXT,
    fornecedorId INTEGER NOT NULL,
    FOREIGN KEY (fornecedorId) REFERENCES Fornecedores(FornecedorID)
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Produtos:', err.message);
    } else {
      console.log('Tabela Produtos criada com sucesso.');
    }
  }
);

// Configuração do armazenamento de imagens com Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Gera um nome único para o arquivo
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Registro de usuário
app.post('/register', (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Erro ao gerar hash da senha.');
    }
    db.run(
      `INSERT INTO Usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)`,
      [nome, email, hashedPassword, role || 'user'],
      function (err) {
        if (err) {
          return res.status(500).send('Erro ao registrar o usuário.');
        }
        res.status(201).send('Usuário registrado com sucesso!');
      }
    );
  });
});

// Login de usuário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).send('Email e senha são obrigatórios.');
  }

  db.get(`SELECT * FROM Usuarios WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(401).send('Usuário não encontrado.');
    }

    bcrypt.compare(senha, user.senha, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).send('Credenciais inválidas.');
      }
      res.json({ user: { id: user.id, name: user.nome, role: user.role } });
    });
  });
});

// Rotas para Produtos (sem token de autenticação)
app.get('/produtos', (req, res) => {
  const { nome, fornecedorId, ordemPreco } = req.query;
  let query = `
    SELECT Produtos.*, Fornecedores.Nome AS fornecedorNome 
    FROM Produtos
    LEFT JOIN Fornecedores ON Produtos.fornecedorId = Fornecedores.FornecedorID
    WHERE 1 = 1
  `;
  const queryParams = [];

  if (nome) {
    query += ' AND Produtos.nome LIKE ?';
    queryParams.push(`%${nome}%`);
  }
  if (fornecedorId) {
    query += ' AND Produtos.fornecedorId = ?';
    queryParams.push(fornecedorId);
  }
  if (ordemPreco) {
    query += ` ORDER BY Produtos.preco ${ordemPreco === 'asc' ? 'ASC' : 'DESC'}`;
  }

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
    }
  });
});

app.post('/produtos', upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco, quantidade, fornecedorId } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO Produtos (nome, descricao, preco, quantidade, imagem, fornecedorId)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, descricao, preco, quantidade, imagem, fornecedorId],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ success: true, id: this.lastID });
      }
    }
  );
});

app.get('/produtos/:id', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT * FROM Produtos WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!row) {
        res.status(404).json({ error: 'Produto não encontrado.' });
      } else {
        res.status(200).json(row);
      }
    }
  );
});


app.put('/produtos/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, quantidade, fornecedorId } = req.body;
  let imagem = req.file ? `/uploads/${req.file.filename}` : null;

  if (!imagem) {
    db.get('SELECT imagem FROM Produtos WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        imagem = row.imagem;
        atualizarProduto();
      }
    });
  } else {
    atualizarProduto();
  }

  function atualizarProduto() {
    db.run(
      `UPDATE Produtos
       SET nome = ?, descricao = ?, preco = ?, quantidade = ?, imagem = ?, fornecedorId = ?
       WHERE id = ?`,
      [nome, descricao, preco, quantidade, imagem, fornecedorId, id],
      function (err) {
        if (err) {
          console.error('Erro ao atualizar produto:', err);
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json({ success: true });
        }
      }
    );
  }
});

app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Produtos WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Erro ao excluir produto:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

app.get('/fornecedores', (req, res) => {
  const { ordem, filtro } = req.query;
  let query = `SELECT * FROM Fornecedores WHERE 1=1`;
  const params = [];

  if (filtro) {
    query += ` AND (Nome LIKE ? OR Contato LIKE ?)`;
    params.push(`%${filtro}%`, `%${filtro}%`);
  }

  if (ordem) {
    query += ` ORDER BY Nome ${ordem === 'asc' ? 'ASC' : 'DESC'}`;
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
    }
  });
});

app.get('/fornecedores/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM Fornecedores WHERE FornecedorID = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Fornecedor não encontrado.' });
    } else {
      res.status(200).json(row);
    }
  });
});

app.post('/fornecedores', (req, res) => {
  const { Nome, CNPJ, Contato, Endereco } = req.body;
  db.run(
    `INSERT INTO Fornecedores (Nome, CNPJ, Contato, Endereco) VALUES (?, ?, ?, ?)`,
    [Nome, CNPJ, Contato, Endereco],
    function (err) {
      if (err) {
        console.error('Erro ao inserir fornecedor:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log('Fornecedor criado com sucesso.');
        res.status(201).json({ success: true, id: this.lastID });
      }
    }
  );
});

app.put('/fornecedores/:id', (req, res) => {
  const { id } = req.params;
  const { Nome, CNPJ, Contato, Endereco } = req.body;
  db.run(
    `UPDATE Fornecedores
     SET Nome = ?, CNPJ = ?, Contato = ?, Endereco = ?
     WHERE FornecedorID = ?`,
    [Nome, CNPJ, Contato, Endereco, id],
    function (err) {
      if (err) {
        console.error('Erro ao atualizar fornecedor:', err);
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

app.delete('/fornecedores/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Fornecedores WHERE FornecedorID = ?', [id], function (err) {
    if (err) {
      console.error('Erro ao excluir fornecedor:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

// Rota para listar todos os usuários cadastrados com suas senhas em hash
app.get('/usuarios', (req, res) => {
  const query = 'SELECT id, nome, email, senha, role FROM Usuarios';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.status(200).json(rows);
  });
});

// Criação da tabela Pedidos
db.run(
  `CREATE TABLE IF NOT EXISTS Pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    clienteId INTEGER NOT NULL,
    status TEXT CHECK(status IN ('Pendente', 'Concluído')) DEFAULT 'Pendente',
    total FLOAT DEFAULT 0,
    FOREIGN KEY (clienteId) REFERENCES Clientes(id)
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Pedidos:', err.message);
    } else {
      console.log('Tabela Pedidos criada com sucesso.');
    }
  }
);

// Criação da tabela ItensPedido
db.run(
  `CREATE TABLE IF NOT EXISTS ItensPedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidoId INTEGER NOT NULL,
    produtoId INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    precoUnitario FLOAT NOT NULL,
    FOREIGN KEY (pedidoId) REFERENCES Pedidos(id),
    FOREIGN KEY (produtoId) REFERENCES Produtos(id)
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela ItensPedido:', err.message);
    } else {
      console.log('Tabela ItensPedido criada com sucesso.');
    }
  }
);

// Rota para listar todos os pedidos
app.get('/pedidos', (req, res) => {
  const { clienteId, status, ordemTotal } = req.query;
  
  let query = `
    SELECT Pedidos.*, Clientes.nome AS clienteNome
    FROM Pedidos
    LEFT JOIN Clientes ON Pedidos.clienteId = Clientes.id
    WHERE 1 = 1
  `;
  const queryParams = [];

  // Adiciona o filtro de clienteId se fornecido e for um número válido
  if (clienteId && !isNaN(clienteId)) {
    query += ' AND Pedidos.clienteId = ?';
    queryParams.push(Number(clienteId));
  }

  // Adiciona o filtro de status se fornecido
  if (status) {
    query += ' AND Pedidos.status = ?';
    queryParams.push(status);
  }

  // Ordena pelo total se especificado
  if (ordemTotal) {
    query += ` ORDER BY Pedidos.total ${ordemTotal === 'asc' ? 'ASC' : 'DESC'}`;
  }

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
    }
  });
});

app.get('/pedidos/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT Pedidos.*, Clientes.nome AS clienteNome
     FROM Pedidos
     LEFT JOIN Clientes ON Pedidos.clienteId = Clientes.id
     WHERE Pedidos.id = ?`,
    [id],
    (err, pedido) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!pedido) {
        res.status(404).json({ error: 'Pedido não encontrado.' });
      } else {
        // Buscar os itens do pedido
        db.all(
          `SELECT ItensPedido.*, Produtos.nome AS produtoNome 
           FROM ItensPedido
           LEFT JOIN Produtos ON ItensPedido.produtoId = Produtos.id
           WHERE ItensPedido.pedidoId = ?`,
          [id],
          (err, itens) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              // Retorna o pedido com seus itens
              res.status(200).json({ ...pedido, itens });
            }
          }
        );
      }
    }
  );
});

// Rota para criar um novo pedido
app.post('/pedidos', (req, res) => {
  const { clienteId, itens } = req.body;
  const data = new Date().toISOString();
  const status = 'Pendente';

  if (!clienteId || !itens || !itens.length) {
    return res.status(400).send('Cliente e itens do pedido são obrigatórios.');
  }

  db.run(
    `INSERT INTO Pedidos (data, clienteId, status) VALUES (?, ?, ?)`,
    [data, clienteId, status],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const pedidoId = this.lastID;
        let total = 0;

        itens.forEach((item) => {
          const { produtoId, quantidade, precoUnitario } = item;
          total += quantidade * precoUnitario;
          db.run(
            `INSERT INTO ItensPedido (pedidoId, produtoId, quantidade, precoUnitario) VALUES (?, ?, ?, ?)`,
            [pedidoId, produtoId, quantidade, precoUnitario],
            (err) => {
              if (err) {
                console.error('Erro ao inserir item do pedido:', err.message);
              }
            }
          );
        });

        db.run(
          `UPDATE Pedidos SET total = ? WHERE id = ?`,
          [total, pedidoId],
          (err) => {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.status(201).json({ success: true, id: pedidoId });
            }
          }
        );
      }
    }
  );
});

// Rota para atualizar um pedido
app.put('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const { clienteId, status, itens } = req.body;

  if (!clienteId && !status && !itens) {
    return res.status(400).send('ClienteId, status ou itens do pedido devem ser fornecidos.');
  }

  // Atualizar o clienteId e o status do pedido, se fornecidos
  if (clienteId || status) {
    let updateFields = [];
    let updateValues = [];

    if (clienteId) {
      updateFields.push('clienteId = ?');
      updateValues.push(clienteId);
    }

    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateValues.push(id);

    const updateQuery = `UPDATE Pedidos SET ${updateFields.join(', ')} WHERE id = ?`;

    db.run(updateQuery, updateValues, function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Se não houver itens para atualizar, enviar resposta de sucesso
      if (!itens || !itens.length) {
        return res.status(200).json({ success: true });
      }
    });
  }

  // Se houver itens, processá-los
  if (itens && itens.length) {
    db.run(`DELETE FROM ItensPedido WHERE pedidoId = ?`, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let total = 0;
      let itemsProcessed = 0;

      itens.forEach((item) => {
        const { produtoId, quantidade, precoUnitario } = item;
        total += quantidade * precoUnitario;

        db.run(
          `INSERT INTO ItensPedido (pedidoId, produtoId, quantidade, precoUnitario) VALUES (?, ?, ?, ?)`,
          [id, produtoId, quantidade, precoUnitario],
          (err) => {
            if (err) {
              console.error('Erro ao inserir item do pedido:', err.message);
              return res.status(500).json({ error: err.message });
            }

            itemsProcessed += 1;

            if (itemsProcessed === itens.length) {
              db.run(`UPDATE Pedidos SET total = ? WHERE id = ?`, [total, id], (err) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                res.status(200).json({ success: true });
              });
            }
          }
        );
      });
    });
  } else if (!clienteId && !status) {
    // Se nenhum campo foi atualizado, enviar resposta de sucesso
    res.status(200).json({ success: true });
  }
});

// Rota para excluir um pedido
app.delete('/pedidos/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM ItensPedido WHERE pedidoId = ?`, [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      db.run(`DELETE FROM Pedidos WHERE id = ?`, [id], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json({ success: true });
        }
      });
    }
  });
});

// Criação da tabela Clientes
db.run(
  `CREATE TABLE IF NOT EXISTS Clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT NOT NULL UNIQUE,
    contato TEXT,
    endereco TEXT
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Clientes:', err.message);
    } else {
      console.log('Tabela Clientes criada com sucesso.');
    }
  }
);

// Listar todos os clientes
app.get('/clientes', (req, res) => {
  const { nome, cpf_cnpj, ordem } = req.query;
  let query = `SELECT * FROM Clientes WHERE 1 = 1`;
  const queryParams = [];

  if (nome) {
    query += ` AND nome LIKE ?`;
    queryParams.push(`%${nome}%`);
  }
  if (cpf_cnpj) {
    query += ` AND cpf_cnpj LIKE ?`;
    queryParams.push(`%${cpf_cnpj}%`);
  }

  // Verifica se a ordem é por um dos campos válidos
  if (ordem === 'nome' || ordem === 'cpf_cnpj') {
    query += ` ORDER BY ${ordem}`;
  }

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
    }
  });
});

// Buscar cliente por ID
app.get('/clientes/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM Clientes WHERE id = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Cliente não encontrado.' });
    } else {
      res.status(200).json(row);
    }
  });
});

// Criar um novo cliente
app.post('/clientes', (req, res) => {
  const { nome, cpf_cnpj, contato, endereco } = req.body;

  if (!nome || !cpf_cnpj || !contato) {
    return res.status(400).send('Nome, CPF/CNPJ e Contato são obrigatórios.');
  }

  db.run(
    `INSERT INTO Clientes (nome, cpf_cnpj, contato, endereco) VALUES (?, ?, ?, ?)`,
    [nome, cpf_cnpj, contato, endereco],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ success: true, id: this.lastID });
      }
    }
  );
});

// Atualizar um cliente existente
app.put('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cpf_cnpj, contato, endereco } = req.body;

  if (!nome || !cpf_cnpj || !contato) {
    return res.status(400).send('Nome, CPF/CNPJ e Contato são obrigatórios.');
  }

  db.run(
    `UPDATE Clientes SET nome = ?, cpf_cnpj = ?, contato = ?, endereco = ? WHERE id = ?`,
    [nome, cpf_cnpj, contato, endereco, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

// Excluir um cliente
app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;
  
  // Verificar se o cliente tem pedidos ou transações associados
  db.get(`SELECT id FROM Pedidos WHERE clienteId = ?`, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (row) {
      res.status(400).json({ error: 'O cliente tem pedidos associados e não pode ser excluído.' });
    } else {
      // Cliente pode ser desativado
      db.run(`UPDATE Clientes SET ativo = 0 WHERE id = ?`, [id], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json({ success: true });
        }
      });
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor escutando no porto ${port}`);
});