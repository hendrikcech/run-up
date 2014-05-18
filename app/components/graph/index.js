/** @jsx React.DOM */
var React = require('react')

module.exports = React.createClass({
	displayName: require('./package.json').name,
	componentDidMount: function() {

	},
	render: function() {
		return (
			<div className='panel graph'>
				<img src='https://i.cloudup.com/iXP-zVQ2ZJ-3000x3000.png' />
			</div>
		)
	}
})