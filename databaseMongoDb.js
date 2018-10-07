//O mongo DB é um banco que funciona inteiramente com JS para criar "tabelas", "registros".
//Tudo é manipulado a partir de comandos JS
//Cada registro é um objeto JS
//O mongoDB cria automaticamente o Database se ele não existir
//Caso tentar criar um registro em uma tabela que não existe ele irá criar a tabela e inserir as infos

//Para listar os BDs disponíveis: show database

//Para entrar no contexto de um database: use nomeDatabase

//Para criar um registro e criar uma collection: db.nomeCollection.insert

//O MongoDB é constituido por dois processos: 
// mongod -> o servidor rodando em background
// mongo -> de fato para entrare manipular o servidor

//Para listar nossos registros: db.nomeCollection.find()
//db.personagem.find({name: 'Aladin'})
//db.personagem.find({}, {name: 1, _id: 0})
//db.personagem.find({}, {_id: 0}).sort({name: 1})
//db.personagem.find({}, {_id: 0}).sort({name: -1})
/*
    db.personagem.find({
        $or: [
            {name: 'P109aew'},
            {_id : ObjectId("5bb0d4fa68ee406b32e1cea3")},
        ]
    }, {_id: 0}).sort({name: -1})
*/
/*
    for(let i=0; i<=1000; i++) {
        db.personagem.insert({name: 'P'+i+'aew'})
    }
*/


//Para listar as collections: show collections

//Para remover um item: db.personagem.remove({}) //remove tudo
//Para remover um item: db.personagem.remove({name: "P10aew"}) //remove especifico

//Para remover um item: db.personagem.count({})
/*
    let name = 'P11aew'
    let _id : ObjectId("5bb0d4fa68ee406b32e1cea4")

    db.personagem.update({name: name}, {poder: 'Anel'})
    db.personagem.find({name: name})
    db.personagem.find({"_id" : _id})

    db.personagem.update({name: 'P12aew'}, {$set: {poder: 'Anel'}}) //da update no primeiro que achar
    db.personagem.update({name: 'P12aew'}, {$set: {poder: 'Anel'}}, {multi: 1}) //da update em todos que achar

    db.personagem.find().pretty //mostra bunitinho
*/

//o mongodb permite fazer CAGADA!
//Precisamos falar explicitamente o que ele deve fazer 
//para que não tenhamos problemas na aplicação instalamos uma biblioteca para validar e conectar no BD
//npm install mongoose

const Mongoose = require('mongoose')

//importamos o modelo de validação
const Schema = require('mongoose').Schema

// async function main() {
//     const inserir = await model.create({
//         nome: 'SuperMan',
//         poder: 'Superforça',
//         idade: 1000,
//     })
//     console.log('resultado', inserir)
//     console.log( await model.find() );
// }
// main()

class DatabaseMongoDB {
    connect(){
        Mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
        const connection = Mongoose.connection
        connection.once('open', () => console.log('db rodando!!'))
        
        const heroiSchema = new Schema({
            nome: {
                type: String,
                required: true
            },
            poder: {
                type: String,
                required: true
            },
            idade: {
                type: Number,
                required: true
            },
            inseridoEm: {
                type: Date,
                default: new Date()
            }
        })
        
        //por padrão o CERTO é a coleção ser em plural, mas caso desejar definir um nomepara coleção é só inserir no terceiro parametro
        const model = Mongoose.model('personagem', heroiSchema, 'personagem')

        this.personagem = model;
    }

    async cadastrar(item) {
        const resultado = await this.personagem.create(item)
        return resultado;
    }

    //no js podemos passar parametros default
    //caso o cliente não passar nenhum parametro irá usar estes para fazer a requisição
    async listar(filtro = {}, limite = 10, ignore = 0) {

        const resultado = await this.personagem
            .find(filtro, {__v: 0})
            .limit(limite) //limitamos a quantidade de registros
            .skip(ignore) //ignoramos uma quantidade de registros para buscar após aquela quantidade

        return resultado;
    }

    async remover(filtro) {
        const removerResultado = await this.personagem.deleteOne(filtro)
        // if(removerResultado.n === 1) return true;
        // return false;
        // 1 == true
        // 0 == false
        return !!removerResultado.n //!! -> cast para boolean
    }

    async atualizar(id, item) {
        const resultado = await this.personagem.updateOne({ _id: id }, {
            $set: item
        })

        return !!resultado.nModified
    }
}

module.exports = new DatabaseMongoDB()

// async function main () {
//     const database = new DatabaseMongoDB()
//     database.connect()

//     const insertItem = await database.cadastrar({
//         nome: 'Flash',
//         poder: 'velocidade',
//         idade: 20
//     })
//     console.log('insertItem', insertItem);
    
//     const resultadoAtualizar = await database.atualizar(insertItem._id, {
//         nome: 'Batman',
//         poder: 'Dinheiro'
//     })
    
//     console.log(await database.listar({nome: 'Batman'}, 5));
//     const resultadoRemover = await database.remover({_id: insertItem._id})
//     console.log('resultadoRemover', resultadoRemover);

//     console.log('resultadoAtualizar', resultadoAtualizar);

// }
// main()