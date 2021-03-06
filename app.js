var express = require('express');

var app = express();

var port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', function(req, res) {
    res.send('hello world');
});

app.listen(port, function(err) {
    console.log('running server on port ' + port);
});
