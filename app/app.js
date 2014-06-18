/** @jsx React.DOM */
global.React = require('react')
var attachFastClick = require('fastclick')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Link = ReactRouter.Link

var User = require('./pages/user')
var Run = require('./pages/run')

var profiles = { hendrik: require('./profile.json') }
var runs = {
	'hendrik': {
		0: require('./data/1.json'),
		1: require('./data/3.json'),
		2: require('./data/4.json'),
		3: require('./data/5.json'),
		4: require('./data/6.json'),
		5: require('./data/7.json'),
		6: require('./data/8.json'),
		7: require('./data/9.json')
	}
}

function getUserRuns(entity) {
	if(!runs[entity]) return {}
	return JSON.parse(JSON.stringify(runs[entity]))
}
function getRun(entity, id) {
	if(!runs[entity] || !runs[entity][id]) return {}
	return JSON.parse(JSON.stringify(runs[entity][id]))
}

function getProfile(entity) {
	return profiles[entity] || {}
}

var App = React.createClass({
	render: function() {
		return (
			<div>
				<Link to='index'>Index</Link>
				<Link to='user' entity='hendrik'>User</Link>
				<Link to='run' entity='hendrik' id={1}>Run</Link>
				<div className='container'>
					{this.props.activeRoute}
				</div>
			</div>
		)
	}
})

var Index = React.createClass({
	render: function() {
		return <h1>Index</h1>
	}
})

attachFastClick(document.body)
React.initializeTouchEvents(true)

var router = Router(
	<Route handler={App}>
		<Route name='index' path='/' handler={Index} />
		<Route name='user' path='/:entity' handler={User} getRuns={getUserRuns} getProfile={getProfile} />
		<Route name='run' path='/:entity/:id' handler={Run} getRun={getRun} getProfile={getProfile} />
	</Route>
)
router.renderComponent(document.body)