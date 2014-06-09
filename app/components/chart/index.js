/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
var Chart = require('./chart')
var RangePicker = require('./range-picker')
var DataPicker = require('./data-picker')

module.exports = React.createClass({
	displayName: 'chart',
	getDefaultProps: function() {
		return { data: {} }
	},
	getInitialState: function() {
		return {
			range: 1000,
			// chart: {},
			dataType: 'hr',
			hrExtremes: {},
			paceExtremes: {},
			supportsTouch: 'ontouchstart' in window
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return this.state !== nextState
	},
	componentWillUnmount: function() {
		this.state.chart.destroy()
	},
	componentDidMount: function() {
		var dataType = this.state.dataType
		var hr = minMax(this.groupData(this.props.data.getHR))
		var pace = minMax(this.groupData(this.props.data.getPace))

		function minMax(values) {
			var list = values.map(function(v) { return v[1] })
			return {
				values: values,
				min: Math.min.apply(null, list),
				max: Math.max.apply(null, list)
			}
		}

		this.state.chart = Chart('chart', this.onSelectionChange, dataType, hr, pace) 
		// this.showSelectedDataType()
		window.c = this.state.chart
	},
	/*returns [distance in km, average value in segment]*/
	groupData: function(dataFn) {
		var data = this.props.data
		var range = this.state.range
		var res = []
		for(var start = 0; start < data.distance; start += range) {
			var segment = data.getSegment([start, range])
			var value = dataFn(segment)
			res.push([start, value])
		}
		return res
	},
	showSelectedDataType: function() {
		var chart = this.state.chart
		var data = this.props.data
		if(!chart) return
		var hr = chart.get('hr'), pace = chart.get('pace')
		var hrVisible = this.state.dataType === 'hr'
		hr.setVisible(hrVisible, false)
		pace.setVisible(!hrVisible, false)
		hr.setData(this.groupData(data.getHR), false, false, false)
		pace.setData(this.groupData(data.getPace), true, false, false)
	},
	onRangeChange: function(newRange) {
		this.setState({ range: newRange })
	},
	onDataTypeChange: function(type) {
		this.setState({ dataType: type })
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

	render: function() {
		console.log('redraw')
		this.showSelectedDataType()
		var classes = this.props.className ? [this.props.className] : []
		classes.push('chart')
		return (
			<div className={classes.join(' ')}>
				<div className='chart__toolbar'>
					<RangePicker onChange={this.onRangeChange} value={this.state.range} />
					<DataPicker onChange={this.onDataTypeChange} value={this.state.dataType} />
				</div>
				<div id='chart' />
			</div>
		)
	}
})