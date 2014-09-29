$.getJSON( "timers.json", function( data ) {
	var menu = [];
	$.each( data, function( key, val ) {
		var bars = [];
		var planetname = val.name;
		var planetlnsp = planetname.toLowerCase();
		    planetlnsp = planetlnsp.replace(/\s/g, '');

		bar ='	<span class="bar_header">'+planetname+'</span>';
		bar+='	<div id="'+planetlnsp+'" class="planetWrapper">';
		
		planetCookie = $.cookie(planetlnsp);
		checked = "checked";
		displayPlanet = true;
		if ( typeof planetCookie != 'undefined' && planetCookie == "false" ) {
			checked = "";
			displayPlanet = false;
		}
		menuItem = '<li>'
			  + '<input type="checkbox" id="'+planetlnsp+'check" data-planet="'+planetlnsp+'" '+checked+'/>'
			  + '<label for="'+planetlnsp+'check">'
			  + planetname
			  + '</label>'
			  + '</li>';

		// Push new menu item to list
		menu.push( menuItem );
		
		$.each( val.events, function( e_key, e_val ) {
			// Create description
			bar_description = "";
			$.each( e_val.subEvents, function( se_key, se_val ) {
				bar_description += se_val + ", ";
			});
			bar_description = bar_description.substring(0, bar_description.length - 2);

			// Prgressbar color
			bar_color = "bar_blue";
			colorCookie = $.cookie('color');
			if ( typeof colorCookie != 'undefined' ) {
				bar_color = colorCookie;
			}
			
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
				bar +='<div class="bar"'
				    + ' data-type="'+d_type+'"'
				    + ' data-offset="'+d_offset+'"'
				    + ' data-duration="'+d_duration+'"'
				    + ' data-offset2="'+d_offset2+'"'
				    + ' data-duration2="'+d_duration2+'"'
				    + ' data-percent=""'
				    + '>';
			}

			// Weekly
			if (d_type == 2) {
				day_start = e_val.arrivalDay;
				day_end = e_val.departureDay;
				time_start = e_val.arrivalTime;
				time_end = e_val.departureTime;
				bar +='<div class="bar"'
				    + ' data-type="'+d_type+'"'
				    + ' data-daystart="'+day_start+'"'
				    + ' data-dayend="'+day_end+'"'
				    + ' data-timestart="'+time_start+'"'
				    + ' data-timeend="'+time_end+'"'
				    + ' data-percent=""'
				    + '>';
			}

			// Daily
			if (d_type == 3) {
				d_offset = e_val.intervals[0].start;
				d_duration = e_val.intervals[0].end - d_offset;

				bar +='<div class="bar"'
				    + ' data-type="'+d_type+'"'
				    + ' data-offset="'+d_offset+'"'
				    + ' data-duration="'+d_duration+'"'
				    + ' data-percent=""'
				    + '>';
			}

			bar +=' <div class="bar_progress '+bar_color+'"></div>';
			bar +='	<span class="bar_location">'+e_val.name+'</span>';
			bar +='	<span class="bar_description">'+bar_description+'</span>';
			bar +='	<span class="bar_timer">&nbsp;</span>';
			bar +='</div>';
		});
		bar +='</div></div>';

		// Push new bar to list
		bars.push( bar );

		// Show or hide the bar based on the planet selector cookie
		displayClass = displayPlanet ? "show" : "hide";

		// Push bars to ui
		$( "<div/>", {
			class: 'bar_group '+displayClass,
			id: planetlnsp,
			html: bars.join( "" )
		}).appendTo( "#bar_container" );
	});
	$( "<ul/>", {
		class: "dropit-submenu",
		html: menu.join( "" )
	}).appendTo( "ul.menu > li" );
});
	
