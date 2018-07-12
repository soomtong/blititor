"use strict";

//Carts initialization
(function() {
	//Global Defaults
	Chart.defaults.global.defaultFontColor = '#444';
	Chart.defaults.global.defaultFontFamily = 'sans-serif';
	Chart.defaults.global.defaultFontSize = 12;
	
	//Yearly visitors
	var $canvasesYearlyVisitors = jQuery('.canvas-chart-line-yearly-visitors');
	if ($canvasesYearlyVisitors.length) {
		$canvasesYearlyVisitors.each(function(i){

			var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var config = {
				type: 'line',
				data: {
					labels: MONTHS,
					datasets: [{
						label: "Unique Visitors",
						backgroundColor: 'rgba(244, 161, 21, 0.5)',
						borderColor: 'rgba(244, 161, 21, 0.5)',
						borderWidth: '0',
						tension: '0',
						//visitors per month
						data: [20, 50, 80, 100, 300, 500, 800, 1000, 900, 700, 1000, 1100],
						fill: true,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					responsive: true,
					title:{
						display:true,
						text:'Yearly Visitors'
					},
					tooltips: {
						mode: 'index',
						intersect: false,
					},
					hover: {
						mode: 'nearest',
						intersect: true
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Month'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Visitors'
							}
						}]
					}
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

			var DAYS = [
				"01/01",

				"06/01",

				"11/01",

				"16/01",


				"21/01",

				"26/01",

				"31/01"
			 ];
			var config = {
				type: 'line',
				data: {
					labels: DAYS,
					datasets: [{
						label: "Unique Visitors",
						backgroundColor: 'rgba(236, 104, 46, 0.5)',
						borderColor: 'rgba(236, 104, 46, 0.5)',
						borderWidth: '0',
						tension: '0',
						//visitors per month
						data: [
							
							46,
							43,
							44,
							45,
							43,
							37,
							50,

						],
						fill: true,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					responsive: true,
					title:{
						display:true,
						text:'Monthly Visitors'
					},
					tooltips: {
						mode: 'index',
						intersect: false,
					},
					hover: {
						mode: 'nearest',
						intersect: true
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Day'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Visitors'
							}
						}]
					}
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

			var DAYS = [
				"01/01",

				"06/01",

				"11/01",

				"16/01",


				"21/01",

				"26/01",

				"31/01"
			 ];
			var config = {
				type: 'line',
				data: {
					labels: DAYS,
					datasets: [{
						label: "Visitors",
						backgroundColor: 'rgba(236, 104, 46, 0.5)',
						borderColor: 'rgba(236, 104, 46, 0.5)',
						borderWidth: 3,
						tension: '0',
						//visitors per month
						data: [
							
							46,
							43,
							44,
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
						tension: '0',
						//visitors per month
						data: [
							
							4,
							4,
							6,
							5,
							8,
							7,
							10,

						],
						fill: false,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					responsive: true,
					title:{
						display:true,
						text:'Visitors with Sells'
					},
					tooltips: {
						mode: 'index',
						intersect: false,
					},
					hover: {
						mode: 'nearest',
						intersect: true
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Day'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Visitors'
							}
						}]
					}
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

			var DAYS = [
				"01/01",

				"06/01",

				"11/01",

				"16/01",


				"21/01",

				"26/01",

				"31/01"
			 ];
			var config = {
				type: 'line',
				data: {
					labels: DAYS,
					datasets: [{
						label: "Conversion",
						backgroundColor: 'rgba(111, 211, 227, 0.6)',
						borderColor: 'rgba(91, 173, 186, 0.5)',
						borderWidth: '2',
						// tension: '0',
						//Conversion per month
						data: [
							
							1.2,
							1.5,
							1.7,
							1.9,
							2,
							2.6,
							3,

						],
						fill: true,
					}, 
					//put new dataset here if needed to show multiple datasets on one graph
					]
				},
				options: {
					responsive: true,
					title:{
						display:true,
						text:'Monthly Conversion ( % )'
					},
					tooltips: {
						mode: 'index',
						intersect: false,
					},
					hover: {
						mode: 'nearest',
						intersect: true
					},
					scales: {
						xAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Day'
							}
						}],
						yAxes: [{
							display: true,
							scaleLabel: {
								display: true,
								labelString: 'Conversion %'
							}
						}]
					}
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
				options: {
					responsive: true
				}
			};


			var canvas = jQuery(this)[0].getContext("2d");;
						
			new Chart(canvas, config);
		});
	} //Monthly Returned Visitors
})();