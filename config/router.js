var loc			= __dirname + '/../controllers/',
	user 		= require(loc + 'user'),
	admin 		= require(loc + 'admin'),
	channel 	= require(loc + 'channel'),
	network 	= require(loc + 'network'),
	earnings 	= require(loc + 'earnings'),
	prospect 	= require(loc + 'prospect'),
	applicant 	= require(loc + 'applicant'),
	payments 	= require(loc + 'payments');

module.exports	= function (router, logger) {

	router.del 	= router.delete;


	router.all('*', function (req, res, next) {
		logger.log('debug', '--REQUEST BODY--', req.body);
		logger.log('debug', '--REQUEST QUERY--', req.query);
		next();
	});


	router.get ('/auth',		user.auth_github);
	router.get ('/auth/redirect',		user.auth_github_callback);
	router.get ('/user/:id?', 	user.get_user);
	router.get ('/logout', 		user.logout);
	router.put ('/user', 		user.update_user);
	

	router.all('*', function (req, res) {
		res.send(404, {message : 'Nothing to do here.'});
	});

	return router;
};

