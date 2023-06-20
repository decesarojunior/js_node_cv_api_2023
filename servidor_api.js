var express = require('express'); // requisita a biblioteca para a criacao dos serviços web.
var pg = require("pg"); // requisita a biblioteca pg para a comunicacao com o banco de dados.

var sw = express(); // iniciliaza uma variavel chamada app que possitilitará a criação dos serviços e rotas.
sw.use(express.json());//padrao de mensagens em json.

//permitir o recebimento de qualquer origem, aceitar informações no cabeçalho e 
//permitir o métodos get e post
sw.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
});

const config = {
    host: 'localhost',
    user: 'postgres',
    database: 'db_cv_prog3_2023',
    password: '123456',
    port: 5432
};

//defina conexao com o banco de dados.
const postgres = new pg.Pool(config);

//definicao do primeiro serviço web.
sw.get('/', (req, res) => {
    res.send('Hello, world! meu primeiro teste.  #####');
})

sw.post('/insertespecie', function (req, res, next) {
    
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Nao conseguiu acessar o  BD "+ err);
           res.status(400).send('{'+err+'}');
       }else{            
            
            var q ={
                text: 'insert into tb_especie (id, nome) values (nextval(\'seq_especie_id\'), $1) returning id, nome;',
                values: [req.body.nome]
            }
            console.log(q);
    
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log('retornou 400 pelo insertespecie');
                    //console.log(err);
                    //console.log(err.data);
                    res.status(400).send('{'+err+'}');
                }else{

                    console.log('retornou 201 no insertespecie');
                    //res.status(201).send(result.rows[0]);//se não realizar o send nao finaliza o client

                    res.status(201).send({"id":  result.rows[0].id,
                                          "nome": req.body.nome
                                           })

                }           
            });
       }       
    });
});

sw.get('/listespecie', function (req, res) {

    //estabelece uma conexao com o bd.
    postgres.connect(function(err,client,done) {

       if(err){

           console.log("Não conseguiu acessar o BD :"+ err);
           res.status(400).send('{'+err+'}');
       }else{
        client.query('select id, nome from tb_especie order by id asc;',function(err,result) {        
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send(result.rows);
                }
                
            });
       } 
    });
});

sw.get('/deleteespecie/:id', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o banco de dados"+ err);
            res.status(400).send('{'+err+'}');
        }else{
            
            var q ={
                text: 'delete FROM tb_especie where id = $1',
                values: [req.params.id]
            }
    
            client.query( q , function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log(err);
                    res.status(400).send('{'+err+'}');
                }else{
                    res.status(200).send({'id': req.params.id});//retorna o nickname deletado.
                }

            });
        } 
     });
});

sw.post('/updateespecie/', (req, res) => {

    postgres.connect(function(err,client,done) {
        if(err){
            console.log("Não conseguiu acessar o BD: "+ err);
            res.status(400).send('{'+err+'}');
        }else{
            var q ={
                //update tb_modo set nome = '', quantboots = 0, quantrounds = 0 where codigo = 1;
                text: 'update tb_especie set nome = $1 where id = $2 returning id, nome',
                values: [req.body.nome, req.body.id]
            }
            console.log(q);     
            client.query(q,function(err,result) {
                done(); // closing the connection;
                if(err){
                    console.log("Erro no update Especie: "+err);
                    res.status(400).send('{'+err+'}');
                }else{             
                    res.status(200).send({"id":  req.body.id,
                    "nome": req.body.nome                 
                     });//se não realizar o send nao finaliza o client nao finaliza
                }
            });
        }
     });
});

//iniciar o processo de escuta na porta 4000.
sw.listen(4000, function () {
    console.log('Server is running.. on Port 4000');
});
















