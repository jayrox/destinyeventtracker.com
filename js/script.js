// Check for user selected color, set if undefined
var colorCookie = $.cookie('color');
if (typeof colorCookie === 'undefined') {
	$.cookie('color', 'bar_blueribbon', { expires: 365, path: '/' });
}

function updateAllEvents(setTimer) {
	"use strict";
	$('.bar').each(function () {
		var box, countDown, eventTypeData, eventOffsetData, eventDurationData, eventOffset2Data, eventDuration2Data, eventRepeatData,
			eventHappening, eventStart, eventEnd, eventDuration, eventComplete, percent, eventDayStartData, eventDayStartData2,
			eventOffsetData2, days, eventWarning, eventWarningEnd, remaining, eventRemaining, uid;
		box = $(this);
		countDown = box.find('.bar_timer');
		eventTypeData = parseInt(box.data('type'), 10);

		// Hourly
		if (eventTypeData === 1) {
			eventOffsetData = parseInt(box.data('offset'), 10);
			eventDurationData = parseInt(box.data('duration'), 10);
			eventOffset2Data = parseInt(box.data('offset2'), 10);
			eventDuration2Data = parseInt(box.data('duration2'), 10);
			eventRepeatData = 3600;
			if (eventOffset2Data > eventOffsetData) {
				eventRepeatData = eventOffset2Data - eventOffsetData;
			}
			eventHappening = false;

			if (eventOffsetData === 0 && eventDurationData === 0) {
				return;
			}
			// eventStart represents the closest start time
			// get the start of the current hour
			// add when the event starts
			eventStart = moment().utc().startOf('hour').add(eventOffsetData, 's');
			eventEnd = moment().utc().startOf('hour').add(eventOffsetData, 's').add(eventDurationData, 's');
			eventDuration = eventDurationData;

			if (eventEnd < moment().utc() && eventDuration2Data !== 0) {
				eventStart = moment().utc().startOf('hour').add(eventOffset2Data, 's');
				eventEnd = moment().utc().startOf('hour').add(eventOffset2Data, 's').add(eventDuration2Data, 's');
				eventDuration = eventDuration2Data;
				if (eventEnd < moment().utc() && eventDurationData !== 0) {
					eventStart = moment().utc().startOf('hour').add(1, 'h').add(eventOffsetData, 's');
					eventEnd = moment().utc().startOf('hour').add(1, 'h').add(eventOffsetData, 's').add(eventDurationData, 's');
					eventDuration = eventDurationData;
					eventRepeatData = eventRepeatData + 3600;
				}
			}

			eventComplete = moment(eventStart).utc();
			eventComplete.add(eventDuration, 's');

			while (eventComplete < moment().utc() && eventRepeatData === 3600) {
				eventStart.add(eventRepeatData, 's');
				eventComplete.add(eventRepeatData, 's');
			}
			percent = Math.round(((((eventRepeatData / 60) - eventStart.diff(moment().utc(), 'minutes')) / (eventRepeatData / 60)) * 100));
		}

		// Weekly
		if (eventTypeData === 2) {
			eventDayStartData = parseInt(box.data('daystart'), 10);
			eventOffsetData = parseInt(box.data('timestart'), 10);
			eventDayStartData2 = parseInt(box.data('dayend'), 10);
			eventOffsetData2 = parseInt(box.data('timeend'), 10);

			eventStart = moment().utc().startOf('week').add(eventDayStartData, 'd').add(eventOffsetData, 's');
			if (moment().utc() > eventStart) {
				eventStart = moment().utc().startOf('week').add(eventDayStartData2, 'd').add(eventOffsetData2, 's');
				// Handle next sunday
				if (eventDayStartData2 === 0) {
					eventDayStartData2 = 8;
					eventStart = moment().utc().day(eventDayStartData2 - 1).add(eventOffsetData2, 's');
				}
			}

			// Calculate duration day(s)
			days = eventDayStartData2 - eventDayStartData;
			if (days === 0) {
				days = 7;
			}
			days = Math.abs(days);

			eventComplete = moment(eventStart).utc();
			eventComplete.add(30, 's');

			while (eventComplete < moment().utc()) {
				eventStart.add(7, 'd');
				eventComplete.add(7, 'd');
			}

			percent = Math.round(((((days * 1440) - eventStart.diff(moment().utc(), 'minutes')) / (days * 1440)) * 100));
		}

		// Daily
		if (eventTypeData === 3) {
			eventOffsetData = parseInt(box.data('offset'), 10);
			eventDurationData = parseInt(box.data('duration'), 10);
			eventRepeatData = 24 * 3600;
			eventHappening = false;

			// eventStart represents the closest start time
			// get the start of the current hour
			// add when the event starts
			eventStart = moment().utc().startOf('day').add(eventOffsetData, 's');
			eventComplete = moment(eventStart).utc();
			eventComplete.add(eventDurationData, 's');

			while (eventComplete < moment().utc()) {
				eventStart.add(eventRepeatData, 's');
				eventComplete.add(eventRepeatData, 's');
			}
			percent = Math.round((((1440 - eventStart.diff(moment().utc(), 'minutes')) / 1440) * 100));
		}

		//console.log("percent: "+percent);

		//console.log(eventStart.format('YYMMDD HH:mm:ss Z'));
		//console.log(eventComplete.format('YYMMDD HH:mm:ss Z'));
		//console.log('-----');

		// 2 minute warning
		eventWarning = moment(eventStart).utc().subtract(120, 's');
		eventWarningEnd = moment(eventStart).utc().subtract(0, 's');

		if ((eventWarning < moment().utc()) && (moment().utc() < eventWarningEnd)) {
			$(box).children(".bar_progress").addClass('warning');
		} else {
			$(box).children(".bar_progress").removeClass('warning');
		}

		// Active
		if ((eventStart < moment().utc()) && (moment().utc() < eventComplete)) {
			eventHappening = true;
			$(box).children(".bar_progress").addClass('active');
		} else {
			eventHappening = false;
			$(box).children(".bar_progress").removeClass('active');
		}

		if (eventHappening) {
			remaining = eventComplete.diff(moment().utc(), 's');
			eventRemaining = moment().utc().add(remaining, 's');
			countDown.html("in progress, ends " + eventRemaining.fromNow());
			percent = 100;
		} else {
			uid = box.data('uid');
			if (uid === "xur" && moment().day() >= eventDayStartData && moment().day() <= eventDayStartData2) {
				countDown.html("leaves " + eventStart.fromNow());
			} else {
				countDown.html(eventStart.fromNow());
			}
		}

		// Set progress percentage
		$(box).data('percent', percent);
		$(box).children(".bar_progress").css("width", percent + "%");
	});

	// Sort Planets
	$('.planetWrapper').each(function () {
		$(this).children('.bar').sort(function (a, b) {
			var percentA, percentB;
			percentA = parseInt($(a).data('percent'), 10);
			percentB = parseInt($(b).data('percent'), 10);
			return percentB - percentA;
		}).appendTo($(this));
	});

	// Set timer is default to true, if defined dont set.
	if (setTimer === 'undefined') {
		// Auto update bars every 30 seconds
		setTimeout(updateAllEvents, 30 * 1000);
	}
}

