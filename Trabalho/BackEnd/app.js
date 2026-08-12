const express = require('express');
const connection = require("./db");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const server = express();
 
server.use(cors());
server.use(express.json());
 
// Configuração de upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, nomeUnico);
    }
});
 
const upload = multer({ storage });
 
server.use('/uploads', express.static('uploads'));

//Tabela veículos

server.get('/veiculos', (req, res)=>{
    const sql = 'SELECT * FROM veiculos';

    connection.query(sql, (erro, resultados) =>{
        if(erro){
            console.error("Erro ao consultar os veiculos: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json(resultados);
    });
});

server.get('/veiculos/:Placa', (req, res) => {
    const { Placa } = req.params;

    const sql = 'SELECT * FROM veiculos WHERE Placa = ?';


    connection.query(sql, [Placa], (erro, resultados) => {
        if(erro){
            console.error("Erro ao consultar a placa do veículo: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json(resultados[0]);
    });
});

server.post('/veiculos', upload.single('imagem'), (req, res) => {
    const { Modelo, Ano, Placa, Condicao, Preco_Diaria } = req.body;
    const Imagem = req.file ? `/uploads/${req.file.filename}` : null;
 
    const sql = 'INSERT INTO veiculos (Modelo, Ano, Placa, Condicao, Preco_Diaria, Imagem) VALUES (?, ?, ?, ?, ?, ?)';
 
    connection.query(sql, [Modelo, Ano, Placa, Condicao, Preco_Diaria, Imagem], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao inserir o veículo: ", erro)
            return res.status(500).json({ error: erro.message });
        }
        return res.json({
            message: "Veículo inserido com sucesso",
            id_veiculo: resultados.insertId,
            Modelo: Modelo,
            Ano: Ano,
            Placa: Placa,
            Condicao: Condicao,
            Preco_Diaria: Preco_Diaria,
            Imagem: Imagem,
        });
    });
});
 
server.put('/veiculos/:id_veiculo', upload.single('imagem'), (req, res) => {
    const { id_veiculo } = req.params;
    const { Modelo, Ano, Placa, Condicao, Preco_Diaria } = req.body;
 
    if (req.file) {
        const Imagem = `/uploads/${req.file.filename}`;
        atualizarVeiculo(Imagem);
    } else {
        connection.query('SELECT Imagem FROM veiculos WHERE id_veiculo = ?', [id_veiculo], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao buscar imagem atual: ", erro);
                return res.status(500).json({ error: erro.message });
            }
            const ImagemAtual = resultados[0] ? resultados[0].Imagem : null;
            atualizarVeiculo(ImagemAtual);
        });
    }
 
    function atualizarVeiculo(Imagem) {
        const sql = 'UPDATE veiculos SET Modelo = ?, Ano = ?, Placa = ?, Condicao = ?, Preco_Diaria = ?, Imagem = ? WHERE id_veiculo = ?';
 
        connection.query(sql, [Modelo, Ano, Placa, Condicao, Preco_Diaria, Imagem, id_veiculo], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao atualizar o veículo: ", erro);
                return res.status(500).json({ error: erro.message });
            }
            return res.json({
                message: "Veículo atualizado com sucesso",
                id_veiculo: id_veiculo,
                Modelo: Modelo,
                Ano: Ano,
                Placa: Placa,
                Condicao: Condicao,
                Preco_Diaria: Preco_Diaria,
                Imagem: Imagem,
            });
        });
    }
});

server.post('/alugar', (req, res) => {
    const { id_veiculo } = req.body;

    const sql = "UPDATE veiculos SET Condicao = 'Indisponível' WHERE id_veiculo = ?";

    connection.query(sql, [id_veiculo], (erro, resultados) => {
        if(erro){
            console.error("Erro ao alugar o veículo: ", erro);
            return res.status(500).json({error: erro.message});
        }
        if(resultados.affectedRows === 0) {
            return res.status(404).json({error: "Veículo não encontrado."});
        }
        return res.json({
            message: "Veículo alugado com sucesso",
            id_veiculo: id_veiculo,
            Condicao: 'Indisponível'
        });
    });
});

server.delete('/veiculos/:id_veiculo', (req, res) =>{
    const id_veiculo = req.params.id_veiculo;

    const sql = 'DELETE FROM veiculos WHERE id_veiculo = ?';

    connection.query(sql, [id_veiculo], (erro) => {
        if(erro){
            console.error("Erro ao deletar o veículo: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json({message: "Veículo deletado com sucesso",
            id_veiculo: id_veiculo
        });
    });
});

