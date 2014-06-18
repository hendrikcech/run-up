/** @jsx React.DOM */
var React = require('react')
var UserPanel = require('../../components/user-panel')
var Run = require('../../data/run')
var Panel = UserPanel.Panel
var Item = UserPanel.Item
var Calendar = require('../../components/calendar')

module.exports = React.createClass({
	displayName: 'user',
	propTypes: {
		getProfile: React.PropTypes.func.isRequired,
		getRuns: React.PropTypes.func.isRequired,
		params: React.PropTypes.shape({
			entity: React.PropTypes.string,
			id: React.PropTypes.string
		}).isRequired
	},
	
	render: function() {
		var params = this.props.params
		var data = this.props.getRuns(params.entity)
		for(var key in data) {
			data[key] = new Run(data[key])
		}
		var profile = this.props.getProfile(params.entity)
		var distance = Object.keys(data).reduce(function(memo, key) {
			return memo + data[key].distance
		}, 0)
		return (
			<div>
				<Panel className='panel' avatar={profile.avatar} name={profile.name}>
					<Item key='Runs' value={Object.keys(data).length} />
					<Item key='Distance' value={Math.round(distance / 10) / 100} />
				</Panel>
				<Calendar className='panel' data={data} entity={params.entity} />
			</div>
 		)
	}
})