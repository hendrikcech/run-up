//require('highcharts')

module.exports = function(target, onSelectionChange, dataType, hr, pace) {
	return new Highcharts.Chart({
		chart: {
			renderTo: target,
			type: 'column'
		},
		title: { text: '' },
		tooltip: {
			headerFormat: '',
			animation: false,
			formatter: function() {
				if(this.series.options.id === 'pace') {
					var v = Highcharts.dateFormat('%M:%S', this.y)
				} else {
					var v = this.y
				}
				return '<span style="color:'+ this.series.color +'"><b>'+ v +'</b><br/>'
			}
		},
		colors: ['#7cb5ec'],
		credits: { enabled: false },
		xAxis: {},
		yAxis: [{
			id: 'hrAxis',
			type: 'linear',
			title: { text: null },
			floor: hr.min - 30, ceiling: hr.max + 10,
			showEmpty: false
		}, {
			id: 'paceAxis',
			title: { text: null },
			// floor: pace.min - 12000,
			ceiling: pace.max + 4000,
			type: 'datetime',
			dateTimeLabelFormats: {
				minute: '%M:%S'
			},
			showEmpty: false
		}],
		legend: {
			enabled: false
		},
		plotOptions: {
			column: {
				pointPadding: null,
				groupPadding: null,
				borderWidth: 1,
				borderColor: 'white',
				allowPointSelect: true,
				pointPlacement: 'between',
				animation: false
			},
			series: {
				cursor: 'pointer',
				states:  {
					select: {
						color: 'hsl(209, 75%, 54%)',
						borderWidth: 1,
						borderColor: 'white'
					}
				},
				point: {
					events: {
						click: onSelectionChange,
						mouseOver: onSelectionChange,
						mouseOut: onSelectionChange
					}
				}
			}
		},
		series: [{
			id: 'hr',
			data: hr.values,
			yAxis: 'hrAxis',
			visible: dataType === 'hr'
		}, {
			id: 'pace',
			data: pace.values,
			yAxis: 'paceAxis',
			visible: dataType === 'pace'
		}]
	})
}