$.getJSON("data/timers.json", function (data) {
	"use strict";
	var menu = [];
	$.each(data, function (dummy, val) {
		var bars, bar, planetname, planetlnsp, planetCookie, displayPlanet, checked, menuItem, bar_description, bar_color,
			colorCookie, d_uid, d_uid2, d_offset, d_duration, d_offset2, d_duration2, d_type, d_rarity, day_start, day_end,
			time_start, time_end, rarity, displayClass;
		bars = [];
		planetname = val.name;
		planetlnsp = planetname.replace(/\s/g, '').toLowerCase();

		//bar ='	<span class="bar_header" style="background: url(/media/'+planetlnsp+'.jpg) top left / 380px no-repeat">'+planetname+'</span>';
		bar = '	<span class="bar_header">' + planetname + '</span>';
		bar += '	<div id="' + planetlnsp + '" class="planetWrapper">';

		planetCookie = $.cookie(planetlnsp);
		checked = "checked";
		displayPlanet = true;
		if (planetCookie === "false") {
			checked = "";
			displayPlanet = false;
		}
		menuItem = '<li>'
			  + '<input type="checkbox" id="' + planetlnsp + 'check" data-planet="' + planetlnsp + '" ' + checked + '/>'
			  + '<label for="' + planetlnsp + 'check" class="button">'
			  + planetname
			  + '</label>'
			  + '</li>';

		// Push new menu item to list
		menu.push(menuItem);

		// Prgressbar color
		bar_color = $.cookie('color');

		$.each(val.events, function (dummy, e_val) {
			// Create description
			bar_description = "";
			$.each(e_val.subEvents, function (dummy, se_val) {
				bar_description += se_val + ", ";
			});
			bar_description = bar_description.substring(0, bar_description.length - 2);

			// Build time offsets and duration for timer
			d_offset = d_offset2 = 0;
			d_duration = d_duration2 = 0;
			d_type = e_val.type;
			d_rarity = 1;

			// Hourly
			if (d_type === 1) {
				d_offset = e_val.intervals[0].start;
				d_duration = e_val.intervals[0].end - d_offset;
				d_uid = e_val.intervals[0].uniqueId;
				d_rarity = e_val.intervals[0].rarity;

				if (typeof e_val.intervals[1] !== "undefined") {
					d_offset2 = e_val.intervals[1].start;
					d_duration2 = e_val.intervals[1].end - d_offset2;
					d_uid2 = e_val.intervals[1].uniqueId;
				}

				bar += '<div class="bar"'
					+ ' data-type="' + d_type + '"'
					+ ' data-offset="' + d_offset + '"'
					+ ' data-duration="' + d_duration + '"'
					+ ' data-uid="' + d_uid + '"'
					+ ' data-offset2="' + d_offset2 + '"'
					+ ' data-duration2="' + d_duration2 + '"'
					+ ' data-uid2="' + d_uid2 + '"'
					+ ' data-percent=""'
					+ '>';
			}

			// Weekly
			if (d_type === 2) {
				day_start = e_val.arrivalDay;
				day_end = e_val.departureDay;
				time_start = e_val.arrivalTime;
				time_end = e_val.departureTime;
				d_uid = e_val.uniqueId;
				d_rarity = e_val.rarity;

				bar += '<div class="bar"'
					+ ' data-type="' + d_type + '"'
					+ ' data-daystart="' + day_start + '"'
					+ ' data-dayend="' + day_end + '"'
					+ ' data-timestart="' + time_start + '"'
					+ ' data-timeend="' + time_end + '"'
					+ ' data-uid="' + d_uid + '"'
					+ ' data-percent=""'
					+ '>';
			}

			// Daily
			if (d_type === 3) {
				d_offset = e_val.intervals[0].start;
				d_duration = e_val.intervals[0].end - d_offset;
				d_uid = e_val.intervals[0].uniqueId;
				d_rarity = e_val.intervals[0].rarity;

				bar += '<div class="bar"'
					+ ' data-type="' + d_type + '"'
					+ ' data-offset="' + d_offset + '"'
					+ ' data-duration="' + d_duration + '"'
					+ ' data-uid="' + d_uid + '"'
					+ ' data-percent=""'
					+ '>';
			}

			rarity = "";
			switch (d_rarity) {
			case 3:
				rarity = "rare";
				break;
			case 2:
				rarity = "uncommon";
				break;
			default:
				rarity = "common";
				break;
			}

			bar += ' <div class="bar_progress ' + bar_color + '"></div>';
			bar += '	<span class="bar_location">' + e_val.name + '</span>';
			bar += '	<span class="bar_description">' + bar_description + '</span>';
			bar += '	<span class="bar_timer">&nbsp;</span>';
			bar += ' <div class="rarity ' + rarity + '" title="' + rarity + '"></div>';
			bar += '</div>';
		});
		bar += '</div></div>';

		// Push new bar to list
		bars.push(bar);

		// Show or hide the bar based on the planet selector cookie
		displayClass = displayPlanet ? "show" : "hide";

		// Push bars to ui
		$("<div/>", {
			class: 'bar_group ' + displayClass,
			id: planetlnsp,
			html: bars.join("")
		}).appendTo("#bar_container");
	});
	$("<ul/>", {
		class: "dropit-submenu",
		html: menu.join("")
	}).appendTo("ul.menu > li");

	// Build initial bars
	setTimeout(function () {
		updateAllEvents(false);
	}, 25);
});

