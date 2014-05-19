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
		return {
			mousePos: null,
			width: 700,
			height: 300
		}
	},
	componentDidMount: function() {
		this.setState({ 'width': this.getDOMNode().clientWidth })
		this.getDOMNode()
	},
	onPointerMove: function(e) {
		e.preventDefault()
		var x = e.clientX || e.touches[0].clientX
		this.setState({ 'mousePos': x - this.getDOMNode().offsetLeft })
	},
	onPointerLeave: function(e) {
		this.setState({ 'mousePos': null })
	},

	render: function() {
		var tupels = this.props.data.points.map(function(point) {
			return [point.time, point.hr]
		})

		var max = [
			tupels[tupels.length - 1][0],
			tupels.reduce(function(memo, val) {
				return Math.max(memo, val[1])
			}, 0)]
		var min = [
			0,
			tupels.reduce(function(memo, val) {
				return Math.min(memo, val[1])
			}, max[1])]
		var size = [this.state.width / max[0], this.state.height / (max[1] - min[1])]
		var scaleX = function(val) {
			return val * size[0]
		}
		var scaleY = function(val) {
			return (max[1] - val) * size[1]
		}
		var xToNode = function(x) {
			var time = x / size[0]
			var clostestPoint = []
			var closestVal = max[0]
			for(var i = 1; i < tupels.length - 1; i++) {
				var diff = Math.abs(tupels[i][0] - time)
				if(diff < closestVal) {
					closestVal = diff
					clostestPoint = tupels[i]
				} else {
					if(Math.abs(tupels[i-1][0] - time) > closestVal) {
						break
					}
				}
			}
			return clostestPoint
		}

		return (
			<div className='panel graph'>
				<svg width={this.state.width} height={this.state.height}
					onMouseMove={this.onPointerMove}
					onTouchMove={this.onPointerMove}
					onTouchStart={this.onPointerMove}
					// onMouseLeave={this.onPointerLeave}
					// onTouchEnd={this.onPointerLeave}
					>
					<Select pos={this.state.mousePos} xToNode={xToNode} scaleX={scaleX} scaleY={scaleY} />
					<Line data={tupels} scaleX={scaleX} scaleY={scaleY} />
				</svg>
			</div>
		)
	}
})

var Select = React.createClass({
	getDefaultProps: function() {
		return {
			pos: null,
			color: 'black',
			width: 20,
			height: 8,
			rx: 2,
			ry: 2
		}
	},

	render: function() {
		var props = this.props
		if(!props.pos) return <g />
		var path = 'M' + props.pos +','+ 0 +'\nL'+ props.pos +','+ props.height
		var circlePos = this.props.xToNode(props.pos)

		// <path d={path} stroke={props.color} strokeWidth={props.width} fill="none" />
		// <circle cx={props.scaleX(circlePos[0])} cy={props.scaleY(circlePos[1])} r="6" stroke="black" fill="black" />
		return (
			<g>
				<rect x={props.scaleX(circlePos[0])} y={props.scaleY(circlePos[1])} width={this.props.width} height={this.props.height} rx={this.props.rx} ry={this.props.ry} fill="black" />
				<text x={props.scaleX(circlePos[0])} y={props.scaleY(circlePos[1])}>
					152
				</text>
			</g>
		)
	}
})

var Line = React.createClass({
	getDefaultProps: function() {
		return {
			data: [], // contains [x, y]
			color: 'blue',
			width: 2
		}
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return false
	},
	onClick: function(e) {
		console.log(e)
	},

	render: function() {
		var scaleX = this.props.scaleX
		var scaleY = this.props.scaleY
		var path = this.props.data.reduce(function(memo, v, i) {
			if(i === 0) {
				return 'M' + scaleX(v[0]) +','+ scaleY(v[1])
			} else {
				return memo + '\nL' + scaleX(v[0]) +','+ scaleY(v[1])
			}
		}, '')

		return (
			<path d={path} stroke={this.props.color} strokeWidth={this.props.width} fill="none" />
		)
	}
})