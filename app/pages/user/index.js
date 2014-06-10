/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
var UserPanel = require('../../components/user-panel')
var Panel = UserPanel.Panel
var Item = UserPanel.Item

var data = [{
	id: 'no1',
	date: '08.06.2014'
}, {
	id: 'no2',
	date: '05.06.2014'
}, {
	id: 'no3',
	date: '06.06.2014'
}, {
	id: 'no4',
	date: '14.05.2014'
}, {
	id: 'no5',
	date: '08.05.2014'
}, {
	id: 'no6',
	date: '29.05.2014'
}, {
	id: 'no7',
	date: '09.06.2014'
}, {
	id: 'no8',
	date: '01.05.2014'
}, {
	id: 'no9',
	date: '30.04.2013'
}]

module.exports = React.createClass({
	displayName: 'user',
	propTypes: {
		profile: React.PropTypes.shape({
			avatar: React.PropTypes.string,
			name: React.PropTypes.string
		}).isRequired
	},
	getInitialState: function() {
		return { data: data }
	},
	processData: function(data) {
		return data.map(function(d) {
			d.date = moment(d.date, 'DD.MM.YYYY')
			d.week = Number(d.date.year() + '' + this.wlz(d.date.isoWeek()))
			return d
		}, this)
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
	split: function(str) {
		var s = str.split('-')
		return { year: Number(s[0]), week: Number(s[1]) }
	},
	render: function() {
		// add week property for easy sorting; format: {year}{week} - 201424
		var data = this.processData(this.state.data)

		// group data points by weeks
		var aweeks = {}
		for(var i=0; i<data.length; i++) {
			if(Object.keys(aweeks).length === 8) break
			aweeks[data[i].week] = true
		}

		// sort weeks: newest first
		var weeks = Object.keys(aweeks).sort(function(a, b) {
			return b - a
		})

		var current = {}
		var Weeks = []
		for(var i=0; i<weeks.length; i++) {
			var m = moment(weeks[i], 'YYYYWW')
			var afterHeader = false

			// at least one empty week between current and last one? insert fold
			if(weeks[i-1] - weeks[i] > 1) {
				Weeks.push(<Fold />)
				afterHeader = true
			}

			// is this week the first of a new month or year? insert header
			if(m.month() !== current.month || m.year() !== current.year) {
				current = { month: m.month(), year: m.year() }
				var name = m.format('MMMM YYYY')
				Weeks.push(<div className='calendar__week-header'><h2>{name}</h2></div>)
				afterHeader = true
			}

			// add all activities in current week to object
			// { weekday(number): activityobject }
			var activities = this.activitiesInWeek(data, weeks[i])
			var activeWeekDays = {}
			activities.forEach(function(activity) {
				activeWeekDays[activity.date.isoWeekday()] = activity
			})

			// add seven days to array
			var days = []
			for(var d=1; d<8; d++) {
				days.push(<Day data={activeWeekDays[d]} />)
			}

			// push current week to array
			Weeks.push(<Week afterHeader={afterHeader}>{days}</Week>)
		}

		var profile = this.props.profile
		return (
			<div>
				<Panel className='panel' avatar={profile.avatar} name={profile.name}>
					<Item key='Runs' value={13} />
					<Item key='Distance' value={117} />
				</Panel>
				<div className='panel'>
					{Weeks}
				</div>
			</div>
 		)
	}
})

var Day = React.createClass({
	render: function() {
		if(this.props.data) { // could be -1?
			var activeClass = 'calendar__day-active'
			var label = this.props.data.date.format('DD.MM.YYYY')
		}
		return (
			<div className={'calendar__day '+ (activeClass || '')}>{label || ''}</div>
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