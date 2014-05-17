var http = require('http')
var fs = require('fs')
var rework = require('rework')
var reworkNPM = require('rework-npm')
var browserify = require('browserify')
var reactify = require('reactify')

var server = http.createServer(function(req, res) {
	console.log(req.url)
	dispatchReq(req.url, res)
})

function dispatchReq(url, res) {
	switch(url) {
	case '/bundle.js':
		res.setHeader('content-type', 'application/javascript')
		var b = browserify(__dirname + '/app/app.js').transform(reactify)
		var s = b.bundle({ debug: true })
			.on('error', function(err) {
				console.error(err)
			})
			.pipe(res)
	break
	case '/style.css':
		res.setHeader('content-type', 'text/css')
		var cssStr = fs.readFileSync(__dirname + '/app/style.css', { encoding: 'utf8'})
		try {
			res.end(rework(cssStr)
				.use(reworkNPM({ dir: __dirname + '/app', shim: { 'leaflet': 'dist/leaflet.css' }}))
				.toString())
		} catch(e) {
			console.error(e.source, e.stack)
			res.end()
		}
	break
	default:
		res.setHeader('content-type', 'text/html')
		fs.createReadStream(__dirname + '/app/index.html').pipe(res)
	}
}

var port = process.env.PORT || 8000
server.listen(port)
console.log('listening on :' + port)