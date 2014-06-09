/** @jsx React.DOM */
var React = require('react')

module.exports =  React.createClass({
	displayName: 'range-picker',
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
		var buttonClass = 'chart__button range-picker__button'
		return (
			<div className='range-picker'>
				<button onClick={this.onMinus} disabled={props.value === props.min}
					className={buttonClass}>-</button>
				<span className='range-picker__value'>{this.props.value}</span>
				<button onClick={this.onPlus} disabled={props.value === props.max}
					className={buttonClass}>+</button>
			</div>
		)
	}
})