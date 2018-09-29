// instalamos um módulo chamado commander para manipulas ferramentas de linha de comando 
// para instalar o pacote no node.js utilizamos o Node Package Manager (npm)
// npm install commander
//impostamos o commander
const Commander = require('commander')
// para importar funções ou módulos que estão na minha pasta usamos o ./
// para importar módulos que são instalados usamos somente o nome do módulo (que vai procurar na )
const Database = require('./database')

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
        const database = new Database()
        /**
            node cli.js --cadastrar \
            --nome "Lanterna Verde" \
            --idade 23 \
            --poder Anel
        */
        if(Commander.cadastrar) {
            heroi.id = Date.now()
            await database.cadastrar(heroi)
            console.log('Herói cadastrado com sucesso');
            return;
        }

        /**
            node cli.js --listar
        */
        if(Commander.listar) {
            const resultado = await database.listar()
            console.log(resultado);
            return;
        }

        /**
            node cli.js --remover --id 2
        */
        if(Commander.remover) {
            const id = parseInt(Commander.id)
            await database.remover(id)
            console.log('item removido com sucesso!');
            return;
        }

        /**
            node cli.js --atualizar --id 1538241129901 --nome "O Miranha"
        */
        if(Commander.atualizar) {
            const id = parseInt(Commander.id)
            await database.atualizar(id, heroi.nome)
            console.log('item atualizado com sucesso!');
            return;
        }
    }
    catch (erro) {
        console.log('deu erro', erro);
    }
})()