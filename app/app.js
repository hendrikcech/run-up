/** @jsx React.DOM */
global.React = require('react')
var attachFastClick = require('fastclick')
var Cortex = require('cortexjs')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Link = ReactRouter.Link

var User = require('./pages/user')
var Run = require('./pages/run')

var profiles = { hendrik: require('./profile.json') }

var Model = require('./model')
var fs = require('fs')

var runs = {
	'hendrik': {
		0: new Model(require('./data/1.json')),
		1: new Model(require('./data/3.json')),
		2: new Model(require('./data/4.json')),
		3: new Model(require('./data/5.json')),
		4: new Model(require('./data/6.json')),
		5: new Model(require('./data/7.json')),
		6: new Model(require('./data/8.json')),
		7: new Model(require('./data/9.json'))
	}
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

window.cortex = new Cortex({ runs: runs, profiles: profiles })

var router = Router(
	<Route handler={App}>
		<Route name='index' path='/' handler={Index} />
		<Route name='user' path='/:entity' handler={User} data={cortex.runs.val()} profiles={cortex.profiles.val()} />
		<Route name='run' path='/:entity/:id' handler={Run} data={cortex.runs.val()} profiles={cortex.profiles.val()} />
	</Route>
)

router.renderComponent(document.body)

cortex.on('update', function() {
	console.log('cortex update')
	router.renderComponent(document.body)
})