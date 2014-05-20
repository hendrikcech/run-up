/** @jsx React.DOM */
global.React = require('react')

var Model = require('./model.js')

var Info = require('./components/info')
var Graph = require('./components/graph')
var Map = require('./components/map')

var profile = require('./profile.json')
var run = require('./run.json')

var App = React.createClass({
	getInitialState: function() {
		this.model = new Model(this.props.geoJSON)
		return {
			data: this.model.data,
			selected: null
		}
	},
	componentWillReceiveProps: function() {
		this.setState({ data: convertGeoJSON(this.props.geoJSON) })
	},

	render: function() {
		window.state = this.state
		return (
			<div className='container'>
				<Info data={this.state.data} profile={this.props.profile} />
				<Map selected={this.state.selected} model={this.model} />
				<Graph data={this.state.data} />
			</div>
		)
	}
})

React.initializeTouchEvents(true)
React.renderComponent(<App geoJSON={run} profile={profile}/>, document.body)