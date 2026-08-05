const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Gerenciamento_MoveLocadora'
});

connection.connect((erro) => {
    if (erro) {
        console.log('Erro ao conectar: ', erro);
        return;
    } else {
        console.log('Banco conectado com sucesso');
    }
});

module.exports = connection;