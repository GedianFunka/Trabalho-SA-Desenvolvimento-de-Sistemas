const express = require('express');
const connection = require("./db");
const cors = require("cors");
const server = express();

server.use(cors());
server.use(express.json());

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

server.post('/veiculos',(req, res) => {
    const{Modelo, Ano, Placa, Condicao} = req.body;

    const sql = 'INSERT INTO veiculos (Modelo, Ano, Placa, Condicao) VALUES (?, ?, ?, ?)';

    connection.query(sql, [Modelo, Ano, Placa, Condicao], (erro, resultados) =>{
        if(erro){
            console.error("Erro ao inserir o veículo: ", erro)
            return res.status(500).json({error: erro.message});
        }
        return res.json({
            message: "Veículo inserido com sucesso",
            id_veiculo: resultados.insertId,
            Modelo: Modelo,
            Ano: Ano,
            Placa: Placa,
            Condicao: Condicao,
        });
    });
});

server.put('/veiculos/:id_veiculo',(req, res) =>{
    const { id_veiculo } = req.params;
    const { Modelo, Ano, Placa, Condicao } = req.body;

    const sql = 'UPDATE veiculos SET Modelo = ?, Ano = ?, Placa = ?, Condicao = ? WHERE id_veiculo = ?';

    connection.query(sql, [Modelo, Ano, Placa, Condicao, id_veiculo], (erro, resultados) => {
        if(erro){
            console.error("Erro ao atualizar o veículo: ", erro);
            return res.status(500).json({error: erro.message});
        }
        return res.json({
            message: "Veículo atualizado com sucesso",
            id_veiculo: id_veiculo,
            Modelo: Modelo,
            Ano: Ano,
            Placa: Placa,
            Condicao: Condicao,
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