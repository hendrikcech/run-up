/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
var UserPanel = require('../../components/user-panel')
var Panel = UserPanel.Panel
var Item = UserPanel.Item
var Chart = require('../../components/chart')
var Map = require('../../components/map')

module.exports = React.createClass({
	displayName: 'run',
	propTypes: {
		data: React.PropTypes.object.isRequired,
		profiles: React.PropTypes.object.isRequired,
		params: React.PropTypes.shape({
			entity: React.PropTypes.string,
			id: React.PropTypes.string
		}).isRequired
	},
	getInitialState: function() {
		return { selection: [] }
	},
	changeSelection: function(selection) {
		this.setState({ selection: selection })
	},

	render: function() {
		var params = this.props.params
		var data = this.props.data[params.entity][params.id]
		var profile = this.props.profiles[params.entity]
		var distance = WTZ(Math.round(data.distance / 1000 * 100) / 100)
		var duration = moment.duration(data.duration, 'milliseconds')
		var pace = moment.duration(data.pace.avg, 'milliseconds')
		var hr = Math.round(data.hr.avg)
		return (
			<div>
				<Panel className='panel' avatar={profile.avatar} name={data.name} time={data.startTime}>
					<Item key='Distance' value={distance} />
					<Item key='Duration' value={WLZ(duration.asMinutes()) +':'+ WLZ(duration.seconds())} />
					<Item key='Pace' value={WLZ(pace.minutes()) +':'+ WLZ(pace.seconds())} />
					<Item key='Heart Rate' value={hr} />
				</Panel>
				<Map className='panel' data={data} selection={this.state.selection} />
				<Chart className='panel' data={data} onSelectionChange={this.changeSelection} />
			</div>
		)
	}
})

function WLZ(d) { // withLeadingZero
	var str = d.toString().split('.')[0]
	if(str.length < 2) {
		return '0' + str
	}
	return str
}
function WTZ(d) { // withTrailingZero
	var str = d.toString()
	if(str.indexOf('.') === -1) {
		return str + '.00'
	}
	if(str.split('.')[1].length < 2) {
		return str + '0'
	}
	return str
}