/** @jsx React.DOM */
global.React = require('react')

var processGeoJSON = require('./process.js')

var Info = require('./components/info')
var Graph = require('./components/graph')
var Map = require('./components/map')

var profile = require('./profile.json')
var run = require('./run.json')

var App = React.createClass({
	getInitialState: function() {
		return { data: processGeoJSON(this.props.geoJSON) }
	},
	componentWillReceiveProps: function() {
		this.setState({ data: processGeoJSON(this.props.geoJSON) })
	},

	render: function() {
		window.state = this.state
		return (
			<div className='container'>
				<Info data={this.state.data} profile={this.props.profile} />
				<Graph data={this.state.data} />
				<Map geoJSON={this.props.geoJSON} />
			</div>
		)
	}
})

React.initializeTouchEvents(true)
React.renderComponent(<App geoJSON={run} profile={profile}/>, document.body)