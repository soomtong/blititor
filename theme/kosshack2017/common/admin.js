"use strict";

(function(){
	
	//Charts initialization
	//http://www.chartjs.org/docs/

		//Global Defaults
			//fonts
	Chart.defaults.global.defaultFontColor = '#666666';
	Chart.defaults.global.defaultFontFamily = 'Poppins, Arial, sans-serif';
	Chart.defaults.global.defaultFontSize = 12;
			//responsive
	Chart.defaults.global.maintainAspectRatio = false;

			//legends
	Chart.defaults.global.legend.labels.usePointStyle = true;

			//scale
	Chart.defaults.scale.gridLines.color = 'rgba(100,100,100,0.15)';
	Chart.defaults.scale.gridLines.zeroLineColor = 'rgba(100,100,100,0.15)';
	// Chart.defaults.scale.gridLines.drawTicks = false;
	
	// Chart.defaults.scale.ticks.min = 0;
	Chart.defaults.scale.ticks.beginAtZero = true;
	Chart.defaults.scale.ticks.maxRotation = 0;

		//padding for Y axes
	Chart.defaults.scale.ticks.padding = 3;
	Chart.defaults.scale.ticks.autoSkipPadding = 10;

		//points
	Chart.defaults.global.elements.point.radius = 5;
	Chart.defaults.global.elements.point.borderColor = 'transparent';


		//custom Chart plugin for set a background to chart
	Chart.pluginService.register({
	beforeDraw: function (chart, easing) {
		if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
			var ctx = chart.chart.ctx;
			var chartArea = chart.chartArea;
				ctx.save();
				ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
				ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
				ctx.restore();
			}
		}
	});
			

	var DAYS = [
		"01.03",
		"06.03",
		"11.03",
		"16.03",
		"21.03",
		"26.03",
		"31.03"
	 ];

	var MONTHS = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];

	var MONTHS_HALF = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
	];

	//New and Returned visitors
	var $canvasesMonthlyVisitors = jQuery('.canvas-chart-line-new-returned-visitors');
	if ($canvasesMonthlyVisitors.length) {
		$canvasesMonthlyVisitors.each(function(i){

			var config = {
				type: 'line',
				data: {
					labels: MONTHS_HALF,
					datasets: [{
						label: "New Visitors",
						//line options
						backgroundColor: 'rgba(77, 177, 158, 0.2)',
						borderColor: 'rgba(77, 177, 158, 1)',
						borderWidth: 2,
						fill: true,
						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "transparent",
						pointBorderWidth: 0,
						//visitors per month
						data: [
							
							26,
							43,
							23,
							45,
							43,
							37,
							50,

						],
					}, 
					{
						label: "Returned Visitors",
						backgroundColor: 'rgba(0, 126, 189, 0.2)',
						borderColor: 'rgba(0, 126, 189, 1)',
						borderWidth: 2,
						fill: true,
						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "transparent",
						pointBorderWidth: 0,
						//returned visitors per month
						data: [
							
							22,
							18,
							45,
							22,
							18,
							26,
							20,

						],
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					chartArea: {
						backgroundColor: 'rgba(100, 100, 100, 0.02)',
					},
					scales: {
						yAxes: [{
							ticks: {
								maxTicksLimit: 4
							}
						}]
					}
				}
			};

			var canvas = jQuery(this)[0].getContext("2d");;
			new Chart(canvas, config);
		});
	} //New and Returned visitors
	
	//Yearly visitors
	var $canvasesYearlyVisitors = jQuery('.canvas-chart-line-yearly-visitors');
	if ($canvasesYearlyVisitors.length) {
		$canvasesYearlyVisitors.each(function(i){
			var config = {
				type: 'line',
				data: {
					labels: MONTHS_HALF,
					datasets: [{
						label: "Unique Visitors",
						backgroundColor: 'rgba(77, 177, 158, 0.5)',
						borderColor: 'rgba(77, 177, 158, 0.5)',
						borderWidth: '0',
						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "rgba(77, 177, 158, 1)",
						pointBorderWidth: 0,
						tension: '0',
						//visitors per month
						data: [300, 250, 480, 500, 300, 700, 900],
						fill: true,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					chartArea: {
						backgroundColor: 'rgba(100, 100, 100, 0.02)',
					},
					
				}
			};

			var canvas = jQuery(this)[0].getContext("2d");;
			new Chart(canvas, config);
		});
	} //Yearly visitors

	//Monthly visitors
	var $canvasesMonthlyVisitors = jQuery('.canvas-chart-line-monthly-visitors');
	if ($canvasesMonthlyVisitors.length) {
		$canvasesMonthlyVisitors.each(function(i){

			var config = {
				type: 'line',
				data: {
					labels: DAYS,
					datasets: [{
						label: "Unique Visitors",
						backgroundColor: 'rgba(236, 104, 46, 0.5)',
						borderColor: 'rgba(236, 104, 46, 0.5)',
						borderWidth: '0',

						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "rgba(236, 104, 46, 1)",
						pointBorderWidth: 0,

						tension: '0',
						//visitors per month
						data: [
							
							446,
							243,
							544,
							645,
							443,
							437,
							750,

						],
						fill: true,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					chartArea: {
						backgroundColor: 'rgba(100, 100, 100, 0.02)',
					},
				}
			};

			var canvas = jQuery(this)[0].getContext("2d");;
			new Chart(canvas, config);
		});
	} //Monthly visitors

	//Monthly visitors with sells
	var $canvasesMonthlyVisitors = jQuery('.canvas-chart-line-visitors-sels');
	if ($canvasesMonthlyVisitors.length) {
		$canvasesMonthlyVisitors.each(function(i){

			var config = {
				type: 'line',
				data: {
					labels: DAYS,
					datasets: [{
						label: "Visitors",
						backgroundColor: 'rgba(236, 104, 46, 0.5)',
						borderColor: 'rgba(236, 104, 46, 0.5)',
						borderWidth: 3,

						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "rgba(236, 104, 46, 1)",
						pointBorderWidth: 0,

						tension: '0',
						//visitors per month
						data: [
							
							46,
							43,
							34,
							45,
							43,
							37,
							50,

						],
						fill: false,
					}, 
					{
						label: "Sells",
						backgroundColor: 'rgba(111, 211, 227, 0.6)',
						borderColor: 'rgba(91, 173, 186, 0.5)',
						borderWidth: 3,

						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "rgba(111, 211, 227, 1)",
						pointBorderWidth: 0,

						tension: '0',
						//sells per month
						data: [
							
							4,
							8,
							6,
							10,
							5,
							7,
							10,

						],
						fill: false,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					chartArea: {
						backgroundColor: 'rgba(100, 100, 100, 0.02)',
					},
				}
			};

			var canvas = jQuery(this)[0].getContext("2d");;
			new Chart(canvas, config);
		});
	} //Monthly visitors


	//Monthly Conversion
	var $canvasesMonthlyConversion = jQuery('.canvas-chart-line-conversions');
	if ($canvasesMonthlyConversion.length) {
		$canvasesMonthlyConversion.each(function(i){

			var config = {
				type: 'line',
				data: {
					labels: DAYS,
					datasets: [{
						label: "Conversion",
						backgroundColor: 'rgba(111, 211, 227, 0.6)',
						borderColor: 'rgba(91, 173, 186, 0.5)',
						borderWidth: '2',
						
						//point options
						pointBorderColor: "transparent",
						pointBackgroundColor: "rgba(111, 211, 227, 1)",
						pointBorderWidth: 0,

						//Conversion per month
						data: [
							
							1.2,
							1.5,
							1.3,
							1.9,
							2,
							2.6,
							2.4,

						],
						fill: true,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					chartArea: {
						backgroundColor: 'rgba(100, 100, 100, 0.02)',
					},
				}
			};

			var canvas = jQuery(this)[0].getContext("2d");;
			new Chart(canvas, config);
		});
	} //Monthly Conversion


	//Monthly Returned Visitors - Not used at the moment
	var $canvasesMonthlyPieVisitors = jQuery('.canvas-chart-pie-visitors');
	if ($canvasesMonthlyPieVisitors.length) {
		$canvasesMonthlyPieVisitors.each(function(i){

			var config = {
				type: 'pie',
				data: {
					datasets: [{
						data: [
							76,
							24,
						],
						backgroundColor: [
							'rgba(236, 104, 46, 0.5)',
							'rgba(236, 104, 46, 0.7)'
						],
						label: 'Monthly Visitors'
					}],
					labels: [
						"New Visitors",
						"Returned Visitors",
					]
				},
			};

			var canvas = jQuery(this)[0].getContext("2d");;
			new Chart(canvas, config);
		});
	} //Monthly Returned Visitors

	//end of Charts

	//////////////
	//vector map//
	//////////////
	//http://jvectormap.com/
	jQuery('.world_map').vectorMap({
		map: 'world_mill',
		backgroundColor: "transparent",
		zoomOnScroll: false,
		regionsSelectable: true,
		regionsSelectableOne: true,
		markerSelectable: true,
		markerSelectableOne: true,
		regionStyle: {
			initial: {
				"fill": '#e9eaeb',
				"fill-opacity": 0.9,
				"stroke": 'none',
				"stroke-width": 0,
				"stroke-opacity": 0
			},
			selected: {
				fill: '#eeb269'
			},
		},
		markerStyle: {
			initial: {
				fill: '#dc5753',
				stroke: 'transparent',
				"stroke-width": 0,
			},
			hover: {
				stroke: '#dc5753',
				"stroke-width": 2,
				cursor: 'pointer'
			},
			selected: {
				"fill-opacity": 0.5
			},
			selectedHover: {
			}
		},

		selectedRegions: ['GB'],

		series: {
			regions: [{
				values: {
					"AU": 1,
					"BR": 2,
					"CA": 5,
					"CN": 100,
					"TR": 1,
					"IN": 1,
					"GB": 1,
					"US": 100,

				},
				scale: ["#007ebd", "#4db19e"],
				normalizeFunction: 'polynomial'
			}]
		},
		markers: [
			{latLng: [41.90, 12.45], name: 'Vatican City'},
			{latLng: [3.2, 73.22], name: 'Maldives'},
		],
	});

	///////////////////
	//events calendar//
	///////////////////
	//https://fullcalendar.io/
	jQuery('.events_calendar').fullCalendar(

		{
			header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay,listWeek'
			},
			defaultDate: '2017-03-12',
			editable: true,
			eventLimit: true, // allow "more" link when too many events
			navLinks: true,
			aspectRatio: 1,
			events: [
				{
					title: 'All Day Event',
					start: '2017-03-01'
				},
				{
					title: 'Long Event',
					start: '2017-03-07',
					end: '2017-03-10'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: '2017-03-09T16:00:00'
				},
				{
					id: 999,
					title: 'Repeating Event',
					start: '2017-03-16T16:00:00'
				},
				{
					title: 'Conference',
					start: '2017-03-11',
					end: '2017-03-13'
				},
				{
					title: 'Meeting',
					start: '2017-03-12T10:30:00',
					end: '2017-03-12T12:30:00'
				},
				{
					title: 'Lunch',
					start: '2017-03-12T12:00:00'
				},
				{
					title: 'Meeting',
					start: '2017-03-12T14:30:00'
				},
				{
					title: 'Happy Hour',
					start: '2017-03-12T17:30:00'
				},
				{
					title: 'Dinner',
					start: '2017-03-12T20:00:00'
				},
				{
					title: 'Birthday Party',
					start: '2017-03-13T07:00:00'
				},
				{
					title: 'Click for Google',
					url: 'http://google.com/',
					start: '2017-03-28'
				}
			]
		}

	);

	/////////////////////
	//date range picker//
	/////////////////////
	//http://www.daterangepicker.com/
	(function() {
		var start = moment().subtract(29, 'days');
		var end = moment();

		function cb(start, end) {
			jQuery('.dashboard-daterangepicker span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
		}

		jQuery('.dashboard-daterangepicker').daterangepicker({
			"startDate": start,
			"endDate": end,
			"autoApply": true,
			"linkedCalendars": false,
			"showCustomRangeLabel": false,
			"alwaysShowCalendars": true,
			"ranges": {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
				'Last 7 Days': [moment().subtract(6, 'days'), moment()],
				'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			
			},
		}, cb);

		cb(start, end);
	})();

	/////////////
	//sparkline//
	/////////////
	//http://omnipotent.net/jquery.sparkline/
	jQuery('.sparklines').each(function(){
		//sparkline type: 'line' (default), 'bar', 'tristate', 'discrete', 'bullet', 'pie', 'box'
		var $this = jQuery(this);
		var data = $this.data();
		
		var type = data.type ? data.type : 'bar';
		var lineColor = data.lineColor ? data.lineColor : '#4db19e';
		var negBarColor = data.negColor ? data.negColor : '#dc5753';
		var barWidth = data.barWidth ? data.barWidth : 4;
		var height = data.height ? data.height : false;
		
		var values = data.values ? JSON.parse("[" + data.values + "]") : false;
		
		$this.sparkline(values, {
			type: type,
			lineColor: lineColor,
			barColor: lineColor,
			negBarColor: negBarColor,
			barWidth: barWidth,
			height: height,
		});
	});


})();