/** @jsx React.DOM */
global.React = require('react')
var attachFastClick = require('fastclick')

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
			selection: []
		}
	},
	componentWillReceiveProps: function() {
		this.setState({ data: convertGeoJSON(this.props.geoJSON) })
	},
	changeSelection: function(selection) {
		this.setState({ selection: selection })
	},

	render: function() {
		window.state = this.state
		return (
			<div className='container'>
				<Info data={this.state.data} profile={this.props.profile} />
				<Map selection={this.state.selection} model={this.model} />
				<Graph onSelectionChange={this.changeSelection} model={this.model} />
			</div>
		)
	}
})

attachFastClick(document.body)
React.initializeTouchEvents(true)
React.renderComponent(<App geoJSON={run} profile={profile}/>, document.body)