// instalamos um módulo para observar alterações e reiniciara aplicação automaticamente
// npm install -g nodemon

// npm i vision@4 hapi-swagger@7 inert@4
// vision + inert expoem um front end e arquivos estáticos
// hapi-swagger cria uma documentação baseada nas rotas criadas
/*
    Quando trabalhamos com APIs Rest, trabalhamos com serviçossem estado
    Não temos mais sessão, não guardamos mais cookies
    Trafegamos apenas caves de autentificação e não sabemos o estado do usuário anterior

    Para trabalhar com o padrão Rest, seguimos algumas específicações

    AÇÃO        -   MÉTODO HTTP   - URL                     -   EXEMPLO
    Cadastrar   -   POST          - /herois - POST          -   /herois body {name: 'nome'}
    Listar      -   GET           - /herois - GET           -   /herois?ignore=10&limit=5
    Remover     -   DELETE        - /herois/:id - DELETE    -   /herois/1
    Atualizar   -   PATCH         - /herois/:id - PATCH     -   /herois/1 body {name: 'nome'}
    Atualizar   -   PUT           - /herois/:id - PUT       -   /herois/1 body {name: 'nome', idade: 15, dataNascimento:} (SEMPRE OBJ COMPLETO)

    - Atualizar a cor, de um produto, de um cliente
    ATUALIZAR - PATCH
        /customers/:id/product/:id/color
    
*/

// Importamos um módulo nativo do Node.js para criação de serviços web
// const http = require('http')

// http.createServer((request, response) => {
//     response.end('Olá Node.js!')
// }).listen(3000, () => console.log('servidor está rodando!!'))

//npm install api@16
/* 
    1o passo: Instanciar o servidor
    2o passo: Definir a porta
    3o passo: Definir a rota
    4o passo: Inicializar o servidor
*/
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const Inert = require('inert')

const Database = require('./databaseMongoDb')
// savemos que o JS acontece algumas BIZARRICES e não temos tempo para ficar validando estas coisas
// para evitar validar variaveis, valores, tipos e regras podemos definir um conjunto de regras que serão validadas antes de chamar a nossa API (handler)
// npm install joi
const Joi = require('joi')

const Hapi = require('hapi')
const app = new Hapi.Server()
app.connection({ port: 4000 })

/*
    Para definir uma rota, definimos uma resposta de acordo com a chamada
    Quando um cliente pedir a /herois, com o método GET devemo chamar uma função que retorna seu resultado
*/


// Start the server
async function run(app) {
    // para trabalhar com o Swagger, registramos 3 plugins
    // definimos o HapiSwagger como o padrão de plugin HapiJS

    // para expor nossa rota para o mundo precisamos adicionar a propriedade api na configuração da rota
    await app.register([
        Vision,
        Inert,
        {
            register: HapiSwagger,
            options: { info: {title: 'API Herois', version: 'v1.0' } }
        }
    ])
    await Database.connect()

    app.route([
        {
            path:'/herois',
            method:'GET',
            config: {
                tags: ['api'],
                description: 'Listar heróis com paginação',
                notes: 'Deve enviar o ignore e limite para paginação',
                validate: {
                    // podemos validar todo tipo de entrada da aplicação
                    // ?nome=nome = query
                    // body = payload
                    // headers = headers
                    // /herois?121221 = params
                    query: {
                        nome: Joi.string().max(100).min(1),
                        limite: Joi.number().required().max(150),
                        ignore: Joi.number().required()
                    }
                }
            },
            handler: async (request, reply) => {
                try {
                    // para pegar a query string
                    // /herois?limite=30&ignore=0
                    // const limite = request.query.limite
                    // const ignore = request.query.ignore
    
                    //extraimos somente o necessario de uma variavel (usando uma linha só)
                    const { limite, ignore, nome } = request.query

                    const queryContains = { nome: { $regex: `.*${nome}.*`, $options: 'i'} }
                    const filtro = nome ? queryContains : {}
                    // const limiteInteiro = parseInt(limite)
                    // const ignoreInteiro = parseInt(ignore)
    
                    return reply(await Database.listar(filtro, limite, ignore));

                } catch (error) {
                    console.error('deu ruim', error);
                    return reply('deu ruim')
                }
            }
        },
        {
            path: '/herois',
            method: 'POST',
            handler: async (request, reply) => {
                try {
                    //destructor -> {nome, poder, idade}
                    const heroi = {nome, poder, idade} = request.payload
                    const resultado = await Database.cadastrar(heroi)
                    return reply(resultado)
                } catch (error) {
                    console.error('deu ruim', error);
                    return reply('deu ruim');
                }
            },
            config: {
                tags: ['api'],
                description: 'Cria um novo herói',
                notes: 'Deve enviar o nome, poder e idade',
                validate: {
                    payload: { //body
                        nome: Joi.string().required().max(100).min(5),
                        poder: Joi.string().required().max(100).min(3),
                        idade: Joi.number().required().max(150).min(18)
                    }
                }
            }
        },
        {
            path: '/herois/{id}',
            method: 'DELETE',
            handler: async (request, reply) => {
                try {
                    const { id } = request.params
                    const result = await Database.remover( {_id: id })
                    return reply(result)
                } catch (error) {
                    console.error('deu ruim', error)
                    return reply('deu ruim')
                }
            },
            config: {
                tags: ['api'],
                description: 'Exclui um herói',
                notes: 'Deve enviar o id do herói',
                validate: {
                    params: {
                        id: Joi.string().required()
                    }
                }
            }
        },
        {
            path: '/herois/{id}',
            method: 'PATCH',
            handler: async (request, reply) => {
                try {
                    const {id} = request.params
                    const heroi = {nome, poder, idade} = request.payload
                    const heroiString = JSON.stringify(heroi)
                    const heroiJson = JSON.parse(heroiString)
                    const resultado = await Database.atualizar(id, heroiJson)
                    return reply(resultado)
                } catch (error) {
                    console.error('deu ruim', error)
                    return reply('deu ruim')
                }
            },
            config: {
                tags: ['api'],
                description: 'Atualiza um herói',
                notes: 'Deve enviar o id do herói e, opcionalmente, nome, poder e idade',
                validate: {
                    payload: {
                        nome: Joi.string().max(100).min(5),
                        poder: Joi.string().max(100).min(3),
                        idade: Joi.number().max(150).min(18)
                    },
                    params: {
                        id: Joi.string().required()
                    }
                }
            }
        }
    ])

    await app.start()
    console.log('API rodando!!');
    
};

run(app)