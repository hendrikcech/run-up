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
		return { range: 1000 }
	},
	componentDidMount: function() {
		var self = this
		this.chart = new Highcharts.Chart({
			chart: {
				renderTo: this.getDOMNode(),
				type: 'column',
				// height:
			},
			title: { text: '' },
			tooltip: {
				headerFormat: '',
				pointFormat: '<span style="color:{series.color}"><b>{point.y}</b><br/>'
			},
			xAxis: {},
			yAxis: { title: { text: 'Heart Rate' } },
			legend: {
				enabled: false
			},
			plotOptions: {
				column: {
					pointPadding: null,
					groupPadding: null,
					borderWidth: 1,
					borderColor: 'white',
					allowPointSelect: true
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

		window.r = self.chart.redraw
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
	onSelectionChange: function(e) {
		e.preventDefault()
		var self = this
		process.nextTick(function() {
			var range = self.state.range
			var selected = self.chart.getSelectedPoints().map(function(point) {
				return [point.x, range]
			})
			if(e.type === 'mouseOver') {
				selected.push([e.target.x, range])
			}
			self.props.onSelectionChange(selected) // [start, length]
		})
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		// return this.props !== nextProps || this.state !== nextState
		return false
	},

	render: function() {
		if(this.chart) {
			var d = this.getGroupedData()
			// this.chart.series[0].setData(d, true)
			this.chart.series[0].data = d
			this.chart.redraw()
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