//Tabela clientes

server.get('/clientes', (req, res) =>{
    const sql = 'SELECT * FROM clientes';

    connection.query(sql, (erro, resultados) => {
        if(erro){
            console.error("Erro ao consultar os clientes: ", erro);
            return res.status(500).json({error: erro.message});
        };
        return res.json(resultados);
    });
});

server.get('/clientes/:CPF_CNPJ', (req, res) => {
    const CPF_CNPJ = req.params.CPF_CNPJ;

    const sql = 'SELECT * FROM clientes WHERE CPF_CNPJ = ?';

    connection.query(sql, [CPF_CNPJ], (erro, resultados) => {
        if(erro){
            console.error("Erro ao consultar o cliente: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json(resultados[0]);
    });
});

server.post('/clientes', (req, res) => {
    const {Nome, Idade, CPF_CNPJ, CNH, Telefone, Cidade} = req.body;

    const sql = 'INSERT INTO clientes (Nome, Idade, CPF_CNPJ, CNH, Telefone, Cidade) VALUES (?,?,?,?,?,?)';

    connection.query(sql, [Nome, Idade, CPF_CNPJ, CNH, Telefone, Cidade], (erro, resultados) =>{
        if(erro){
            console.error("Erro ao inserir o cliente: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json({
            message: "Cliente inserido com sucesso",
            id_cliente: resultados.insertId,
            Nome: Nome,
            Idade: Idade,
            CPF_CNPJ: CPF_CNPJ,
            CNH : CNH,
            Telefone: Telefone,
            Cidade: Cidade,
        });
    });
});

server.put('/clientes/:id_cliente', (req, res) =>{
    const id_cliente = req.params.id_cliente;

    const {Nome, Idade, CPF_CNPJ, CNH, Telefone, Cidade} = req.body;

    const sql = 'UPDATE clientes SET Nome = ?, Idade = ?, CPF_CNPJ = ?, CNH = ?, Telefone = ?, Cidade = ? WHERE id_cliente = ?';

    connection.query(sql, [Nome, Idade, CPF_CNPJ, CNH, Telefone, Cidade, id_cliente], (erro, resultado) => {
        if(erro){
            console.error("Erro ao atualizar o clinete: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json({
            message: "Cliente atualizado com sucesso",
            id_cliente: id_cliente,
            Nome: Nome,
            Idade: Idade,
            CPF_CNPJ: CPF_CNPJ,
            CNH : CNH,
            Telefone: Telefone,
            Cidade: Cidade,
        });
    });
});

server.delete('/clientes/:id_cliente', (req, res) =>{
    const id_cliente = req.params.id_cliente;

    const sql = 'DELETE FROM clientes WHERE id_cliente = ?';

    connection.query(sql, [id_cliente], (erro) => {
        if(erro){
            console.error("Erro ao deletar o cliente: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json({
            message: "Cliente deletado com sucesso",
            id_cliente: id_cliente,
        });
    });
});

//Tabela locações

server.get('/locacao', (req, res) =>{
    const sql = 'SELECT * FROM locacao';

    connection.query(sql, (erro, resultados)=> {
        if(erro){
            console.error("Erro ao consultar as locação: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json(resultados);
    });
});

server.get('/locacao/clientes/:CPF_CNPJ', (req, res) => {
    const CPF_CNPJ = req.params.CPF_CNPJ;

    const sql = `
        SELECT l.* 
        FROM locacao l
        JOIN clientes c ON l.id_cliente = c.id_cliente
        WHERE c.CPF_CNPJ = ?
    `;

    connection.query(sql, [CPF_CNPJ], (erro, resultados) => {
        if(erro){
            console.error("Erro ao consultar a locação: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json(resultados);
    });
});

server.post('/locacao', (req, res) => {
    const {Data_inicio, Data_fim, Valor, Status, CPF_CNPJ, Placa} = req.body;

    const sqlInsert = `
        INSERT INTO locacao (Data_inicio, Data_fim, Valor, Status, id_cliente, id_veiculo)
        SELECT ?, ?, ?, ?, c.id_cliente, v.id_veiculo
        FROM clientes c, veiculos v
        WHERE c.CPF_CNPJ = ? AND v.Placa = ?
    `;
    connection.query(sqlInsert, [Data_inicio, Data_fim, Valor, Status, CPF_CNPJ, Placa], (erro, resultados) => {
        if(erro){
            console.error("Erro ao inserir a locação: ", erro);
            return res.status(500).json({error: erro.message});
        }

        if(resultados.affectedRows === 0) {
            return res.status(404).json({
                error: "Não foi possível inserir a locação. Verifique se o cliente e o veículo existem."
            });
        };

        const id_locacao = resultados.insertId;

        const sqlSelect = `
        SELECT 
        l.id_locacao,
        l.Data_inicio,
        l.Data_fim,
        l.Valor,
        l.Status,
        c.Nome AS Nome,
        v.Placa AS Placa
        FROM locacao l
        JOIN clientes c ON l.id_cliente = c.id_cliente
        JOIN veiculos v ON l.id_veiculo = v.id_veiculo
        WHERE l.id_locacao = ?
    `;

    connection.query(sqlSelect, [id_locacao], (erro, resultados) => {
        if(erro){
            console.error("Erro ao consultar a locação inserida: ", erro);
            return res.status(500).json({error: erro.message});
        }

        return res.json({
            message: "Locação inserida com sucesso",
            locacao: resultados[0]

            });
        });
    });
});

server.put('/locacao/:id_locacao', (req, res) => {
    const id_locacao = req.params.id_locacao;

    const {Data_inicio, Data_fim, Valor, Status, CPF_CNPJ, Placa} = req.body;

    const sqlUpdate = `UPDATE locacao l
    JOIN clientes c ON l.id_cliente = c.id_cliente
    JOIN veiculos v ON l.id_veiculo = v.id_veiculo
    SET l.Data_inicio = ?, l.Data_fim = ?, l.Valor = ?, l.Status = ?
    WHERE l.id_locacao = ? AND c.CPF_CNPJ = ? AND v.Placa = ?`;

    connection.query(sqlUpdate, [Data_inicio, Data_fim, Valor, Status, id_locacao, CPF_CNPJ, Placa], (erro, resultados) => {
        if(erro){
            console.error("Erro ao atualizar a locação: ", erro);
            return res.status(500).json({error: erro.message});
        }

        return res.json({
            message: "Locação atualizada com sucesso",
            locacao: resultados
        });
    });
});

server.delete('/locacao/:id_locacao', (req, res) => {
    const id_locacao = req.params.id_locacao;

    const sqlDelete = 'DELETE FROM locacao WHERE id_locacao = ?';

    connection.query(sqlDelete, [id_locacao], (erro) => {
        if(erro){
            console.error("Erro ao deletar a locação: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json({
            message: "Locação deletada com sucesso",
            id_locacao: id_locacao
        });
    }); 
});

server.post('/cadastro', (req, res) => {
    const {usuario, email, senha} = req.body;

    if(senha && senha.length > 10){
        return res.status(400).json({erro: "A senha pode ter no maximo 10 caracteres"})

    }

    const sql = 'INSERT INTO usuario(Usuario, Email, Senha) VALUES (?,?,?)';

    connection.query(sql, [usuario, email, senha], (erro, resultado) => {
        if(erro){
            if(erro.code === 'ER_DUP_ENTRY'){
                return res.status(400).json({erro: "Email ja cadastrado"})
            }
            console.error("Erro ao cadastrar usuario:", erro)
            return res.status(500).json({erro: erro.message})
        }
        return res.json({
            message: "Usuario cadastrado com sucesso",
            id_usuarios: resultado.insertId
        });
    });
});

server.post('/login',(req, res) =>{
    const {login, senha} = req.body;

    const sql = 'SELECT * FROM usuario WHERE (Email = ? OR Usuario = ?) AND Senha = ?'

    connection.query(sql, [login, login, senha], (erro, resultado)=>{
    
        if(erro){
            console.error("Erro ao fazer login: ", erro);
            return res.status(500).json({error: erro.message});
        }
        if(resultado.length === 0){
            return res.status(401).json({erro: "Usuario/email ou senha invalidos"})
        }

        const UsuarioEncontrado = resultado[0];

        const EAdmin = (UsuarioEncontrado.Email === 'admin@locadora.com' || UsuarioEncontrado.Usuario === 'Administrador');

        return res.json({
            message: "Login realizado com sucesso",
            EAdmin: EAdmin,
            usuario: UsuarioEncontrado.Usuario
        });
    });
});

server.listen(5000, () => {
    console.log("Servidor rodando na porta 5000");
});
