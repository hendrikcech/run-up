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
			range: 1000,
			chart: { series: [{ setData: function() {} }]},
			supportsTouch: 'ontouchstart' in window
		}
	},
	componentDidMount: function() {
		var hr = this.props.model.data.hr
		this.state.chart = new Highcharts.Chart({
			chart: {
				renderTo: this.getDOMNode(),
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
	onRangeChange: function(e) {
		console.log(this.refs.range.getDOMNode().value)
		this.setState({ range: this.refs.range.getDOMNode().value })
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
		// return this.props !== nextProps || this.state !== nextState
		return false
	},

	render: function() {
		this.state.chart.series[0].setData(this.getGroupedData(), true)
		return (
			<div className='panel graph'>
				<div className='graph__toolbar'>
					<Range onChange={this.onRangeChange} ref='range' className='graph__range' />
					{this.state.range}
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
			max: 3000,
			value: 1000,
			onChange: function() {}
		}
	},
	getInitialState: function() {
		return {
			// step: this.getStep(this.props.value),
			step: 250,
			value: this.props.value
		}
	},
	getStep: function(value) {
		var val = value || this.refs.input.getDOMNode().value
		var step = val
		if(step > 1000) {
			step = 1000
		}
		return step
	},
	onChange: function(e) {
		// this.setState({ step: this.getStep() })
		this.props.onChange(e)
	},
	render: function() {
		return (
			<input type='range' min={this.props.min} max={this.props.max}
				onChange={this.onChange} ref='input'
				step={this.state.step} value={this.state.value} />
		)
	}
})