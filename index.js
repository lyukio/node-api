// npm -> repositorio depacotes do nodejs
// node -> plataforma de dev
// npm init -> para inicializar um projeto
// npm init -y -> para inicializar um projeto sem perguntar nada

// percebemos que trabalar com callbacks pode ser trabalhoso e difícil gerenciar quando temos um fluxo dedados muito grande. Precisamos validar cada erro individualmente eprecisamos garantir o valor decada função e garantir também a convenção dos callbacks

// Para gerenciar melhor as funções usamos oobjeto PROMISE
// Quando inicializamos uma Promise temos o estado -> Pending
// Quando uma promise acontece um problema temos o estado -> Rejected
// Quando uma promise acontece o esperado temos o estado -> success / fullfilled
// Para criar um obeto promise recebe uma função com dois parametros. Primeiro é o resolve e o segundo reject

// Quando precisamos consumir uma biblioteca de terceiros. 
// Em muitos casos ainda usam CALLBACKS para trabalhar.
// Então podemos converter funções queseguem a convenção
// Importamos um módulo nativo do nodejs (somente no backend)
const util = require('util')
// convertemos nossas funções para Promise
const obterTelefoneAsync = util.promisify(obterTelefone)

// Quando precisar lançar um erro, chamamos a reject
// Quando precisar informar que terminou, chamamos a resolve

const minhaPromise = new Promise(function (resolve, reject){
    setTimeout(() => {
        return resolve({ mensagem: 'Callback é o kct'})
    }, 2000);
})

// Quando precisar recuperar o estado fullfilled (ou completo) temos a função .then
// Quando precisar recuperar o erro temos a função
// minhaPromise
//     .then(function (resultado){
//         return resultado.mensagem
//     })
//     .then(function (resultado){
//         console.log('Meu Resultado', resultado)
//     })
//     .catch(function (erro){
//         console.log('Deu ruim', erro)
//     })



// cenario
// Obter usuário
// Obter Endereço
// Obter Telefone
// Printar na tela


// adicionamos o parametro callback que poderia se chamar qualquer nome por padrão o callback é sempre o último argumento da função
function obterUsuario() {
    return new Promise(function (resolve, reject){
        setTimeout(() => {
            return resolve({
                id: 1,
                nome: 'Aladin',
                idade: 10,
                dataNascimento: new Date()
            })
        }, 1000);
    })
}

function obterEndereco(idUsuario) {
    return new Promise(function (resolve, reject){
        setTimeout(() => {
            return resolve({
                rua: 'rua dos bobos',
                numero: 0,
            })
        }, 1000);
    })
}

function obterTelefone(idUsuario, callback) {
    setTimeout(() => {
        return callback(7773, {
            numero: '11 8908080',
            ddd: 11,
        })
    }, 2000);
}

// obterUsuario()
//     .then(function (resultado){
//         return obterEndereco(resultado.id)
//             .then(function (endereco){
//                 return {
//                     rua: endereco.rua,
//                     numero: endereco.numero,
//                     nome: resultado.nome,
//                     id: resultado.id
//                 }
//             })
//     })
//     .then(function (resultado){
//         return obterTelefoneAsync(resultado.id)
//         .then(function (telefone){
//             return {
//                 rua: resultado.rua,
//                 nome: resultado.nome,
//                 id: resultado.id,
//                 telefone: telefone.numero
//             }
//         })
//     })
//     .then(function (resultado){
//         console.log('resultado', resultado)
//     })
//     .catch(function (error){
//         console.log('ERRO', error)
//     })


// Recentemente na versão ES8 do JS o time do C# propos uma feature para melhorar o fluxo de operações
// Agora, o mesmo fluxo que é visualizado é executado
// 1o passo -> adicionar a palavra async na assinatura da função.
// isso faz a função informar que retornará uma PROMISE
// 2o passo é adicionar a palavra await na função que queremos manipular o resultado


async function main() {
    // para manipular erros de promise usando async/await usamos o block try/catch.
    // Quando algo inesperado acontece, o catch é acionado
    try{
        const usuario = await obterUsuario()
        const endereco = await obterEndereco(usuario.id)
        const telefone = await obterTelefoneAsync(usuario.id)
        
        console.log(`
            Nome: ${usuario.nome},
            telefone: ${telefone.numero},
            rua: ${endereco.rua}
        `)
    }
    catch (error) {
        console.error('DEU RUIM', error)
    }
}

main()
    .then(function(resultado){
        console.log('terminou!')
    })