/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
//require('highcharts')

module.exports = React.createClass({
	displayName: require('./package.json').name,
	getDefaultProps: function() {
		return {
			// data: { points: [] }
			data: {}
		}
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

		this.state.chart = new Highcharts.Chart({
			chart: {
				renderTo: 'graph',
				type: 'column',
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
			animation: false,
			xAxis: {},
			yAxis: [{
				id: 'hrAxis',
				type: 'linear',
				title: { text: 'Heart Rate' },
				floor: hr.min - 30, ceiling: hr.max + 10,
				showEmpty: false
			}, {
				id: 'paceAxis',
				title: { text: 'Pace' },
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
				animation: false,
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
			series: [{
				id: 'hr',
				name: 'HR',
				data: hr.values,
				yAxis: 'hrAxis',
				visible: dataType === 'hr'
			}, {
				id: 'pace',
				name: 'Pace',
				data: pace.values,
				yAxis: 'paceAxis',
				visible: dataType === 'pace'
			}]
		})
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
		return (
			<div className='panel graph'>
				<div className='graph__toolbar'>
					<RangePicker onChange={this.onRangeChange} value={this.state.range} />
					<DataTypePicker onChange={this.onDataTypeChange} value={this.state.dataType} />
				</div>
				<div id='graph' />
			</div>
		)
	}
})

var DataTypePicker = React.createClass({
	getDefaultProps: function() {
		return {
			value: 'hr',
			onChange: function() {}
		}
	},
	onClick: function(type) {
		this.props.onChange(type)
	},
	render: function() {
		var value = this.props.value
		var classes = 'graph__button graph__type-button'
		return (
			<div className='graph__type'>
				<button className={classes} onClick={this.onClick.bind(null, 'hr')} disabled={value == 'hr'}>HR</button>
				<button className={classes} onClick={this.onClick.bind(null, 'pace')} disabled={value == 'pace'}>Pace</button>
			</div>
		)
	}
})

var RangePicker = React.createClass({
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
					className='graph__button graph__range-button'>-</button>
				<span className='graph__range-value'>{this.props.value}</span>
				<button onClick={this.onPlus} disabled={props.value === props.max}
					className='graph__button graph__range-button'>+</button>
			</div>
		)
	}
})