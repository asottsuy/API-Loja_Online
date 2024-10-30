//Nodemon ==> uma ferramenta que reinicia o servidor automaticamente
//Knex ==> Serve para acessar o banco de dados mySQL
//Restify ==> Framework para trabalhar com REST
// restify-errors ==> auxilia o retorno de erros

const restify = require('restify'); //importando modulos
const errors = require('restify-errors');

const servidor = restify.createServer({ //criando servidor
    name: 'Loja do Imortal tricolor',
    version: '1.0.0'
});

//adicionando plugins
servidor.use(restify.plugins.acceptParser(servidor.acceptable));// garante que o cliente receba a resposta no formate json ou xml
servidor.use(restify.plugins.queryParser());// transforma strings de consulta na URL em objetos JS
servidor.use(restify.plugins.bodyParser());// analisa o corpo das requisições (especialmente em métodos como POST e PUT) e transforma-o em um objeto JavaScript, acessível através de req.body.

servidor.listen(8001, function () { //inicia o servidor na porta 8001
    console.log("%s  executando em %s", servidor.name, servidor.url); //funcao de callback
})

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bd_dsapi'
    }
}); 

servidor.post('/clientes', (req, res, next) => { //cadastro de cliente
    const { nome, altura, nascimento, cidade_id } = req.body;

    knex('clientes').insert({ //inserindo os dados no banco
        nome,
        altura,
        nascimento,
        cidade_id
    })
        .then(([id]) => { //insere os dados na coluna do id do cliente
            res.send(201, { id, nome, altura, nascimento, cidade_id });
            return next();
        }) // o next e uma funcao que passa o controle para o proximo middleware(res, req, next)

        .catch(error => {
            console.error(error);
            res.send(500, { error: 'Erro ao cadastrar cliente' });
            return next(error);
        });
});

servidor.get('/produtos', (req, res, next) => {//consulta de produtos disponiveis
    knex("produtos").then((dados) => {
        if (dados.length === 0) {
            return res.status(404).json({ error: 'Nenhum produto encontrado' });
        }
        res.send(dados)
    }, next)
        .catch(error => {
            console.error(error);
            res.send(500, { error: 'Erro ao procurar produtos' });
            return next(error);
        });
});

servidor.post('/produtos', (req, res, next) => {//inserir produtos
    const { nome, preco, quantidade, categoria_id } = req.body;

    knex("produtos").insert({
        nome,
        preco,
        quantidade,
        categoria_id
    })
        .then(([id]) => {
            res.send(201, { id, nome, preco, quantidade, categoria_id });
            return next();
        })
        .catch(error => {
            console.error(error);
            res.send(500, { error: 'Erro ao cadastrar produto' });
            return next(error);
        });
});

servidor.del('/produtos/:idProd', (req, res, next) => { //deletar produtos
    const id = req.params.idProd
    knex("produtos")
        .where("id", id)
        .delete()
        .then((dados) => {
            if (!dados) {
                return res.status(404).json({ error: 'Nenhum produto encontrado' });
            }
            res.send(201, ("Produto excluido com sucesso"));
        }, next)
        .catch(error => {
            console.error(error);
            res.send(500, { error: 'Erro ao excluir produto' });
            return next(error);
        })
});
