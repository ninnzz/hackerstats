var config         = require(__dirname + '/../config/config'),
    util           = require(__dirname + '/../helpers/util'),
    logger         = require(__dirname + '/../lib/logger'),
    mysql          = require(__dirname + '/../lib/mysql'),
    mongo           = require(__dirname + '/../lib/mongoskin'),
    curl           = require(__dirname + '/../lib/curl'),
    url            = require('url'),
    googleapis     = require('googleapis'),
	oauth2_client  = new googleapis.auth.OAuth2(
                        config.google_auth.client_id,
                        config.google_auth.client_secret,
                        config.google_auth.callback_URL
                    ),
    github_client_id    = '584246b7d1091f1b3872',
    github_client_secret    = '8bb9e671ab2f959a7db67c55f7721c7e53b462c3',
    github_redirect_url     = 'https://github.com/login/oauth/authorize',
    auth_redirect_url       = 'http://thissite.com/auth/redirect',
    github_state = 't15w1LLn0tB3guEs5@bL3';


exports.register = function (req, res, next) {
    var data = req.body;

    
};


exports.auth_github = function (req, res, next) {
 
    logger.log('info', 'Redirecting to github for authentication');
    res.redirect( github_redirect_url + '?' +
        'client_id=' + github_client_id +
        '&redirect_uri=' + 
        '&scope=user,public_repo' +
        '&state=' + github_state
    );
};


exports.auth_github_callback = function (req, res, next) {
    var data = util.get_data(['code','state'], [], req.query),
        access_token = '',
        token_type = '',
        github_userinfo,
        user_info = {};
        get_access_token = function () {
            curl.post
                .to('github.com', 443, '/login/oauth/access_token')
                .secured()
                .send({
                    client_id : github_client_id,
                    client_secret : github_client_secret,
                    code : data.code,
                    redirect_uri : ''
                })
                .then(get_email);
        },
        get_email = function (err, _data) {
            if (err) {
                console.log(err);
                return next(err);
            }

            access_token    = _data.access_token;
            token_type      = _data.token_type;

             curl.get
                .to('api.github.com', 443, '/user')
                .secured()
                .add_header('user-agent','hackerstat')
                .send({
                    access_token : access_token
                })
                .then(check_login); 
        },
        check_login = function (err, _data) {
            if (err) {
                console.log(err);
                return next(err);
            }
            github_userinfo = _data;
            mongo.collection('users')
                .findOne({_id : github_userinfo.id}, check_if_registered);
        },
        check_if_registered = function (err, _data) {
            if (err) {
                return next(err);
            }
            console.log(_data);
            if (false) {

            } else {
                //register the user
                
                user._id                    = github_userinfo.id;
                user.email                  = github_userinfo.email;
                user.name                   = github_userinfo.name;
                user.address                = github_userinfo.location;
                user.company                = github_userinfo.company;
                user.github_access_token    = access_token;
                user.avatar                 = github_userinfo.avatar_url;
                user.github                 = github_userinfo.html_url;
                user.facebook               = '';
                user.twitter                = '';

                user.hackathons_won         = 0;
                user.hackathons_joined      = 0;
                user.total_points           = 0;
                user.hackathons             = [];

                user.badge_own              = 0;
                user.badges                 = [];

                console.log(user);

                mongo.collection('user')
                .insert(user_info, done_registration);
            }
        },
        done_registration = function (err, _data) {
            if (err) {
                logger.log('warn', 'Error inserting new user');
                return next(err);
            }
            delete user.access_token;
            logger.log('info', 'Successfully added new user');    
            return res.send(user);
        };

    console.log('======DATA=========');
    console.log(data);
    if (typeof data === 'string') {
        return next(data);
    }
    if (data.state !== github_state) {
        return next('Operation not permitted');
    }
    get_access_token();
};


