const path = require('path'),
    express = require('express'),
    twig = require('twig'),
    bodyParser = require('body-parser'),
    site = require('./routes/site');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ extended: true }));

app.get('', site.index);
app.get('/config', site.config);
app.post('/webhook', site.webhook);

app.listen(3003);