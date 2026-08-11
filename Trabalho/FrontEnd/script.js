
//LOGOUT 
document.addEventListener('DOMContentLoaded', () => {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const eAdmin = localStorage.getItem('EAdmin');
    
    const isEAdmin = eAdmin === 'true' || eAdmin === '1' || eAdmin === 1 || eAdmin === true;
    
    const nav = document.querySelector('nav');
    const paginaAtual = window.location.pathname;

    if (paginaAtual.includes('editar.html') && !isEAdmin) {
        alert('Acesso restrito! Apenas administradores podem acessar esta página.');
        window.location.href = 'entrar.html';
        return;
    }

    if (nav) {
        const linkEditar = nav.querySelector('a[href="editar.html"]');
        const linkEntrar = nav.querySelector('a[href="entrar.html"]');
        const linkCadastrar = nav.querySelector('a[href="cadastrar.html"]');

        if (!isEAdmin && linkEditar) {
            linkEditar.remove();
        }

        if (usuarioLogado) {
            if (linkEntrar) linkEntrar.remove();
            if (linkCadastrar) linkCadastrar.remove();

            // Adiciona o botão de Sair
            if (!document.getElementById('btnSair')) {
                const linkSair = document.createElement('a');
                linkSair.href = '#';
                linkSair.id = 'btnSair';
                linkSair.innerText = `Sair (${usuarioLogado})`;

                linkSair.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.clear();
                    alert('Sessão encerrada com sucesso!');
                    window.location.href = 'index.html';
                });

                nav.appendChild(linkSair);
            }
        }
    }
});

//CADASTRO DE USUÁRIO (cadastrar.html)
const formCadastro = document.getElementById('formCadastro');

if (formCadastro) {
    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = document.getElementById('usuario').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const resposta = await fetch('http://localhost:5000/cadastro', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ usuario, email, senha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert(dados.message || 'Cadastro realizado com sucesso!');
                window.location.href = 'entrar.html';
            } else {
                alert(dados.erro || dados.message || 'Erro ao realizar o cadastro.');
            }
        } catch (erro) {
            console.error('Erro ao cadastrar:', erro);
            alert('Erro de conexão com o backend.');
        }
    });
}

//LOGIN DE USUÁRIO (entrar.html)
const formLogin = document.getElementById('formLogin');

if (formLogin) {
    formLogin.addEventListener('submit', async (event) => {
        event.preventDefault();

        const login = document.getElementById('login').value;
        const senha = document.getElementById('senha').value;

        try {
            const resposta = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ login, senha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert(dados.message || 'Login realizado com sucesso!');

                localStorage.setItem('usuarioLogado', dados.usuario);
                localStorage.setItem('EAdmin', dados.EAdmin);

                if (dados.EAdmin) {
                    window.location.href = "editar.html";
                } else {
                    window.location.href = "listar.html";
                }
            } else {
                alert(dados.erro || dados.message || 'Usuário ou senha inválidos.');
            }
        } catch (erro) {
            console.error('Erro ao fazer login:', erro);
            alert('Erro de conexão com o backend.');
        }
    });
}

const tabelaCarros = document.getElementById('tabelaCarros');

if (tabelaCarros) {
    async function carregarVeiculos() {
        try {
            const resposta = await fetch('http://localhost:5000/veiculos');

            if (!resposta.ok) {
                tabelaCarros.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">Erro ao buscar dados do servidor.</td></tr>';
                return;
            }

            const veiculos = await resposta.json();

            tabelaCarros.innerHTML = '';

            if (!Array.isArray(veiculos) || veiculos.length === 0) {
                tabelaCarros.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum veículo cadastrado no sistema.</td></tr>';
                return;
            }

            veiculos.forEach(v => {
                const linha = document.createElement('tr');
                
                const modelo = v.Modelo || v.modelo || '-';
                const placa = v.Placa || v.placa || '-';
                const ano = v.Ano || v.ano || '-';
                const condicao = v.Condicao || v.condicao || '-';
                const precoDiaria = v.Preco_Diaria || v.preco_diaria || 0;
                const precoFormatado = Number(precoDiaria).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                const indisponivel = condicao.toLowerCase() === 'indisponível' || condicao.toLowerCase() === 'alugado';
                const disableAttr = indisponivel ? 'disabled' : '';

                linha.innerHTML = `
                    <td>${modelo}</td>
                    <td>${placa}</td>
                    <td>${ano}</td>
                    <td>${condicao}</td>
                    <td>${precoFormatado}</td>
                    <td>
                        <button class="btnAlugar" data-id="${v.id_veiculo}" ${disableAttr}>Alugar</button>
                    </td>
                `;
                tabelaCarros.appendChild(linha);
            });

            document.querySelectorAll('.btnAlugar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const usuarioLogado = localStorage.getItem('usuarioLogado');
                    if (!usuarioLogado) {
                        alert('Você precisa fazer login para alugar um veículo.');
                        window.location.href = 'entrar.html';
                        return;
                    }

                    const idVeiculo = e.target.getAttribute('data-id');
                    document.getElementById('modalIdVeiculo').value = idVeiculo;
                    document.getElementById('modalAlugar').style.display = 'block';
                });
            });
        } catch (erro) {
            console.error('Erro ao buscar veículos:', erro);
            tabelaCarros.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#ef4444;">Erro de conexão com o backend.</td></tr>';
        }
    }

    carregarVeiculos();

    // MODAL ALUGAR
    const modalAlugar = document.getElementById('modalAlugar');
    const closeModal = document.getElementById('closeModal');
    const formModalAlugar = document.getElementById('formModalAlugar');

    if (modalAlugar) {
        closeModal.onclick = () => {
            modalAlugar.style.display = "none";
        }

        window.onclick = (event) => {
            if (event.target == modalAlugar) {
                modalAlugar.style.display = "none";
            }
        }

        formModalAlugar.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idVeiculo = document.getElementById('modalIdVeiculo').value;
            const Nome = document.getElementById('modalNome').value;
            const Idade = document.getElementById('modalIdade').value;
            const CPF_CNPJ = document.getElementById('modalCPF').value;
            const CNH = document.getElementById('modalCNH').value;
            const Telefone = document.getElementById('modalTelefone').value;
            const Cidade = document.getElementById('modalCidade').value;

            try {
                await fetch('http://localhost:5000/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Nome, Idade, CPF_CNPJ, CNH, Telefone, Cidade })
                });

                const res = await fetch('http://localhost:5000/alugar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_veiculo: idVeiculo })
                });
                const data = await res.json();

                if (res.ok) {
                    alert(data.message || 'Veículo alugado com sucesso!');
                    modalAlugar.style.display = "none";
                    formModalAlugar.reset();
                    carregarVeiculos();
                } else {
                    alert(data.error || 'Erro ao alugar veículo.');
                }
            } catch (err) {
                console.error('Erro:', err);
                alert('Erro de conexão com o backend.');
            }
        });
    }
}


