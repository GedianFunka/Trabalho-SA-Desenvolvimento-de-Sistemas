#CRIANDO O BANCO DE DADOS
create database Gerenciamento_MoveLocadora;
#USANDO O BANCO DE DADOS
use Gerenciamento_MoveLocadora;
#CRIANDO  A TABELA VEICULOS
#ARMAZENA INFORMAÇÕES DE CARROS QUE ESTÃO NA LOCADORA
create table veiculos (
    id_veiculo int auto_increment primary key,
    Modelo varchar(50) not null,
    Ano year,
    Placa varchar(10) not null unique,
    Condicao enum ('Novo', 'Semi-Novo', 'Usado') not null
);
#CRIANDO A TABELA CLIENTES
#ARMAZENA INFORMAÇÕES NECESSÁRIAS SOBRE OS CLIENTES
create table clientes (
    id_cliente int auto_increment primary key,
    Nome varchar(75) not null,
    Idade int not null,
    CPF_CNPJ varchar(14),
    CNH varchar(11) not null unique,
    Telefone varchar(50),
    Cidade varchar(50)
);

#Tabela para usuarios(login)
create table usuario(
    id_usuarios int auto_increment primary key,
    Usuario varchar(100) not null,
    Email varchar(250) unique not null,
    Senha varchar(10) not null
);
insert into usuario(Usuario, Email, Senha)
values ('Administrador','admin@locadora.com','Admin123');

ALTER TABLE veiculos MODIFY COLUMN Condicao VARCHAR(50);

ALTER TABLE veiculos ADD COLUMN Preco_Diaria DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE veiculos ADD COLUMN Imagem VARCHAR(255) DEFAULT NULL;

select * from veiculos;