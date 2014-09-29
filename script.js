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
			bar_description = bar_description.substring(0, bar_description.length - 2);

			// Build bar item
			bar_color = "bar_blue";
			colorCookie = $.cookie('color');
			if ( typeof colorCookie != 'undefined' ) {
				bar_color = colorCookie;
			}
			console.log("barcolor: "+bar_color);
			bar +='<div class="bar" data-offset="'+d_offset
			    +'" data-duration="'+d_duration
			    +'" data-offset2="'+d_offset2
			    +'" data-duration2="'+d_duration2
			    +'" data-type="'+d_type
			    +'" data-percent="">';
			bar +=' <div class="bar_progress '+bar_color+'"></div>';
			bar +='	<span class="bar_location">'+e_val.name+'</span>';
			bar +='	<span class="bar_description">'+bar_description+'</span>';
			bar +='	<span class="bar_timer">&nbsp;</span>';
			bar +='</div>';
		});
		bar +='</div></div>';

		// Push new bar to list
		bars.push( bar );

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
	//console.log(menu);
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
			//console.log("continue");
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
		//console.log("percent: "+percent);

		//console.log(eventStart.format('h:mm'));
		//console.log(eventComplete.format('h:mm'));
		//console.log('-----');
		
		// 2 minute warning
		var eventWarning = moment(eventStart).subtract(120, 's');
		var eventWarningEnd = moment(eventStart).subtract(0, 's');
		
		if((eventWarning < moment()) && (moment() < eventWarningEnd)) {
			$(box).children(".bar_progress").addClass('warning');
		} else {
			$(box).children(".bar_progress").removeClass('warning');
		}

		if((eventStart < moment()) && (moment() < eventComplete)) {
			eventHappening = true;
			$(box).children(".bar_progress").addClass('active');
		} else {
			eventHappening = false;
			$(box).children(".bar_progress").removeClass('active');
		}

		if (eventHappening) {
			countDown.html( "In progress" );
			percent = 100;
			//box remove dark, use red 
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
			//console.log(percentB - percentA);
			return percentB - percentA;
		}).appendTo($(this));
	});

	setTimeout(updateAllEvents,30 * 1000);
}

(function($) {
	$.fn.checking = function() {
	if (this.prop('checked')) {
		planet = $(this).data('planet');
		console.log("checked: "+planet);
		$('#'+planet).show();
		$.cookie(planet, true, { expires: 365, path: '/' });
	} else {
		planet = $(this).data('planet');
		console.log("unchecked: "+planet);
		$('#'+planet).hide();
		$.cookie(planet, false, { expires: 365, path: '/' });
	}
	
	};
})(jQuery);

$(document).ready(function() {
	$('.menu').dropit();
});
