"use strict";
$(document).ready(function () {
    var $guestbookList = $('tbody.guestbook-list');
    if ($guestbookList.length) {
        var control = false;
        var guestbookController = '<tr class="control"><td colspan="6"><button class="btn btn-danger delete">Delete</button> <button class="btn btn-warning cancel">Cancel</button></td></tr>';
        var callDelete = function(that, data) {
            var url = '/manage/guestbook/delete';

            $.post(url, data).done(function (data, status) {
                if (status === 'success') {
                    // delete this tr
                    // $(that).remove();
                    location.reload();
                }
            });
        };

        $guestbookList.on('click', 'tr.can-control', function (e) {
            var that = this;
            var secretToken = $('input[name="_csrf"]').eq(0).val();

            if (!control) {
                $(guestbookController).insertAfter($(that).closest('tr'));

                control = true;

                $('tr.control').one('click', 'button.delete', function (e) {
                    // go delete
                    var data = { guestbook_id: $(that).data('id'), _csrf: secretToken };

                    callDelete(that, data);

                    $(this).parent().parent().remove();

                    control = false;
                }).one('click', 'button.cancel', function (e) {
                    $(this).parent().parent().remove();

                    control = false;
                });
            }
        });
    }

    var $dailyViews = $('.canvas-chart-line-visitors-pageview');
    var $dailyVisitors = $('.canvas-chart-line-daily-visitors');

    if ($dailyVisitors.length || $dailyViews.length) {
        Chart.defaults.global.defaultFontColor = '#666666';
        Chart.defaults.global.defaultFontFamily = 'Poppins, Arial, sans-serif';
        Chart.defaults.global.defaultFontSize = 12;
        Chart.defaults.global.maintainAspectRatio = false;
        Chart.defaults.global.legend.labels.usePointStyle = true;
        Chart.defaults.scale.gridLines.color = 'rgba(100,100,100,0.15)';
        Chart.defaults.scale.gridLines.zeroLineColor = 'rgba(100,100,100,0.15)';
        Chart.defaults.scale.ticks.beginAtZero = true;
        Chart.defaults.scale.ticks.maxRotation = 0;
        Chart.defaults.scale.ticks.padding = 3;
        Chart.defaults.scale.ticks.autoSkipPadding = 10;
        Chart.defaults.global.elements.point.radius = 5;
        Chart.defaults.global.elements.point.borderColor = 'transparent';

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

    	$.get('/manage/dashboard', function (data, result) {
            $dailyViews.each(function(i){
                var canvas = jQuery(this)[0].getContext("2d");
                new Chart(canvas, data.pageviewGraph);
            });

            $dailyVisitors.each(function(i){
                var canvas = jQuery(this)[0].getContext("2d");
                new Chart(canvas, data.accountGraph);
            });
        });
    }
});
(function(){
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