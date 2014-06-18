/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
var Router = require('react-router').Router

module.exports = React.createClass({
	displayName: 'calendar',
	propTypes: {
		data: React.PropTypes.object.isRequired
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
	render: function() {
		// add properties for convinience
		// week: {year}{week}; example: 201424
		var data = Object.keys(this.props.data).map(function(id) {
			var d = this.props.data[id]
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
			var days = []
			for(var d = 1; d < 8; d++) {
				var day = activeWeekDays[d] || { date: moment(d +'-'+ week, 'E-YYYYWW') }
				days.push(
					<Day key={d +'-'+ week} date={day.date} entity={this.props.entity} id={day.id} />
				)
			}

			// push current week to array
			Weeks.push(<Week key={week} afterHeader={afterHeader}>{days}</Week>)
		}

		return <div className={this.props.className} >{Weeks}</div>
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
		if(this.props.empty) {
			var modClass = 'calendar__day-empty'
		}
		if(this.props.id) {
			var modClass = 'calendar__day-active'
		}
		var label = this.props.date ? this.props.date.format('DD') : ''
		return (
			<div className={'calendar__day '+ (modClass || '')} onClick={this.onClick}>
				{label}
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
	getWeek: function() {
		var days = []
		for(var d = 1; d < 8; d++) {
			var day = 
			days.push(<Day empty={true} />)
		}
		return days
	},
	render: function() {
		return (
			<div className='calendar__fold'>
				<div className='calendar__fold-item'>
					<div className='calendar__fold-side calendar__fold-top calendar__weeks-items'>
						{this.getWeek()}
					</div>
					<div className='calendar__fold-side calendar__fold-bottom calendar__weeks-items'>
						{this.getWeek()}
					</div>
				</div>
			</div>
		)
	}
})