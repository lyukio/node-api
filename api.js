// paralogar no heroku
// heroku login

// heroku apps

// git init -> inicializar o repositorio
// criar .gitignore com os arquivos a ignorar

// git status -> para visualizar se os arquivos estão de acordo
// git add . -> adicionar todos os arquivos da minha pasta
// git commit -m "Uma mensagem da modificação"
// git push heroku master

// para criar uma aplicação
// heroku apps:create api-herois


// Para utilizar nossa aplicação no Heroku criamos um script para ser executado em pod
// Quando o Heroku chamar nossa plaicação deverá chamar via 
// npm run deploy
// scripts pré-definidos -> start, test
// caso criar algum script diferente, deve colocar a palavra run no comando
// npm start, npm test, npm run deploy

// Para trabalhar com o Heroku, precisamos criar um arquivo de configuração
// Procfile -> responsável por falar como nossa aplicação rodará


// Fomos no mlab e criamos nossa database
// criamos nosso usuário e senha e adicionamos a string de conexãono .env.prod para rodar nossa aplicação e testar
// NODE_ENV=production nodemon api.js

// Para dividir nossos ambientes, criamos dois arquivos que serão nossos arquivos de dev e prod
// Após inserir este arquivo em nosso ambiente, conseguimos obter estes dados a partir da variável global process.env do Node.js
// Para visualizar as variáveis dos arquivos, instalamos um módulo chamado dotenv
// npm install dotenv
const { config } = require('dotenv')
if(process.env.NODE_ENV === 'production')
    config({ path: 'config/.env.prod'})
else
    config({ path: 'config/.env.dev'})

// instalamos um módulo para padronizar mensagens de erro e status HTTP
// npm i boom
const Boom = require('boom')

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

// Instalamos um módulo para cirar um token de autentificação
// Enviamos um dado BÁSICO de cliente (nunca coloquesenha)
// Nosso token poderá ser descriptografado, masnunca gerado novamente, ou alterado
// npm i jsonwebtoken hapi-auth-jwt2@7

const Jwt = require('jsonwebtoken')
const HapiJwt = require('hapi-auth-jwt2')

const Hapi = require('hapi')
const app = new Hapi.Server()
app.connection({ port: process.env.PORT })

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
        },
        HapiJwt
    ])

    // definimos uma estratégia pré-definida de autentificação
    // por padrão é sem autentificação, mas agora, todas as rotas precisarão de um token nos headres para funcionar
    app.auth.strategy('jwt', 'jwt', {
        key: process.env.JWT_KEY,
        validateFunc: (decoded, request, callback) => {
            //se quiser bloquear o cara é só mandar false
            callback(null, true)
        },
        verifyOptions: { algorithms: ['HS256']}
    })
    app.auth.default('jwt')


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
                    headers: Joi.object({
                        authorization: Joi.string().required()
                    }).unknown(),
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
                    return reply(Boom.internal())
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
                    return reply(Boom.internal())
                }
            },
            config: {
                tags: ['api'],
                description: 'Cria um novo herói',
                notes: 'Deve enviar o nome, poder e idade',
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string().required()
                    }).unknown(),
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
                    return reply(Boom.internal())
                }
            },
            config: {
                tags: ['api'],
                description: 'Exclui um herói',
                notes: 'Deve enviar o id do herói',
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string().required()
                    }).unknown(),
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
                    return reply(Boom.internal())
                }
            },
            config: {
                tags: ['api'],
                description: 'Atualiza um herói',
                notes: 'Deve enviar o id do herói e, opcionalmente, nome, poder e idade',
                validate: {
                    headers: Joi.object({
                        authorization: Joi.string().required()
                    }).unknown(),
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
        },
        {
            path: '/login',
            method: 'POST',
            handler: (request, reply) => {
                const { usuario, senha } = request.payload

                if (usuario !== process.env.USUARIO || senha !== parseInt(process.env.SENHA)) return reply(Boom.unauthorized('Não pode acessar'))
                //geramos o token de autentificação
                const token = Jwt.sign({ usuario: usuario }, process.env.JWT_KEY)
                return reply({ token }) // não é necessário escrever "token: token" quando tem o mesmo nome
            },
            config: {
                // desabilitamos a autentificação para conseguir um token
                auth: false,
                description: 'Fazer login',
                tags: ['api'],
                validate: {
                    payload: {
                        usuario: Joi.string().required(),
                        senha: Joi.number().integer().required()
                    }
                }
            }
        }
    ])

    await app.start()
    console.log(`API rodando em ${process.env.NODE_ENV || "dev"}!!`);
    
};

run(app)