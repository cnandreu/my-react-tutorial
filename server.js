var fs = require('fs'),
  path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  WebSocketServer = require('ws').Server,
  http = require('http'),
  server = http.createServer(app),
  wss = new WebSocketServer({server: server});

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/comments.json', function (req, res) {
  getComments(function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.post('/comments.json', function (req, res) {
  updateComments(req.body, function (comments) {
    var msg = JSON.stringify(comments);
    res.setHeader('Content-Type', 'application/json');
    res.send(msg);
    wss.broadcast(msg);
  });
});

function getComments (cb) {
  fs.readFile('_comments.json', function (err, data) {
    cb(data);
  });
}

function updateComments (newComment, cb) {
  fs.readFile('_comments.json', function (err, data) {
    var comments = JSON.parse(data);
    comments.push(newComment);
    fs.writeFile('_comments.json', JSON.stringify(comments, null, 4), function(err) {
      cb(comments);
    });
  });
}

wss.broadcast = function (data) {
  for (var i in this.clients) {
    this.clients[i].send(data);
  }
};

wss.on('connection', function (ws) {

    console.info('Websocket connection opened.');

    ws.on('message', function (msg, flags) {
        console.log('Websocket received a message:', msg);
    });

    ws.on('close', function () {
        console.log('Websocket connection close');
    });
});

app.listen(3000);
server.listen(3001);

console.log('Server started: http://localhost:3000/');