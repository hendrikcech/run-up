/** @jsx React.DOM */
var React = require('react')
//require('highcharts')

module.exports = React.createClass({
	displayName: require('./package.json').name,
	getDefaultProps: function() {
		return {
			// data: { points: [] }
			model: {}
		}
	},
	getInitialState: function() {
		return {
			range: 500,
			// chart: {},
			supportsTouch: 'ontouchstart' in window
		}
	},
	componentDidMount: function() {
		var hr = this.props.model.data.hr
		this.state.chart = new Highcharts.Chart({
			chart: {
				renderTo: 'graph',
				type: 'column',
				// height:
			},
			title: { text: '' },
			tooltip: {
				headerFormat: '',
				pointFormat: '<span style="color:{series.color}"><b>{point.y}</b><br/>',
				animation: false
			},
			xAxis: {},
			yAxis: {
				title: { text: 'Heart Rate' },
				floor: hr.avg - 20, ceiling: hr.avg + 15,
				min: hr.min, max: hr.max
			},
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
					pointPlacement: 'between'
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
							click: this.onSelectionChange,
							mouseOver: this.onSelectionChange,
							mouseOut: this.onSelectionChange
						}
					}
				}
			},
			series: [{ name: 'HR', data: this.getGroupedData() }]
		})
	},
	/*returns [distance in km, average hr in segment]*/
	getGroupedData: function() {
		var model = this.props.model
		var range = this.state.range
		var res = []
		for(var start = 0; start < model.data.distance; start += range) {
			var hr = model.getHR(model.getSegment([start, range]))
			res.push([start, hr])
		}
		return res
	},
	onRangeChange: function(newRange) {
		this.setState({ range: newRange })
	},
	onSelectionChange: function(e, nextTick) {
		if(!nextTick) {
			return process.nextTick(this.onSelectionChange.bind(null, e, true))
		}

		var selected = this.state.chart.getSelectedPoints().map(function(point) {
			return [point.x, this.state.range]
		}, this)

		if(e.type === 'mouseOver') {
			if(this.state.supportsTouch) { // touch screen?
				var selected = []
			}
			selected.push([e.target.x, this.state.range])
		}

		this.props.onSelectionChange(selected) // [start, length]
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return this.state.range !== nextState.range
	},

	render: function() {
		console.log('redraw')
		if(this.state.chart) {
			this.state.chart.series[0].setData(this.getGroupedData(), true, true, false)
		}
		return (
			<div className='panel graph'>
				<div className='graph__toolbar'>
					<Range onChange={this.onRangeChange} value={this.state.range} />
				</div>
				<div id='graph' />
			</div>
		)
	}
})

var Range = React.createClass({
	getDefaultProps: function() {
		return {
			min: 250,
			max: 8000,
			value: 1000,
			onChange: function() {}
		}
	},
	onMinus: function() {
		var props = this.props
		var newValue = props.value / 2
		props.onChange(newValue > props.min ? newValue : props.min)
	},
	onPlus: function() {
		var props = this.props
		var newValue = props.value * 2
		props.onChange(newValue < props.max ? newValue : props.max)
	},
	render: function() {
		var props = this.props
		return (
			<div className='graph__range'>
				<button onClick={this.onMinus} disabled={props.value === props.min}
					className='graph__range-button'>-</button>
				<span className='graph__range-value'>{this.props.value}</span>
				<button onClick={this.onPlus} disabled={props.value === props.max}
					className='graph__range-button'>+</button>
			</div>
		)
	}
})