/** @jsx React.DOM */
var React = require('react')
//require('highcharts')

module.exports = React.createClass({
	displayName: require('./package.json').name,
	getDefaultProps: function() {
		return {
			data: { points: [] }
		}
	},
	getInitialState: function() {
		return { range: 1000 }
	},
	getGroupedData: function() { // in meters
		var data = this.props.data
		var res = []
		var currentDistance = 0
		var hrTotal = 0
		var hrPoints = 0
		var i = 1
		data.points.forEach(function(point) {
			hrTotal += point.hr
			hrPoints++
			if((currentDistance += point.length) >= this.state.range) {
				res.push([
					Math.round(point.distance) / 1000,
					Math.round(hrTotal / hrPoints)
				])
				currentDistance = hrTotal = hrPoints = 0
				i++
			}
		}, this)
		return res
	},
	componentDidMount: function() {
		var self = this
		this.chart = new Highcharts.Chart({
			chart: {
				renderTo: 'graph',
				type: 'column'
			},
			title: { text: '' },
			tooltip: {
				headerFormat: '',
				pointFormat: '<span style="color:{series.color}"><b>{point.y}</b><br/>'
			},
			xAxis: {
				title: { text: 'km' },
				// categories: ['km']
				// type: 'categories'
			},
			yAxis: {
				title: { text: 'Heart Rate' }
			},
			legend: {
				enabled: false
			},
			plotOptions: {
				column: {
					pointPadding: 0,
					groupPadding: 0,
					borderWidth: 1
				},
				series: {
					cursor: 'pointer',
					point: {
						events: {
							click: function(e) {
								self.onColumnClick(e, this)							}
						}
					}
				}
			},
			series: [{ name: 'HR', data: this.getGroupedData() }]
		})
	},
	onRangeChange: function(e) {
		console.log(this.refs.range.getDOMNode().value)
		this.setState({ range: this.refs.range.getDOMNode().value })
	},
	onColumnClick: function(e, point) {
		console.log(e)
		console.log(point)
	},

	render: function() {
		if(this.chart) {
			this.chart.series[0].setData(this.getGroupedData())
		}
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