// npm -> repositorio depacotes do nodejs
// node -> plataforma de dev
// npm init -> para inicializar um projeto
// npm init -y -> para inicializar um projeto sem perguntar nada

// cenario
// Obter usuário
// Obter Endereço
// Obter Telefone
// Printar na tela


// adicionamos o parametro callback que poderia se chamar qualquer nome por padrão o callback é sempre o último argumento da função
function obterUsuario(callback) {
    setTimeout(() => {
        return callback(null, {
            id: 1,
            nome: 'Aladin',
            idade: 10,
            dataNascimento: new Date()
        })
    }, 1000);
}

function obterEndereco(idUsuario, callback) {
    setTimeout(() => {
        return callback(null, {
            rua: 'rua dos bobos',
            numero: 0,
        })
    }, 1000);
}

function obterTelefone(idUsuario, callback) {
    setTimeout(() => {
        return callback(null, {
            numero: '11 8908080',
            ddd: 11,
        })
    }, 2000);
}

// passamos uma função que será executada quando o método terminar
// por convenção quando trabalhamos com cbs o primeiro arg é o erro e o segundo o sucesso
obterUsuario(function callback(erro, usuario) {
    console.log('Usuario', usuario)
    // no js 0, null, undefined e vazio === false
    if (erro) {
        throw new Error('Deu ruim em Usuario')
    }

    obterEndereco(usuario.id, function callback1(erro1, endereco) {
        console.log('Endereco', endereco)
        if (erro1) {
            throw new Error('Deu ruim em Endereço')
        }
        obterTelefone(usuario.id, function callback2(erro2, telefone) {
            console.log('Telefone', telefone)
            if (erro2) {
                throw new Error('Deu ruim em Telefone')
            }
            console.log(`
                Nome: ${usuario.nome},
                Endereco: ${endereco.rua},
                Telefone: ${telefone.numero}
            `)
        })
    })
    
})


