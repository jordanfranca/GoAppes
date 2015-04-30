// Modulos
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , mongo = require('mongodb')
  , request = require('request');
 
//Server
server.listen(3000, function(){
  console.log("Servidor iniciado...");
});
 
//Arquivo inicial
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

//Busca de Produtos + Banco
io.sockets.on('connection', function (socket) {
  socket.on('buscarProdutos', function (data) {
  	var categoria = data.categoria;
  	request({
	  uri: "http://127.0.0.1/teste.php?tipo="+categoria,
	  method: "GET"
	}, function(error, response, json) {
		//Gravar no banco de dados
		db.open(function(err, client){
			//Transformar em JSON
			var produtos = JSON.parse(json);
			//console.log(client);
			client.createCollection("produtos", function(err, col) {
				client.collection("produtos", function(err, col) {
					for(var i = 0; i < produtos.produto.length; i++) {
			        	col.insert({"nome": produtos.produto[i].nome, preco : produtos.produto[i].preco, quantidade : produtos.produto[i].quantidade}, function(){
							console.log("Produto inserido");
						});
					}
				})
			})
		});

		//Retornar para produtos para o cliente
		socket.emit('retornaProdutos', json);
	});
  	});
});

//Conexão com o banco de dados
var db = new mongo.Db('mongo', new mongo.Server('localhost',27017, {safe: true}), {});


