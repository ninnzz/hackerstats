var config = require(__dirname + '/../config/config'),
	mysql = require(__dirname + '/../lib/mysql'),
	mongo = require(__dirname + '/../lib/mongoskin'),
	util = require(__dirname + '/../helpers/util');




exports.upload_hackathon_data = function (req, res, next) {





};

exports.find_applicants = function(req, res, next){
	var find_non_approved = function (status, _data) {

		if (status.data !== 'Success') return next(_data);

		// this is still missing paging
		mongo.collection('partnership')
			.find(
				{'approver.admin.status' : false},
				{ _id : 0, channel : 1}
			)
			.toArray(check_results);
	},
	check_results = function (err, result) {
		var query = 'SELECT * FROM channel where _id in (?);',
			data = [],
			i;

		data[0] = [];

		if (err) return next(err);

		for (i in result)
			data[0].push(result[i].channel);

		mysql.open(config.db_freedom)
			.query(query, data, send_response);
	}
	send_response = function (err, result) {
		if (err) return next(err);

		if (!result.length) return next('no channels need approval');

		return res.send(result);
	};

    if (req.is_admin)
        as_helper.has_scopes(req.access_token, 'admin.view_all', find_non_approved, next);
    else
		return next('Unauthorized');
};

exports.accept_applicant = function (req, res, next) {
    var data = {},
	approvers,
	i,
    update = function (status, _data) {
		if (typeof status === 'number' && status !== 200) return next(_data);

		// fail-safe in case that status is not a STATUS CODE
		if (typeof status === 'object' && status.data !== 'Success') return next(_data);

		mongo.collection('partnership')
            .update(
                {channel : req.body.id},
                {$set : {
                            'approver.admin.status' : true
                        }
                },
                {},
                send_response
			);
    },
    send_response = function (err, countModif) {
        if (err) {
            return next(err);
        }

        if (countModif > 0)
            check_all_approvs();
        else
			return next('Admin acceptance failed');
    },
    check_all_approvs = function () {
        mongo.collection('partnership')
            .find({channel: req.body.id})
            .toArray(function (err, result) {
                if (err) return next(err);

                approvers = result[0].approver;

                // check if all status are true
                for (i in approvers) {

                    //  if one of the status are false, other approvers haven't approved yet
                    if (!approvers[i].status) {
                        return res.send(200, {message: 'admin'});
                    }
                }

                // all approvers have status  === true, now update SQL database;
                mysql.open(config.db_freedom)
                    .query('UPDATE channel SET partnership_status = 1, updated_at = ? where _id = ? LIMIT 1', [+new Date, req.body.id], function (err, result) {
                        if (err) return next(err);

                        res.send(200, {message: 'all'});
                    })
                    .end();
            });
    };

    if (req.is_admin)
        as_helper.has_scopes(req.access_token, 'admin.create_all', update, next);
    else
		return next('Unauthorized');
};
