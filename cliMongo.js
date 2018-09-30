// instalamos um módulo chamado commander para manipulas ferramentas de linha de comando 
// para instalar o pacote no node.js utilizamos o Node Package Manager (npm)
// npm install commander
//impostamos o commander
const Commander = require('commander')
// para importar funções ou módulos que estão na minha pasta usamos o ./
// para importar módulos que são instalados usamos somente o nome do módulo (que vai procurar na )
const DatabaseMongoDb = require('./databaseMongoDb')

Commander
    .version('v1.0')
    .option('-c, --cadastrar', 'Cadastrar um Herói')
    .option('-l, --listar', 'Listar os Heróis')
    .option('-r, --remover', 'Remover Heróis pelo Id')
    .option('-a, --atualizar', 'Atualizar nome de um Herói pelo Id')

    .option('-m, --id [value]', 'Id do Herói')
    .option('-n, --nome [value]', 'Nome do Herói')
    .option('-i, --idade [value]', 'Idade do Herói')
    .option('-p, --poder [value]', 'Poder do Herói')
    .parse(process.argv)

    ;
(async function main(){
    try{
        const heroi = {
            nome: Commander.nome,
            idade: Commander.idade,
            poder: Commander.poder,
        }
        DatabaseMongoDb.connect()
        /**
            node cliMongo.js --cadastrar \
            --nome "Lanterna Verde" \
            --idade 23 \
            --poder Anel
        */
        if(Commander.cadastrar) {
            // heroi.id = Date.now()
            const resultado = await DatabaseMongoDb.cadastrar(heroi)

            let msg = 'Não foi possível cadastrar'
            if (!!resultado._id) msg = 'Herói cadastrado com sucesso'
            console.log(msg);
            //informamos ao sistema que o processofoi concluído com exito
            process.exit(0)
            return;
        }

        /**
            node cliMongo.js --listar
        */
        if(Commander.listar) {
            const resultado = await DatabaseMongoDb.listar()
            console.log(resultado);
            process.exit(0)
            return;
        }

        /**
            node cliMongo.js --remover --id 5bb103fbf12e323368542eea
        */
        if(Commander.remover) {
            const resultado = await DatabaseMongoDb.remover({_id: Commander.id})
            let msg = 'Não foi possível remover o item'
            if (resultado) msg = 'item removido com sucesso!'
            console.log(msg);
            process.exit(0)
            return;
        }

        /**
            node cliMongo.js --atualizar --id 5bb103fbf12e323368542eea --nome "O Miranha"
        */
        if(Commander.atualizar) {
            const heroiString = JSON.stringify(heroi)
            const heroiJson = JSON.parse(heroiString)

            const resultado = await DatabaseMongoDb.atualizar(Commander.id, heroiJson)
            let msg = 'Não foi possível atualizar o item'
            if (resultado) msg = 'item atualizado com sucesso!'
            console.log(msg);
            process.exit(0)
            return;
        }
    }
    catch (erro) {
        console.log('deu erro', erro);
    }
})()