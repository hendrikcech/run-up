var Flo = require('fb-flo')
var http = require('http')
var fs = require('fs')
var rework = require('rework')
var reworkNPM = require('rework-npm')
var autoprefixer = require('autoprefixer')
var watchify = require('watchify')
var reactify = require('reactify')

var flo = Flo('./app/', {
	port: 8888,
	host: 'localhost',
	verbose: false,
	glob: ['**/*.js', '**/*.css']
}, function(path, cb) {
	// if(path.match(/\.js$/)) {
	if(path.match(/\.css$/)) {
		cb({
			resourceURL: 'css',
			content: '',
			reload: true
		})
		// var css = bundleCSS()
		// cb({
		// 	resourceURL: 'http://localhost:8000/bundle.css',
		// 	contents: css
		// })
	}
})

var w = watchify(__dirname + '/app/app.js')
	.transform(reactify)
	.on('log', console.log)
	.on('update', function() {
		flo.server.broadcast({
			match: 'indexOf',
			contents: '',
			resourceURL: 'blabla',
			reload: true
		})	
	})

function bundleJS(cb) {
	return w.bundle({ debug: true }, cb)
		.on('error', function(err) {
			console.error(err)
		})
}
bundleJS().on('data', function() {})

function bundleCSS() {
	var cssStr = fs.readFileSync(__dirname + '/app/style.css').toString()
	var css = rework(cssStr)
		.use(reworkNPM({
			dir: __dirname + '/app',
			shim: { 'leaflet': 'dist/leaflet.css' }
		})).toString()
	return autoprefixer.process(css).css
}

var server = http.createServer(function(req, res) {
	console.log(req.url)
	switch(req.url) {
	case '/bundle.js':
		res.setHeader('content-type', 'application/javascript')
		bundleJS().pipe(res)
	break
	case '/bundle.css':
		res.setHeader('content-type', 'text/css')
		try {
			var css = bundleCSS()
			res.end(css)
		} catch(err) {
			console.error(err.stack)
			res.end()
		}
	break
	case '/highcharts.js':
		res.setHeader('content-type', 'application/javascript')
		fs.createReadStream(__dirname + '/app/vendor/highcharts-custom.js')
			.pipe(res)
	break
	default:
		res.setHeader('content-type', 'text/html')
		fs.createReadStream(__dirname + '/app/index.html').pipe(res)
	}
})

var port = process.env.PORT || 8300
server.listen(port)
console.log('listening on :' + port)