// Planet hide/show
(function ($) {
	"use strict";
	$.fn.checking = function () {
		var planet = $(this).data('planet');
		if (this.prop('checked')) {
			$('#' + planet).show();
			$.cookie(planet, true, { expires: 365, path: '/' });
		} else {
			$('#' + planet).hide();
			$.cookie(planet, false, { expires: 365, path: '/' });
		}
		//console.log(planet);
	};
}(jQuery));


// Color Picker
(function ($) {
	"use strict";
	$.fn.checkingColorPicker = function () {
		var color = $(this).data('color');
		$('div.bar_progress').attr("class", "bar_progress " + color);
		$.cookie('color', color, { expires: 365, path: '/' });
		updateAllEvents();
	};
}(jQuery));

// Color Picker
var  colors, colorMenu, colorItem;
colors = ["bar_lime", "bar_christi", "bar_japaneselaurel", "bar_tropicalrainforest", "bar_java",
		"bar_lochmara", "bar_blueribbon", "bar_toreabay", "bar_electricviolet",
		"bar_violet", "bar_pinkflamingo", "bar_razzmatazz", "bar_carmine", "bar_red",
		"bar_orange", "bar_orangepeel", "bar_yellow", "bar_pickledbean", "bar_kokoda", "bar_como",
		"bar_bluebayoux", "bar_mauve", "bar_dovegray", "bar_taupe"];