function updateAllEvents() {
	$('.bar').each(function() {
		var box = $(this);
		var countDown = box.find('.bar_timer');
		var eventTypeData = parseInt(box.data('type'));

		// Hourly
		if (eventTypeData == 1 ) {
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
				return;
			}
			// eventStart represents the closest start time
			// get the start of the current hour
			// add when the event starts
			var eventStart = moment().utc().startOf('hour').add(eventOffsetData, 's');
			var eventComplete = moment(eventStart).utc();
			eventComplete.add(eventDurationData, 's');
	
			while(eventComplete < moment().utc()) {
				eventStart.add(eventRepeatData, 's');
				eventComplete.add(eventRepeatData, 's');
			}
			var percent = Math.round((((60 - eventStart.diff(moment().utc(), 'minutes')) / 60) * 100));
		}

		// Weekly
		if (eventTypeData == 2 ) {
			console.log("type 2");
			var eventDayStartData = parseInt(box.data('daystart'));
			console.log(eventDayStartData);
			var eventOffsetData = parseInt(box.data('timestart'));
			console.log(eventOffsetData);
			var eventDayStartData2 = parseInt(box.data('dayend'));
			console.log(eventDayStartData2);
			var eventOffsetData2 = parseInt(box.data('timeend'));
			console.log(eventOffsetData2);
			
			var days = (7 - eventDayStartData) + 1;
			var eventStart = moment().utc().startOf('week').add(eventDayStartData, 'd').add(eventOffsetData, 's');
			if ( moment().utc() > eventStart )
			{
				var eventStart = moment().utc().startOf('week').add(eventDayStartData2, 'd').add(eventOffsetData2, 's');
				var days = (7 - eventDayStartData2) + 1;
			}
			console.log("days: "+days);

			var eventComplete = moment(eventStart).utc();
			eventComplete.add(30, 's');
			
			console.log(eventStart);
			console.log(eventComplete);
			
			var percent = Math.round(((((days * 1440) - eventStart.diff(moment().utc(), 'minutes')) / 1440) * 100));
		}

		// Daily
		if (eventTypeData == 3 ) {
			var eventOffsetData = parseInt(box.data('offset'));
			var eventDurationData = parseInt(box.data('duration'));
			var eventRepeatData = 24*3600;
			var eventHappening = false;
			
			// eventStart represents the closest start time
			// get the start of the current hour
			// add when the event starts
			var eventStart = moment().utc().startOf('day').add(eventOffsetData, 's');
			var eventComplete = moment(eventStart).utc();
			eventComplete.add(eventDurationData, 's');
	
			while(eventComplete < moment().utc()) {
				eventStart.add(eventRepeatData, 's');
				eventComplete.add(eventRepeatData, 's');
			}
			var percent = Math.round((((1440 - eventStart.diff(moment().utc(), 'minutes')) / 1440) * 100));
		}
		
		console.log("percent: "+percent);

		//console.log(eventStart.format('h:mm'));
		//console.log(eventComplete.format('h:mm'));
		//console.log('-----');
		
		// 2 minute warning
		var eventWarning = moment(eventStart).utc().subtract(120, 's');
		var eventWarningEnd = moment(eventStart).utc().subtract(0, 's');
		
		if((eventWarning < moment().utc()) && (moment().utc() < eventWarningEnd)) {
			$(box).children(".bar_progress").addClass('warning');
		} else {
			$(box).children(".bar_progress").removeClass('warning');
		}

		// Active
		if((eventStart < moment().utc()) && (moment().utc() < eventComplete)) {
			eventHappening = true;
			$(box).children(".bar_progress").addClass('active');
		} else {
			eventHappening = false;
			$(box).children(".bar_progress").removeClass('active');
		}

		if (eventHappening) {
			countDown.html( "In progress" );
			percent = 100;
		} else {
			countDown.html( eventStart.fromNow() );
		}

		$(box).data('percent', percent);
		$(box).children(".bar_progress").css("width", percent+"%");
	});

	// Sort Planets
	$('.planetWrapper').each( function() {
		$(this).children('.bar').sort(function (a, b) {
			var percentA = parseInt($(a).data('percent'));
			var percentB = parseInt($(b).data('percent'));
			return percentB - percentA;
		}).appendTo($(this));
	});

	// Auto update bars every 30 seconds
	setTimeout(updateAllEvents,30 * 1000);
}

(function($) {
	$.fn.checking = function() {
	planet = $(this).data('planet');
	if (this.prop('checked')) {
		$('#'+planet).show();
		$.cookie(planet, true, { expires: 365, path: '/' });
	} else {
		$('#'+planet).hide();
		$.cookie(planet, false, { expires: 365, path: '/' });
	}
	
	};
})(jQuery);

$(document).ready(function() {
	$('.menu').dropit();
});
