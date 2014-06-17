/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')

exports.Panel = React.createClass({
	displayName: 'user-panel',
	propTypes: {
		time: React.PropTypes.string,
		avatar: React.PropTypes.string.isRequired,
		name: React.PropTypes.string.isRequired
	},

	render: function() {
		var props = this.props
		var classes = this.props.className ? [this.props.className] : []
		classes.push('user-panel')
		var time = props.time ? moment(props.time).format('DD.MM.YYYY') : ''
		return (
			<div className={classes.join(' ')}>
				<div className='user-panel__top'>
					<div className='user-panel__avatar'>
						<img className='user-panel__avatar-img' src={props.avatar} height={100} width={100} />
					</div>
					<div className='user-panel__list'>
						<h1 className='user-panel__name'>{props.name}</h1>
						<span>{time}</span>
					</div>
				</div>
				<div className='user-panel__bottom'>
					{this.props.children}
				</div>
			</div>
		)
	}
})

exports.Item = React.createClass({
	displayName: 'user-panel-item',
	propTypes: {
		key: React.PropTypes.string.isRequired,
		value: React.PropTypes.any.isRequired
	},
	render: function() {
		return (
			<div className='user-panel__item'>
				<span className='user-panel__item-value'>{this.props.value}</span>
				<span className='user-panel__item-label'>{this.props.key}</span>
			</div>
		)
	}
})


