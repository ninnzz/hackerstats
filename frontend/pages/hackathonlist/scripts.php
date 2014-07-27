<script type="text/html" id="hackathonTpl">
	<div class="hackathon-container clearfix" onClick="openHackathonDetails('{{_ID}}'); return false;">
		<img class="image" src="{{IMAGE}}" />
		<span class="date">{{DURATION}}</span>
		<span onClick="openHackathon('{{_ID}}', event); return false;" class="participants">{{TOTAL_TEAMS}} teams participated</span>
		<div class="details-button"> <a href="#"><i class="fa fa-external-link"></i></a> </div>
	</div>
</script>
<script type="text/javascript">
	$.get('/dummyjs/hackathons.json', function(e) {
		hackathons = e.value;
		var hackathonhtml = "";
		var hackathonsTemplate = $('#hackathonTpl').html();
		hackathons.forEach(function(e) {
			var start = moment(e.start_date*1000).format('MMMM DD, YYYY');
			var end = start.split(',');
			end[0]+='-'+moment(e.end_date*1000).format("DD");
			e.duration = end.join(',');
			hackathonhtml += template(hackathonsTemplate, e);
		});

		$('#hackathonlist .hackerstat-body-content').html(hackathonhtml);
	}, 'json');
</script>