//ATUALIZAR E EXCLUIR VEÍCULO (editar.html)
const formEditar = document.getElementById('formEditar');
const btnExcluir = document.getElementById('btnExcluir');

if (formEditar) {
    formEditar.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id_veiculo = document.getElementById('id_veiculo').value;
        const Modelo = document.getElementById('Modelo').value;
        const Ano = document.getElementById('Ano').value;
        const Placa = document.getElementById('Placa').value;
        const Condicao = document.getElementById('Condicao').value;
        const Preco_Diaria = document.getElementById('Preco_Diaria').value;

        try {
            const resposta = await fetch(`http://localhost:5000/veiculos/${id_veiculo}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ Modelo, Ano, Placa, Condicao, Preco_Diaria })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert(dados.message || 'Veículo atualizado com sucesso!');
            } else {
                alert(dados.erro || dados.message || 'Erro ao atualizar veículo.');
            }
        } catch (erro) {
            console.error('Erro ao atualizar veículo:', erro);
            alert('Erro de conexão com o backend.');
        }
    });

    if (btnExcluir) {
        btnExcluir.addEventListener('click', async () => {
            const id_veiculo = document.getElementById('id_veiculo').value;

            if (!id_veiculo) {
                alert('Informe o ID do veículo para excluir.');
                return;
            }

            if (confirm(`Tem certeza que deseja excluir o veículo ID ${id_veiculo}?`)) {
                try {
                    const resposta = await fetch(`http://localhost:5000/veiculos/${id_veiculo}`, {
                        method: 'DELETE'
                    });

                    const dados = await resposta.json();

                    if (resposta.ok) {
                        alert(dados.message || 'Veículo excluído com sucesso!');
                        formEditar.reset();
                    } else {
                        alert(dados.error || 'Erro ao excluir veículo.');
                    }
                } catch (erro) {
                    console.error('Erro ao excluir veículo:', erro);
                    alert('Erro de conexão com o backend.');
                }
            }
        });
    }
}

//CONSULTA FLEXÍVEL (consultar.html)
const formConsultar = document.getElementById('formConsultar');

if (formConsultar) {
    formConsultar.addEventListener('submit', async (event) => {
        event.preventDefault();

        const termo = document.getElementById('search').value.toLowerCase().trim();
        const tabelaResultado = document.getElementById('resultadoConsulta');

        try {
            const resposta = await fetch('http://localhost:5000/veiculos');
            const veiculos = await resposta.json();

            const filtrados = veiculos.filter(v => 
                String(v.Modelo || '').toLowerCase().includes(termo) ||
                String(v.Placa || '').toLowerCase().includes(termo) ||
                String(v.Ano || '').toLowerCase().includes(termo) ||
                String(v.Condicao || '').toLowerCase().includes(termo)
            );

            tabelaResultado.innerHTML = '';

            if (filtrados.length === 0) {
                tabelaResultado.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum veículo encontrado com este critério.</td></tr>';
                return;
            }

            filtrados.forEach(v => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${v.Modelo}</td>
                    <td>${v.Placa}</td>
                    <td>${v.Ano}</td>
                    <td>${v.Condicao}</td>
                `;
                tabelaResultado.appendChild(linha);
            });
        } catch (erro) {
            console.error('Erro ao consultar veículos:', erro);
            alert('Erro de conexão com o backend.');
        }
    });
}

//ADICIONAR NOVO VEÍCULO (editar.html)
const formAdicionarVeiculo = document.getElementById('formAdicionarVeiculo');

if (formAdicionarVeiculo) {
    formAdicionarVeiculo.addEventListener('submit', async (event) => {
        event.preventDefault();

        const Modelo = document.getElementById('cadModelo').value;
        const Ano = document.getElementById('cadAno').value;
        const Placa = document.getElementById('cadPlaca').value;
        const Condicao = document.getElementById('cadCondicao').value;
        const Preco_Diaria = document.getElementById('cadPrecoDiaria').value;

        try {
            const resposta = await fetch('http://localhost:5000/veiculos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Modelo, Ano, Placa, Condicao, Preco_Diaria })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                alert(dados.message || 'Veículo cadastrado com sucesso!');
                formAdicionarVeiculo.reset();
            } else {
                alert(dados.erro || dados.message || 'Erro ao cadastrar veículo.');
            }
        } catch (erro) {
            console.error('Erro ao adicionar veículo:', erro);
            alert('Erro de conexão com o backend.');
        }
    });
}