exports.login = function (req, res, next) {
    var data = util.get_data(['email', 'password'], [], req.body),

        start = function () {
            logger.log('info', 'Someone is logging in');

            if (typeof data === 'string') {
                logger.log('warn', 'Error in required parameters');
                return next(data);
            }

            data.source = 'self';
            data.app_id = config.app_id;

            logger.log('verbose', 'Logging in using auth server');
            curl.post
                .to(config.auth_server.host, config.auth_server.port, '/auth/login')
                .send(data)
                .then(send_response);
        },

        send_response = function (err, result) {
            if (err) {
                logger.log('warn', 'Error in logging in using auth server');
                return next(err);
            }

            logger.log('verbose', 'Success in logging in using auth server');
            res.send(result);
       };

    start();
};


exports.get_user = function (req, res, next) {
    var data,

        start = function () {
            logger.log('info', 'Someone is getting user information');

            if (!req.access_token) {
                return next('access_token is missing');
            }

            if (req.params.id) {
                logger.log('verbose', 'Found id from url');
                logger.log('verbose', 'Checking user.view scope');
                as_helper.has_scopes(req.access_token, 'user.view', get_info);
            }
            else {
                res.send(req.user);
            }
        },

        get_info = function (err) {
            var datum = {
                access_token : req.access_token,
                self : true
            };

            if (err) {
                logger.log('warn', 'Error in checking scope');
                return next(err);
            }

            if (req.params.id) {
                datum.self = false;
                datum.user_id = req.params.id;
            }

            logger.log('verbose', 'Getting user info using auth server');
            as_helper.get_info(datum, get_network);
        },

        get_network = function (err, result) {
            if (err) {
                logger.log('warn', 'Error in getting info from auth server');
                return next(err);
            }

            data = result;

            logger.log('verbose', 'Checking for a network role');

            if (~result.app_data.roles.indexOf('network')) {
                logger.log('verbose', 'db_freedom role found, getting info from db');
                mysql.open(config.db_freedom)
                    .query(
                        'SELECT * FROM network WHERE owner_id = ? LIMIT 1;',
                        [result._id],
                        send_response
                    )
                    .end();
            }
            else {
                logger.log('verbose', 'Network role not found');
                logger.log('info', 'Succesful getting user info');
                res.send(result);
            }
       },

       send_response = function (err, result) {
            if (err) {
                logger.log('warn', 'Error in getting network info from db');
                return next(err);
            }


            logger.log('info', 'Successful getting user info');

            data.network = result;
            res.send(data);
       };

   start();
};


exports.update_user = function (req, res, next) {
    var data = req.body,

        start = function () {
            logger.log('info', 'Someone is updating profile');

            data.access_token = req.access_token;

            if (!req.access_token) {
                return next('access_token is missing');
            }

            logger.log('verbose', 'Checking for self.edit scope');
            as_helper.has_scopes(req.access_token, 'self.edit', update);
        },

        update = function (err) {
            if (err) {
                logger.log('warn', 'Error in checking for self.edit scope');
                return next(err);
            }

            logger.log('verbose', 'Updating using auth server');
            curl.put
                .to(config.auth_server.host, config.auth_server.port, '/user')
                .send(data)
                .then(send_response);
        },

        send_response = function (err, result) {
            if (err) {
                logger.log('warn', 'Error in updating using auth server');
                return next(err);
            }

            logger.log('info', 'User successfully updated');
            res.send(result);
        };

    start();
};


exports.logout = function (req, res, next) {
    var start = function () {
            logger.log('info', 'Someone is logging out');

            if (!req.access_token) {
                return next('access_token is missing');
            }

            logger.log('verbose', 'Checking self.logout scope');
            as_helper.has_scopes(req.access_token, 'self.logout', logout);
        },

        logout = function (err) {
            if (err) {
                logger.log('warn', 'Error checking self.logout scope');
                return next(err);
            }

            logger.log('verbose', 'Logging out using auth server');
            as_helper.logout({
                access_token : req.access_token,
                app_id : config.app_id
            }, send_response);
        },

        send_response = function (err) {
            if (err) {
                logger.log('warn', 'Error logging out using auth server');
                return next(err);
            }

            logger.log('info', 'Logout successful');
            res.send({message : 'Logout successful'});
        };

    start();
};


