const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();


const db = mysql.createConnection({
  host: 'localhost',
  user: 'phpmyadmin',
  password: 'aluno',
  database: 'xrc',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    throw err;
  }
  console.log('Conexão com o banco de dados MySQL estabelecida.');
});

app.use(
  session({
    secret: 'sua_chave_secreta',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`${email} - ${password}`);

  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

  db.query(query, [email, password], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      req.session.loggedin = true;
      req.session.email = email;
      if (email.indexOf("@med") >= 0) {
        req.session.tipo = "medico";
        console.log("medico logado");
        res.redirect('/tmedico')
      } else if (email.indexOf("@adm") >= 0) {
        req.session.tipo = "adm";
        console.log("adm logado");

      } else {
        req.session.tipo = "paciente";
        console.log("paciente logado");
        res.redirect('/consultas')

      }


    } else {
      res.send('Credenciais incorretas. <a href="/">Tente novamente</a>');
    }
  });
});



// Adicione esta rota para o redirecionamento para a página de cadastro.
app.get('/index.ejs', (req, res) => {
  res.render('index');
});


app.post('/cadastro', (req, res) => {
  const { username, password, cpf, email } = req.body;

  const query = 'INSERT INTO users (username, password, cpf, email) VALUES (?, ?, ?, ?)';

  db.query(query, [username, password, cpf, email], (err, results) => {
    if (err) throw err;

    // Redirecione para a página de login após o cadastro bem-sucedido.
    res.redirect('/');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});


// ...

// Rota para o formulário de cadastro
app.get('/cadastro', (req, res) => {
  res.render('cadastro.ejs'); // Renderiza o formulário de cadastro
});

app.get('/login2', (req, res) => {
  res.render('login2.ejs'); // Renderiza o formulário de login
});

app.get('/quemsomos', (req, res) => {
  res.render('quemsomos.ejs'); // Renderiza o formulário de quemsomos
});

app.get('/tmedico', (req, res) => {
  console.log('Rendericando a página do médico');
  //let consultas = ['teste 1', 'teste 2', 'teste 3'];
  const sql = `SELECT nomePaciente, nomeMedico, horário, especiliadade FROM Medicos WHERE nomeMedico = "${req.session.email}"`;
  console.log(sql);
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao selecionar consulta:', err);
      //res.redirect('/cadastro'); // Redireciona de volta ao formulário de cadastro em caso de erro
      //res.redirect('/tmedico', {req: req, consultas: results});
    } else {
      // Cadastro bem-sucedido; você pode redirecionar para a página de login ou outra página.
      //res.redirect('/login2');
      res.render('tmedico.ejs', { req: req, consultas: results }); // Renderiza a tela de consultas
    }
  });
});

app.get('/inicio', (req, res) => {
  res.render('inicio.ejs'); // Renderiza a tela de consultas
});

// Rota para processar o formulário de cadastro
app.post('/cadastro', (req, res) => {
  const { username, password, cpf, email } = req.body;
  const sql = 'INSERT INTO users (username, password, cpf, email) VALUES (?, ?, ?, ?)';
  db.query(sql, [username, password, cpf, email], (err, result) => {
    if (err) {
      console.error('Erro ao inserir usuário:', err);
      res.redirect('/cadastro'); // Redireciona de volta ao formulário de cadastro em caso de erro
    } else {
      // Cadastro bem-sucedido; você pode redirecionar para a página de login ou outra página.
      res.redirect('/login2');
    }
  });
});

// Rota para a página de dashboard
app.get('/consultas', (req, res) => {
  console.log(`Renderizando consultas ${req.session}`);
  if (req.session.loggedin) {
    if (req.session.tipo == "paciente") {
      res.render('consultas', { req: req, consultas: ['Consulta inserida com sucesso'] });
      console.log('Página de consulta do PACIENTE enviada');
    } else if (req.session.tipo == "medico") {
      res.render('tmedico', { req: req, consultas: ['teste 1 - consulta 1'] });
      console.log('Página de consulta do MÈDICO enviada');
    } else if (req.session.tipo == "admin") {
      // Inserir código se for admin
    }
  }
  else {
    res.send('Faça login para acessar esta página. <a href="/">Login</a>');
  }

});

// ...


const port = 3000;
app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});