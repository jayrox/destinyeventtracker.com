$.getJSON( "timers.json", function( data ) {
	var menu = [];
	$.each( data, function( key, val ) {
		var bars = [];
		var planetname = val.name;
		var planetlnsp = planetname.toLowerCase();
		    planetlnsp = planetlnsp.replace(/\s/g, '');

		//bar ='	<span class="bar_header" style="background: url(/media/'+planetlnsp+'.jpg) top left / 380px no-repeat">'+planetname+'</span>';
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
			bar_color = "bar_blueribbon";
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
			if ( d_type == 2) {
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
			if ( d_type == 3) {
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
			if ( eventOffset2Data > eventOffsetData ) {
				eventRepeatData = eventOffset2Data - eventOffsetData;
			}
			var eventDuration2Data = parseInt(box.data('duration2'));
			var eventHappening = false;
	
			if ( eventOffsetData == 0 && eventDurationData == 0 ) {
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
			var eventDayStartData = parseInt(box.data('daystart'));
			var eventOffsetData = parseInt(box.data('timestart'));
			var eventDayStartData2 = parseInt(box.data('dayend'));
			var eventOffsetData2 = parseInt(box.data('timeend'));

			var eventStart = moment().utc().startOf('week').add(eventDayStartData, 'd').add(eventOffsetData, 's');
			if ( moment().utc() > eventStart )
			{
				console.log('using second date');
				var eventStart = moment().utc().startOf('week').add(eventDayStartData2, 'd').add(eventOffsetData2, 's');

				if(eventDayStartData2 == 0) {
					eventDayStartData2 = 8;
				}
			}
			console.log("start: "+eventStart);

			// Calculate duration day(s)
			var days = eventDayStartData2 - eventDayStartData;
			if ( days == 0 ) days = 7;
			days = Math.abs(days);
			console.log("days: "+days);

			var eventComplete = moment(eventStart).utc();
			eventComplete.add(30, 's');
			console.log("stop: "+eventComplete);
			
			while(eventComplete < moment().utc()) {
				eventStart.add(7, 'd');
				eventComplete.add(7, 'd');
			}
			console.log("start2: "+eventStart);
			console.log("stop2: "+eventComplete);

			var percent = Math.round(((((days * 1440) - eventStart.diff(moment().utc(), 'minutes')) / (days * 1440)) * 100));
			console.log("percent: "+percent);
			console.log('------');
		}

		// Daily
		if ( eventTypeData == 3 ) {
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
		
		//console.log("percent: "+percent);

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
		
		// Set progress percentage
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

// Planet hide/show
(function($) {
	$.fn.checking = function() {
	planet = $(this).data('planet');
	if ( this.prop('checked') ) {
		$('#'+planet).show();
		$.cookie(planet, true, { expires: 365, path: '/' });
	} else {
		$('#'+planet).hide();
		$.cookie(planet, false, { expires: 365, path: '/' });
	}
	console.log(planet);
	};
})(jQuery);


// Color Picker
(function($) {
	$.fn.checkingColorPicker = function() {
		color = $(this).data('color');
		$('div.bar_progress').attr("class", "bar_progress "+color);
		$.cookie('color', color, { expires: 365, path: '/' });
	};
})(jQuery);

// Color Picker
var colors = ["bar_christi", "bar_japaneselaurel", "bar_tropicalrainforest", "bar_java", 
      "bar_lochmara", "bar_blueribbon", "bar_toreabay", "bar_electricviolet", 
      "bar_violet", "bar_pinkflamingo", "bar_razzmatazz", "bar_carmine", "bar_red", 
      "bar_orange", "bar_orangepeel", "bar_pickledbean", "bar_kokoda", "bar_como", 
      "bar_bluebayoux", "bar_dovegray", "bar_taupe"];
colorMenu = [];
colorCookie = $.cookie('color');
$.each( colors, function( key, color ) {
	checked = "";
	if ( typeof colorCookie != 'undefined' && colorCookie == color ) {
		checked = "checked";
	}
	colorItem = '<li>'
		  + '<input type="radio" name="color" id="'+color+'check" data-color="'+color+'" '+checked+'/>'
		  + '<label for="'+color+'check" class="'+color+'">&nbsp;</label>'
		  + '</li>';

	// Push new menu item to list
	colorMenu.push( colorItem );
});
$( "<ul/>", {
	class: "dropit-submenu",
	html: colorMenu.join( "" )
}).appendTo( "ul.colorpicker > li" );

// Create Dropdown menus
$(document).ready(function() {
	$('.menu').dropit();
	$('.colorpicker').dropit();
});

