/** @jsx React.DOM */
global.React = require('react')
var attachFastClick = require('fastclick')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Link = ReactRouter.Link

var Model = require('./model.js')

var User = require('./pages/user')
var Run = require('./pages/run')

var profile = require('./profile.json')
var run = require('./run2.json')

var App = React.createClass({
	render: function() {
		return (
			<div>
				<Link to='index'>Index</Link>
				<Link to='run'>Run</Link>
				<div className='container'>
					{this.props.activeRoute}
				</div>
			</div>
		)
	}
})

var model = new Model(run)

attachFastClick(document.body)
React.initializeTouchEvents(true)

Router(
	<Route handler={App}>
		<Route name="index" path="/" handler={User} profile={profile} />
		<Route name="run" path="run" handler={Run} data={model} profile={profile} />
	</Route>
).renderComponent(document.body)