<script src="//code.jquery.com/jquery-1.11.1.min.js"></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
<script src="//momentjs.com/downloads/moment.js"></script>
<script src="//cdn.jsdelivr.net/isotope/2.0.0/jquery.isotope.js"></script>
<script type="text/javascript">
	var hackathons = [];

	var template = function(templateHTML, data) {
		for(var x in data) {
			templateHTML = templateHTML.replace(new RegExp('{{'+x+'}}', 'ig'), data[x]);
		}

		return templateHTML;
	};

	var showTeams = function(e) {
		$('.hackerstat-body').fadeOut().promise().done(function(e) {
				$('#teams').fadeIn().promise().done(function(e) {
					
				});
			});
	};

	var showHackers = function(e) {
		$('.hackerstat-body').fadeOut().promise().done(function(e) {
				$('#hackers').fadeIn().promise().done(function(e) {
					
				});
			});
	}

	var openHackathonDetails = function(id) {
		var hackathon;
		if(hackathon = getHackathon(id)) {
			$('.hackerstat-body').fadeOut().promise().done(function(e) {
				$('#hackathondetails').fadeIn().promise().done(function(e) {
					
				});
			});
			
			$.get('/dummyjs/hackathonteams.json', function(e) {
				var teams = e.value;
				var users = [];
				e.value.forEach(function(f) {
					users = [];
					f.hackers.forEach(function(e) {
						users.push(e.id);
					});
					users = users.join(',');
					$.get('/dummyjs/users.json?users='+users, function(e) {
					});
				});
			}, 'json');
		}

		return false;
	};

	var showUser = function(id) {
		$('.hackerstat-body').fadeOut().promise().done(function(e) {
				$('#individual-profile').fadeIn().promise().done(function(e) {
					
				});
			});
	};

	var showTeam = function(id) {
		$('.hackerstat-body').fadeOut().promise().done(function(e) {
				$('#team-profile').fadeIn().promise().done(function(e) {
					
				});
			});
	}

	var openHackathon = function(id, event) {
		var hackathon;
		if(hackathon = getHackathon(id)) {
			$('.hackerstat-body').fadeOut().promise().done(function(e) {
				$('#hackathonpage').fadeIn().promise().done(function(e) {
					$('#hackathonpage .hackerstat-body-content')
						.isotope({itemSelector: '.hackathon-team-container', layoutMode: 'masonry'});
				});
			});
			
			$.get('/dummyjs/hackathonteams.json', function(e) {
				var teams = e.value;
				var users = [];
				e.value.forEach(function(f) {
					users = [];
					f.hackers.forEach(function(e) {
						users.push(e.id);
					});
					users = users.join(',');
					$.get('/dummyjs/users.json?users='+users, function(e) {
					});
				});
			}, 'json');
		}

		event = event || window.event;
		event.cancelBubble = true; if(event.stopPropagation) { event.stopPropagation(); }
		return false;
	};

	var getHackathon = function(id) {
		for(var i in hackathons) {
			if(hackathons[i]._id == id) return hackathons[i];
		};

		return null;
	}

	$('a.hacker').click(function(e) {
		showUser($(this).attr('data-id'));
		e.stopPropagation();
	});

	$('.team-container').click(function(e) {
		showTeam($(this).attr('data-id') ? $(this).attr('data-id') : 1);
		e.stopPropagation();
	})
</script>

<?php 
	include(__DIR__.'/../pages/hackathonlist/scripts.php');
	include(__DIR__.'/../pages/hackathonpage/scripts.php');
	include(__DIR__.'/../pages/hackathondetails/scripts.php');
	include(__DIR__.'/../pages/individual/scripts.php');
	include(__DIR__.'/../pages/teams/scripts.php');
	include(__DIR__.'/../pages/teamprofile/scripts.php');
	include(__DIR__.'/../pages/hackers/scripts.php');
?>
</body>