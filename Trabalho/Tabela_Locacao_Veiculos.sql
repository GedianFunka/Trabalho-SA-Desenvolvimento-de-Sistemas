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
#CRIANDO A TABELA LOCAÇÃO 
#ARMAZENA E DEFINE INFORMAÇÕES NECESSÁRIAS SOBRE A TABELA LOCAÇÃO 
create table locacao(
    id_locacao int auto_increment primary key,
    Data_inicio date not null,
    Data_fim date not null,
    Valor decimal (10, 2) not null,
    Status enum('Ativa', 'Finalizada', 'Cancelada') not null,
    id_cliente int not null,
    id_veiculo int not null,
    #FAZENDO CHAVE ESTRANGEIRA COM CLIENTES, VEICULOS
    foreign key (id_cliente) references clientes(id_cliente),
    foreign key (id_veiculo) references veiculos (id_veiculo)
);
#Tabela para usuarios(login)
create table usuario(
    id_usuarios int auto_increment primary key,
    Usuario varchar(100) not null,
    Email varchar(250) not null,
    Senha varchar(10) not null
);
insert into usuario(Usuario, Email, Senha)
values (
        'Adiministrador',
        'admin@locadora.com',
        'Admin123'
    );