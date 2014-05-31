/** @jsx React.DOM */
global.React = require('react')
var attachFastClick = require('fastclick')

var Model = require('./model.js')

var Info = require('./components/info')
var Graph = require('./components/graph')
var Map = require('./components/map')

var profile = require('./profile.json')
var run = require('./run2.json')

var App = React.createClass({
	getInitialState: function() {
		return { selection: [] }
	},
	changeSelection: function(selection) {
		this.setState({ selection: selection })
	},

	render: function() {
		return (
			<div className='container'>
				<Info data={this.props.data} profile={this.props.profile} />
				<Map data={this.props.data} selection={this.state.selection} />
				<Graph data={this.props.data}
					onSelectionChange={this.changeSelection} />
			</div>
		)
	}
})

var model = new Model(run)

attachFastClick(document.body)
React.initializeTouchEvents(true)
React.renderComponent(<App data={model} profile={profile}/>, document.body)