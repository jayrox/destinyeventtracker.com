$.getJSON( "timers.json", function( data ) {
	$.each( data, function( key, val ) {
		var bars = [];
		var planetname = val.name;
		bar ='	<span class="bar_header">'+planetname+'</span>';
		bar+='	<div id="'+planetname.toLowerCase()+'" class="planetWrapper">';
		$.each( val.events, function( e_key, e_val ) {
			// Build time offsets and duration for timer
			d_offset = d_offset2 = 0;
			d_duration = d_duration2 = 0;
			d_type = e_val.type;

			// Hourly
			if (d_type == 1) {
				d_offset = e_val.intervals[0].start;
				d_duration = e_val.intervals[0].end - d_offset;
				if (typeof e_val.intervals[1] != 'undefined') {
					d_offset2 = e_val.intervals[1].start;
					d_duration2 = e_val.intervals[1].end - d_offset2;
				}
			}

			// Weekly
			if (d_type == 2) {
			}

			// Daily
			if (d_type == 3) {
			}

			// Create description
			bar_description = "";
			$.each( e_val.subEvents, function( se_key, se_val ) {
				bar_description += se_val + ", ";
			});

			// Build bar item
			bar_description = bar_description.substring(0, bar_description.length - 2);
			bar +='<div class="bar" data-offset="'+d_offset
			    +'" data-duration="'+d_duration
			    +'" data-offset2="'+d_offset2
			    +'" data-duration2="'+d_duration2
			    +'" data-type="'+d_type
			    +'" data-percent="">';
			bar +=' <div class="progress">';
			bar +='	 <span class="bar_location">'+e_val.name+'</span>';
			bar +='	 <span class="bar_description">'+bar_description+'</span>';
			bar +='	 <span class="bar_timer">&nbsp;</span>';
			bar +=' </div>';
			bar +='</div>';
		});
		bar +='</div></div>';

		// Push new bar to list
		bars.push( bar );

		// Push bars to ui
		$( "<div/>", {
			class: 'bar_group',
			id: val.name,
			html: bars.join( "" )
		}).appendTo( "#bar_container" );
	});
});
	
function updateAllEvents() {
	$('.bar').each(function() {
		var box = $(this);
		var countDown = box.find('.bar_timer');
		var eventOffsetData = parseInt(box.data('offset'));
		var eventDurationData = parseInt(box.data('duration'));
		var eventOffset2Data = parseInt(box.data('offset2'));
		var eventRepeatData = 3600;
		if (eventOffset2Data > eventOffsetData) {
			eventRepeatData = eventOffset2Data - eventOffsetData;
		}
		var eventDuration2Data = parseInt(box.data('duration2'));
		var eventHappening = false;

		if (eventOffsetData == 0 && eventDurationData == 0) {
			console.log("continue");
			return;
		}
		// eventStart represents the closest start time
		// get the start of the current hour
		// add when the event starts
		var eventStart = moment().startOf('hour').add(eventOffsetData, 's');
		var eventComplete = moment(eventStart);
		eventComplete.add(eventDurationData, 's');

		while(eventComplete < moment()) {
			eventStart.add(eventRepeatData, 's');
			eventComplete.add(eventRepeatData, 's');
		}

		var percent = Math.round((((60 - eventStart.diff(moment(), 'minutes')) / 60) * 100));
		console.log("percent: "+percent);

		console.log(eventStart.format('h:mm'));
		console.log(eventComplete.format('h:mm'));
		console.log('-----');

		if((eventStart < moment()) && (moment() < eventComplete)) {
			eventHappening = true;
		} else {
			eventHappening = false;
		}

		if (eventHappening) {
			countDown.html( "In progress" );
			percent = 100;
			//box remove dark, use red 
		} else {
			countDown.html( eventStart.fromNow() );
		}

		$(box).data('percent', percent);
		$(box).children(".progress").css("width", percent+"%");
  		/*
  		$(box).css('background', '-moz-linear-gradient(left,  #4186fc 0%, #4186fc '+percent+'%, #3a3a3a '+(percent+1)+'%, #3a3a3a 100%');
  		$(box).css('background', '-webkit-gradient(linear, left top, right top, color-stop(0%,#4186fc), color-stop('+percent+'%,#4186fc), color-stop('+(percent+1)+'%,#3a3a3a), color-stop(100%,#3a3a3a)');
  		$(box).css('background', '-webkit-linear-gradient(left,  #4186fc 0%,#4186fc '+percent+'%,#3a3a3a '+(percent+1)+'%,#3a3a3a 100%');
  		$(box).css('background', '-o-linear-gradient(left,  #4186fc 0%,#4186fc '+percent+'%,#3a3a3a '+(percent+1)+'%,#3a3a3a 100%');
  		$(box).css('background', '-ms-linear-gradient(left,  #4186fc 0%,#4186fc '+percent+'%,#3a3a3a '+(percent+1)+'%,#3a3a3a 100%');
  		$(box).css('background', 'linear-gradient(to right,  #4186fc 0%,#4186fc '+percent+'%,#3a3a3a '+(percent+1)+'%,#3a3a3a 100%');
  		$(box).css('background', 'progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#4186fc\', endColorstr=\'#3a3a3a\',GradientType=1');
  		*/
	});

	// Sort Planets
	$('.planetWrapper').each( function() {
		$(this).children('.bar').sort(function (a, b) {
			var percentA = parseInt($(a).data('percent'));
			var percentB = parseInt($(b).data('percent'));
			//console.log(percentB - percentA);
			return percentB - percentA;
		}).appendTo($(this));
	});

	setTimeout(updateAllEvents,30 * 1000);
}
