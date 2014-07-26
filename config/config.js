var path = require('path'),
	config = {
		testing : {
		},
		development : {
			env : 'development',
			port : 8000,
			upload_dir : path.normalize(__dirname + '/../uploads/'),
			logs_dir : path.normalize(__dirname + '/../logs/'),
			temp_dir : path.normalize(__dirname + '/../temp'),
			frontend_server_url : '*',
			frontend_server_register_callback : '/auth/register/callback',
			frontend_server_channel_callback : '/auth/channel/callback',
			auth_server : {
				host : '192.168.0.10',
				port : 3000
			},
			google_api_key : 'AIzaSyDqWOahd3OSYfctw5pTTcNjQjjfD3QC-s4',
			cookie_secret : 'c38b1c9ac1c2f9d442f17bb2b77d1a075b617715',
			app_id : '665f627007666750b092f6a68396ed76',
			app_secret : '704a857f886341eb7980a899b18a2687',
			basic_scopes : [
				'web.view',
				'mobile.view',
				'self.view',
				'self.edit',
				'self.delete'
			],
			valid_sources : [
				'google',
				'self'
			],
			google_auth : {
				client_id 		: '24383833659-b01c43an5ppdu347io4tdfuihc1q6q91.apps.googleusercontent.com',
				client_secret 	: 'CRUTm9nhLbv8p8RPY3qkNJky',
				callback_URL 	: 'http://api.freedom.tm:8000/auth/callback'
			},
			db_freedom : {
				host : '192.168.0.10',
				user : 'root',
				password : '',
				database : 'freedom'
			},
			db_earnings : {
				host : '192.168.0.10',
				user : 'root',
				password : '',
				database : 'earnings_report'
			},
			db_mongo : {
				host : 'localhost',
				port : 27017,
				name : 'hackerstat'
			}
		},
		staging : {
		},
		production : {
		}
	};


// set development as default environment
!process.env['NODE_ENV'] && (process.env['NODE_ENV'] = 'development');
config = config[process.env['NODE_ENV']];

module.exports = config;
