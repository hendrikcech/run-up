/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
var Router = require('react-router').Router
var UserPanel = require('../../components/user-panel')
var Panel = UserPanel.Panel
var Item = UserPanel.Item

module.exports = React.createClass({
	displayName: 'user',
	propTypes: {
		profiles: React.PropTypes.object.isRequired,
		data: React.PropTypes.object.isRequired,
		params: React.PropTypes.shape({
			entity: React.PropTypes.string,
			id: React.PropTypes.string
		}).isRequired
	},
	getInitialState: function() {
		return {}
	},
	wlz: function(d) { // withLeadingZero
		var str = d.toString()
		if(str.length < 2) {
			return '0' + str
		}
		return str
	},
	activitiesInWeek: function(data, week) {
		return data.reduce(function(memo, d) {
			if(d.week == week) memo.push(d)
			return memo
		}, [])
	},
	getWeeks: function(userData) {
		// add properties for convinience
		// week: {year}{week}; example: 201424
		var data = Object.keys(userData).map(function(id) {
			var d = userData[id]
			d.id = id
			d.date = moment(d.startTime)
			d.week = Number(d.date.year() + '' + this.wlz(d.date.isoWeek()))
			return d
		}, this)

		// generate sorted array with weeks; example: [201424, 201423, 201420]
		var weeks = data.reduce(function(memo, d) {
			if(memo.indexOf(d.week) === -1) memo.push(d.week)
			return memo
		}, []).sort(function(a, b) {
			return b - a
		})

		var current = {}
		var Weeks = []
		for(var i=0; i<weeks.length; i++) {
			var afterHeader = false
			var week = weeks[i]

			// at least one empty week between current and last one? insert fold
			if(weeks[i-1] - week > 1) {
				Weeks.push(<Fold key={week+'-fold'} />)
				afterHeader = true
			}

			// is this week the first of a new month or year? insert header
			var m = moment(week, 'YYYYWW')
			if(m.month() !== current.month || m.year() !== current.year) {
				current = { month: m.month(), year: m.year() }
				var name = m.format('MMMM YYYY')
				Weeks.push(<div key={name} className='calendar__week-header'><h2>{name}</h2></div>)
				afterHeader = true
			}

			// add all activities in current week to object
			// { weekday(number): activityobject, ... }
			var activities = this.activitiesInWeek(data, week)
			var activeWeekDays = activities.reduce(function(memo, activity) {
				memo[activity.date.isoWeekday()] = activity
				return memo
			}, {})

			// add seven days to array
			var params = this.props.params
			var days = []
			for(var d = 1; d < 8; d++) {
				var day = activeWeekDays[d] || { date: moment(d +'-'+ week, 'E-YYYYWW') }
				days.push(
					<Day key={d +'-'+ week} date={day.date} entity={params.entity} id={day.id} />
				)
			}

			// push current week to array
			Weeks.push(<Week key={week} afterHeader={afterHeader}>{days}</Week>)
		}

		return Weeks
	},
	render: function() {
		var params = this.props.params
		var userData = this.props.data[params.entity] || {}
		var weeks = this.getWeeks(userData)
		var profile = this.props.profiles[params.entity] || {}
		var distance = Object.keys(userData).reduce(function(memo, key) {
			return memo + userData[key].distance
		}, 0)
		return (
			<div>
				<Panel className='panel' avatar={profile.avatar} name={profile.name}>
					<Item key='Runs' value={Object.keys(userData).length} />
					<Item key='Distance' value={Math.round(distance / 10) / 100} />
				</Panel>
				<div className='panel'>
					{weeks}
				</div>
			</div>
 		)
	}
})

var Day = React.createClass({
	propTypes: {
		date: React.PropTypes.object,
		entity: React.PropTypes.string,
		id: React.PropTypes.string
	},
	onClick: function() {
		if(!this.props.id) return
		Router.transitionTo('run', { entity: this.props.entity, id: this.props.id })
	},
	render: function() {
		if(this.props.id) {
			var activeClass = 'calendar__day-active'
		}
		var label = this.props.date.format('DD')
		return (
			<div className={'calendar__day '+ (activeClass || '')} onClick={this.onClick}>
				{label || 'No date'}
			</div>
		)
	}
})

var Week = React.createClass({
	render: function() {
		var h = this.props.afterHeader
		return (
			<div className={'calendar__week ' + (h ? 'calendar__week--after-header' : '')}>
				<div className='calendar__weeks-items'>
					{this.props.children}
				</div>
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