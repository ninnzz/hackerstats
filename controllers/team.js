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


exports.auth_github = function (req, res, next) {
 
    logger.log('info', 'Redirecting to github for authentication');
    res.redirect( github_redirect_url + '?' +
        'client_id=' + github_client_id +
        '&redirect_uri=' + 
        '&scope=user,public_repo' +
        '&state=' + github_state
    );
};


exports.add_team_to_hackathon = function (req, res, next) {
    var data = util.get_data(['hackathon_id', 'user_ids', 'app_name', 'tech_stack', 'team_name', 'project_link'], [], req.body),
        access_token = '',
        token_type = '',
        github_userinfo,
        hackathon_info,
        team_info = {},
        scps = [],
        user_ids = [],
        user_info = {};
        get_team_member_info = function () {
            
            (data.user_ids.split(',')).forEach(function (sc) {
                scps.push( { _id : ( sc.trim() * 1 ) } );
            });

            mongo.collection('user')
            .find(  { $or: scps } )
            .toArray(get_hackathon_info);
        },
        get_hackathon_info = function (err, _data) {
            if (err) {
                return next(err);
            }

            if( _data.length === 0 ) {
                return next('Cannot find atleast one user');
            }
            user_info = _data;
            mongo.collection('hackathon')
            .find( {_id : data.hackathon_id} )
            .toArray(process_team_info);

        },
        process_team_info = function (err, _data) {
            if (err) {
                return next(err);
            }
            if (_data.length !== 1) {
                return next('We cannot find that event in our database');
            }
            hackathon_info = _data[0];

            user_info.forEach(function (usr) {
                user_ids.push(usr._id);
            });

            mongo.collection('teams')
            .find( {members : { $all : user_ids }} )
            .toArray(check_if_new_teams);
        },
        check_if_new_teams = function (err, _data) {
            var evt = {};
            if (err) {
                return next(err);
            }

            evt.hackathon_id    = hackathon_info._id;
            evt.app_name        = data.app_name;
            evt.tech_stack      = data.tech_stack;
            evt.team_name       = data.team_name;
            evt.project_link    = data.project_link;
            evt.points          = 1;

            if (req.body.awards) {
                for(var i in hackathon_info.awards) {
                    if (hackathon_info.awards[i].code === req.body.awards) {
                        if (hackathon_info.awards[i].type === 1) {
                           evt.points = parseInt(( ( hackathon_info.total_teams - ackathon_info.awards[i].rank ) / hackathon_info.total_teams ) * 10 );
                        } else {
                           evt.points = parseInt(( ( hackathon_info.total_teams - 1 ) / hackathon_info.total_teams ) * 9 );
                        }
                    }
                }
            } 

            if (_data.length === 0) {
                //new team, insert
                team_info.hackathons = [];
                team_info.members   = user_ids;
                team_info.total_points = evt.points;
                team_info.hackathons.push(evt);

                console.log(team_info);

            } else {
                //old team, update

            }

        };

    console.log('======DATA=========');
    console.log(data);
    if (typeof data === 'string') {
        return next(data);
    }
   
    get_team_member_info();
};


exports.get_user = function (req, res, next) {
    var data = util.get_data(['id'], [], req.query),
        scps = [],
        sort = {},
        limit = 50,
        skip = 0,
        start = function () {
            logger.log('info', 'Someone is getting user information');

            
            logger.log('verbose', 'Found id from url');
            console.log(data.id);
            (data.id.split(',')).forEach(function (sc) {
                scps.push( { _id : ( sc.trim() * 1 ) } );
            });

            req.query.highest_points && (sort.total_points = -1);
            req.query.most_badge     && (sort.badge_own = -1);
            req.query.most_hackathon && (sort.hackathons_joined = -1);
            req.query.most_win       && (sort.hackathons_won = -1);
            req.query.limit          && (limit = req.query.limit * 1);
            req.query.skip           && (skip = req.query.skip * 1);
        

            mongo.collection('user')
            .find(  { $or: scps },
                    { github_access_token : 0}
                )
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray(function (err, _data) {
                if (err) return next(err);
               res.send(_data);
            });
           
        };

    if (typeof data === 'string') {
        return next(data);
    } 

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
