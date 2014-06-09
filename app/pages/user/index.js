/** @jsx React.DOM */
var React = require('react')
// var Header = require('./header')
var UserPanel = require('../../components/user-panel')
var Panel = UserPanel.Panel
var Item = UserPanel.Item

module.exports = React.createClass({
	displayName: 'user',
	propTypes: {
		profile: React.PropTypes.shape({
			avatar: React.PropTypes.string,
			name: React.PropTypes.string
		}).isRequired
	},
	getInitialState: function() {
		return {}
	},
	render: function() {
		var profile = this.props.profile
		return (
			<div>
				<Panel className='panel' avatar={profile.avatar} name={profile.name}>
					<Item key='Runs' value={13} />
					<Item key='Distance' value={117} />
				</Panel>
				<div className='panel'>
					<Week>
						<Day />
						<Day />
						<Day active={true} />
						<Day />
						<Day />
						<Day active={true} />
						<Day />
					</Week>
					<Week>
						<Day active={true} />
						<Day />
						<Day />
						<Day />
						<Day />
						<Day />
						<Day />
					</Week>
					<Fold />
					<Week>
						<Day />
						<Day />
						<Day active={true} />
						<Day />
						<Day active={true} />
						<Day active={true} />
						<Day />
					</Week>
				</div>
			</div>
 		)
	}
})

var Day = React.createClass({
	render: function() {
		var active = this.props.active ? 'calendar__day-active' : ''
		return (
			<div className={'calendar__day '+ active}>Run</div>
		)
	}
})

var Week = React.createClass({
	render: function() {
		return (
			<div className='calendar__week'>
				<div className='calendar__week-header' />
				{this.props.children}
			</div>
		)
	}
})

var Fold = React.createClass({
	render: function() {
		return (
			<div className='calendar__fold'>
				<div className='calendar__fold-item'>
					<div className='calendar__fold-side calendar__fold-top'></div>
					<div className='calendar__fold-side calendar__fold-bottom'></div>
				</div>
			</div>
		)
	}
})