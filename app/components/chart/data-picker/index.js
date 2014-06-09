/** @jsx React.DOM */
var React = require('react')

module.exports = React.createClass({
	displayName: 'data-picker',
	getDefaultProps: function() {
		return {
			value: 'hr',
			onChange: function() {}
		}
	},
	render: function() {
		var value = this.props.value
		var onChange = this.props.onChange
		var classes = 'chart__button data-picker__button'
		return (
			<div className='data-picker'>
				<button className={classes} onClick={onChange.bind(null, 'hr')} disabled={value == 'hr'}>HR</button>
				<button className={classes} onClick={onChange.bind(null, 'pace')} disabled={value == 'pace'}>Pace</button>
			</div>
		)
	}
})