colorMenu = [];
$.each(colors, function (key, color) {
	"use strict";
	var checked = "";
	if (colorCookie !== 'undefined' && colorCookie === color) {
		checked = "checked";
	}
	colorItem = '<li>'
		+ '<input type="radio" name="color" id="' + color + 'check" data-color="' + color + '" ' + checked + '/>'
		+ '<label for="' + color + 'check" class="' + color + '">&nbsp;</label>'
		+ '</li>';

	// Push new menu item to list
	colorMenu.push(colorItem);
});
$("<ul/>", {
	class: "dropit-submenu",
	html: colorMenu.join("")
}).appendTo("ul.colorpicker > li");

// Create Dropdown menus
$(document).ready(function () {
	"use strict";
	$('.menu').dropit();
	$('.colorpicker').dropit();
});

// Make the button hover colors match the bars.
$(document).on("mouseenter", ".button", function () {
	"use strict";
	colorCookie = $.cookie('color');
	$(this).addClass(colorCookie);
});

$(document).on("mouseleave", ".button", function () {
	"use strict";
	colorCookie = $.cookie('color');
	$(this).removeClass(colorCookie);
});

$(document).on({
	mouseenter: function () {
		"use strict";
		// Hover over code
		var title = $(this).attr('title');
		$(this).data('tipText', title).removeAttr('title');
		$('<p class="tooltip"></p>')
			.text(title)
			.appendTo('body')
			.fadeIn('slow');
	},
	mouseleave: function () {
		"use strict";
		// Hover out code
		$(this).attr('title', $(this).data('tipText'));
		$('.tooltip').remove();
	}
}, '.rarity')
	.mousemove(function (e) {
		"use strict";
		var mousex, mousey;
		mousex = e.pageX + 5; //Get X coordinates
		mousey = e.pageY + 5; //Get Y coordinates
		$('.tooltip').css({ top: mousey, left: mousex });
	});