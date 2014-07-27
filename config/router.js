var loc			= __dirname + '/../controllers/',
	user 		= require(loc + 'user'),
	hackathon 	= require(loc + 'hackathon'),
	team	 	= require(loc + 'team'),
	admin 		= require(loc + 'admin');

module.exports	= function (router, logger) {

	router.del 	= router.delete;


	router.all('*', function (req, res, next) {
		logger.log('debug', '--REQUEST BODY--', req.body);
		logger.log('debug', '--REQUEST QUERY--', req.query);
		next();
	});


	router.get ('/auth',		user.auth_github);
	router.get ('/auth/redirect',		user.auth_github_callback);
	router.get ('/user', 	user.get_user);
	router.get ('/logout', 		user.logout);
	router.put ('/user', 		user.update_user);
	
	router.get ('/hackathon', 	hackathon.get_hackathon);

	router.post ('/team/assign', 	team.add_team_to_hackathon);

	router.post ('/admin/import_hackathon', 	admin.upload_hackathon_data);
	

	router.all('*', function (req, res) {
		res.send(404, {message : 'Nothing to do here.'});
	});

	return router;
};

