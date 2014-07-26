/**
	AS - Auth Server Library
	@description
		If access token exists on cookies,
		automatically get information from
		authentication server then pass it to
		next middleware. Data accessible via
			req.user
	@author Raven Lagrimas
*/

var as_helper	= require(__dirname + '/../helpers/auth_server'),
	config		= require(__dirname + '/../config/config'),
	logger		= require(__dirname + '/../lib/logger'),
	mysql		= require(__dirname + '/../lib/mysql');

module.exports = function () {
	return function (req, res, next) {
		var access_token = req.headers['x-access-token'] || req.query.access_token,
			temp,

			start = function () {
				if (req.query.state) {
					temp = req.query.state.split('|');
					if (temp.length === 2 && temp[1].length === 64) {
						access_token = temp[1];
					}
				}

				if (access_token) {
					logger.log('verbose', 'Found access token');
					as_helper.get_info({
						access_token : access_token,
						self : true
					}, set_user);
				}
				else {
					logger.log('verbose', 'Access token not found continuing to next');
					next();
				}
			},

			set_user = function (err, user) {
				if (err) {
					logger.log('warn', 'Unable to get information from access token');
					return next(err);
				}

				req.user 			= user;
				req.user_id 		= user._id;
				req.user_data		= user.app_data;
				req.is_admin 		= user.app_data.admin;
				req.is_system_admin	= user.is_system_admin;
				req.access_token 	= access_token;

				logger.log('verbose', 'User ID\t:', req.user_id);
				logger.log('verbose', 'Access Token\t:', req.access_token);
				logger.log('verbose', 'Data\t\t:',req.user_data);

	            if (~req.user_data.roles.indexOf('network')) {
	                logger.log('verbose', 'Network role found, getting info from db');
	                mysql.open(config.db_freedom)
	                    .query(
                    		'SELECT * FROM network WHERE owner_id = ?',
                    		[req.user_id],
                    		call_next
                		)
	                    .end();
	            }
	            else {
					next();
	            }
			},

			call_next = function (err, result) {
				if (err) {
					logger.log('warn', 'Error in getting network information')
					return next(err);
				}

				req.user.network = result[0];

				next();
			};

		start();
	};
};
