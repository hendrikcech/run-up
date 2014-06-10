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
	sortByDate: function(data) {
		return data.map(function(d) {
			d.date = moment(d.date, 'DD.MM.YYYY')
			return d
		}).sort(function(a, b) {
			return b.date.unix() - a.date.unix()
		})
	},
	activitiesInWeek: function(data, week) {
		return data.reduce(function(memo, d) {
			if(d.date.isoWeek() === Number(week)) memo.push(d)
			return memo
		}, [])
	},
	split: function(str) {
		var s = str.split('-')
		return { year: Number(s[0]), week: Number(s[1]) }
	},
	render: function() {
		var data = this.sortByDate(this.state.data)

		var weeks = {}
		for(var i=0; i<data.length; i++) {
			if(Object.keys(weeks).length === 7) break
			var week = data[i].date.year() + '-' + data[i].date.isoWeek()
			weeks[week] = true
		}

		weeks = Object.keys(weeks).sort(function(a, b) {
			return b - a
		})

		var month = null
		var Weeks = []
		for(var i=0; i<weeks.length; i++) {
			var split = this.split(weeks[i])
			var week = split.week
			var year = split.year
			var afterHeader = false

			if(i > 0) {
				var prev = this.split(weeks[i-1])
				if(prev.year < year) {
					if(prev.week < 52) {
						doIt()
					}
					if(week === 1) {
						doIt()
					}
				} else {
					if(prev.week - week > 1) {
						doIt()
					}
				}
			 	
			 	function doIt() {
					Weeks.push(<Fold />)
					afterHeader = true
				}
			}
			if(moment(week, 'W').month() !== month) {
				var m = moment(week, 'W')
				month = m.month()
				var name = m.format('MMMM YYYY')
				Weeks.push(<div className='calendar__week-header'><h2>{name}</h2></div>)
				afterHeader = true
			}

			var activities = this.activitiesInWeek(data, week)
			var activeWeekDays = {}
			activities.forEach(function(activity) {
				activeWeekDays[activity.date.isoWeekday()] = activity
			})

			var days = []
			for(var d=1; d<8; d++) {
				days.push(<Day data={activeWeekDays[d]} />)
			}

			// var dayArray = [1, 2, 3, 4, 5, 6, 7]
			// var days = dayArray.map(function(day) {
				// return <Day data={activeWeekDays[activeWeekDays.indexOf(day)]} />
			// })
			console.log(activities, activeWeekDays, days)
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
			console.log(this.props.data)
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