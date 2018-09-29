// importamos o modulo para manipulação de arquivosdo nodejs
const fs = require('fs')
const util = require('util')

// convertemos o método de escrita de arquivos de cb para promise
const writeFileAsync = util.promisify(fs.writeFile)
const readFileAsync = util.promisify(fs.readFile)

// dependendo de onde seu código é executado a pasta do arquivo pode dar problema
// para resolver, informamos o caminho completo corrente
const path = require('path')

class Database {
    constructor() {
        // informamos o caminho completo do arquivo
        this.NOME_ARQUIVO = path.join(__dirname, 'herois.json')
    }

    async obterDados() {
        const dados = await readFileAsync(this.NOME_ARQUIVO)
        // convertemos a string do arquivo para um formato de objeto js
        return JSON.parse(dados.toString());
    }

    async cadastrar(heroi) {
        const dados = await this.obterDados()
        dados.push(heroi)
        // transformamos os dadosem string novamente
        await writeFileAsync(this.NOME_ARQUIVO, JSON.stringify(dados))

    }

    async listar() {
        const dados = await this.obterDados()
        return dados;
    }

    async remover(id) {
        const dados = await this.obterDados()
        // usamos a função nativa do JS para filtrar itens deuma lista.
        // para cada item da lista chamará uma função e retornará uma nova lista, bastada nas respostas com TRUE

        // existem duas formas de mandar uma função para executar
        // podemos chamar function nomeFuncao () {} ou podemos passarum parametro seguido do => para simular o corpo

        // retiramos todos que tenham aquele mesmo id
        const dadosFiltrados = dados.filter(item => item.id !== id)
        await writeFileAsync(this.NOME_ARQUIVO, JSON.stringify(dadosFiltrados))
    }

    async atualizar(id, nome) {
        const dados = await this.obterDados()

        // Para iterar em um array eretornar este mesmo array modificado usamos a função map do Array
        const dadosMapeados = dados.map(item => {
            if (item.id !== id){
                return item;
            }

            item.nome = nome;
            return item;
        })

        await writeFileAsync(this.NOME_ARQUIVO, JSON.stringify(dadosMapeados))
    }
}
// para usar o contexto de async/await sem precisar adicionaro .then usamos uma função que se auto executa.
// Na prática é a mesma função MAIN com uma sintaxe diferente

// ; (async function main() {
//     const database = new Database()
//     await database.cadastrar({ nome: 'Aladin2', id: 1 })
//     await database.cadastrar({ nome: 'Lanterna Verde', id: 2 })
//     await database.remover(1)
//     await database.atualizar(2, 'Batman')

//     const dados = await database.listar()
//     console.log('dados', dados);

// })()


//exportamos nossa classe
module.exports = Database;