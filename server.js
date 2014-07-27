var express	= require('express'),
    config	= require(__dirname + '/config/config'),
    logger	= require(__dirname + '/lib/logger'),
    app		= express();

logger.log('info', 'Initializing FREEDOM! Backend on', process.env['NODE_ENV'], 'mode');

app.disable('x-powered-by');

logger.log('verbose', 'Binding external middlewares');
app.use(require('morgan')({format : 'dev', immediate : true}));
app.use(require('morgan')({format : 'dev'}));

app.use(express.static(__dirname + '/frontend'));

app.use(require('method-override')());
app.use(require('body-parser')({uploadDir : config.temp_dir}));
app.use(require('connect-busboy')());
app.use(require('cookie-parser')(config.cookie_secret));
app.use(require('response-time')());
app.use(require('compression')());

logger.log('verbose', 'Binding custom middlewares');
app.use(require(__dirname + '/lib/cors')(config.frontend_server_url));
app.use(require(__dirname + '/config/router')(express.Router(), logger));
app.use(require(__dirname + '/lib/error_handler')());

app.listen(config.port);
logger.log('info', 'Server listening on port', config.port);

module.exports = app;