exports.accept_partnership_contract = function (req, res, next) {
    var start = function () {
            logger.log('info', 'Someone wants to be a partner');

            if (!req.access_token) {
                return next('access_token is missing');
            }

            if (~req.user_data.roles.indexOf('partner')) {
                return next('User is already a partner');
            }

            logger.log('verbose', 'Adding partner scopes to user');
            as_helper.add_self_scopes({
                access_token : req.access_token,
                user_id : req.user_id,
                scopes : config.scopes.partner
            }, update_app_data);
        },

        update_app_data = function (err) {
            if (err) {
                logger.log('warn', 'Error adding partner scopes to user');
                return next(err);
            }

            req.user_data.roles.push('partner');

            logger.log('verbose', 'Updating user app data');
            as_helper.update_app_data({
                access_token : req.access_token,
                user_id : req.user_id,
                app_data : req.user_data
            }, send_response);
        },

        send_response = function (err) {
            if (err) {
                logger.log('warn', 'Error updating user app data');
                return next(err);
            }

            logger.log('info', 'Successfully accepted partnership contract');
            res.send({message : 'Partnership contract successfully accepted'});
        };

    start();
};


exports.accept_network_contract = function (req, res, next) {
    var data = util.get_data(
            [
                'name',
                'description',
                'tags',
                'banner'
            ],
            [
                'accept_email_message',
                'reject_email_message',
            ],
            req.body),

        start = function () {
            logger.log('info', 'Someone wants to be a network');

            if (typeof data === 'string') {
                return next(data);
            }

            if (!req.access_token) {
                return next('access_token is missing');
            }

            if (~req.user_data.roles.indexOf('network')) {
                return next('User is already a network');
            }

            logger.log('verbose', 'Adding network scopes to user');
            as_helper.add_self_scopes({
                access_token : req.access_token,
                user_id : req.user_id,
                scopes : config.scopes.network
            }, update_app_data);
        },

        update_app_data = function (err) {
            if (err) {
                logger.log('warn', 'Error adding network scopes to user');
                return next(err);
            }

            req.user_data.roles.push('network');

            logger.log('verbose', 'Updating user app data');
            as_helper.update_app_data({
                access_token : req.access_token,
                user_id : req.user_id,
                app_data : req.user_data
            }, create_network);
        },

        create_network = function (err) {
            if (err) {
                logger.log('warn', 'Error updating user app data');
                return next(err);
            }

            logger.log('verbose', 'Inserting network row to db');

            data.owner_id = req.user_id;
            data.email = req.user.email;

            mysql.open(config.db_freedom)
                .query('INSERT INTO network SET ?', data, send_response)
                .end();
        },

        send_response = function (err) {
            if (err) {
                logger.log('warn', 'Error inserting network row');
                return next(err);
            }

            logger.log('info', 'Successfully accepted network contract');
            res.send({message : 'Network contract successfully accepted'});
        };

    start();
};


exports.get_recruits = function (req, res, next) {
    var start = function () {
            logger.log('info', 'Someone is getting recruits');
            if (!req.access_token) {
                return next('access_token is missing');
            }

            logger.log('verbose', 'Checking for recruiter.view scope');
            as_helper.has_scopes(req.access_token, 'recruiter.view', get_users);
        },

        get_users = function (err) {
            var filter =  {'referrer' : req.user.referral_link};

            if (err) {
                logger.log('warn', 'Error in checking for recruiter.view scope');
                return next(err);
            }

            logger.log('silly', 'channels_owned', !!req.query.has_channels);
            filter['exist.app.channels_owned'] = !!req.query.has_channels;

            logger.log('verbose', 'Getting users from auth server');
            as_helper.get_users(req.access_token, filter, send_response);
        },

        send_response = function (err, result) {
            if (err) {
                logger.log('warn', 'Error getting users from auth server');
                return next(err);
            }

            logger.log('info', 'Successfully getting users from auth server');
            res.send(result);
        };

    start();
};

