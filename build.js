var fs = require('fs')
var path = require('path')
var rework = require('rework')
var reworkNPM = require('rework-npm')
var autoprefixer = require('autoprefixer')
var browserify = require('browserify')
var watchify = require('watchify')
var reactify = require('reactify')
var exorcist = require('exorcist')
var uglify = require('uglify-js').minify
var concat = require('concat-stream')
var Gaze = require('gaze').Gaze

var joinDir = path.join.bind(path, __dirname)
var JS_IN = joinDir('/app/app.js')
var JS_MAIN_OUT = joinDir('/dist/main.js')
var JS_MODULES_OUT = joinDir('/dist/modules.js')
var HIGHCHARTS_IN = joinDir('/app/vendor/highcharts-custom.js')
var HIGHCHARTS_OUT = joinDir('/dist/highcharts-custom.js')
var CSS_IN = joinDir('/app/style.css')
var CSS_OUT = joinDir('/dist/bundle.css')

var watch = process.argv[2] === '-w'

/* process all the javascripts */
var externals = ['react', 'leaflet', 'moment', 'fastclick', 'gps-distance']

// app code bundle
var i = watch ? watchify : browserify
var b = i(JS_IN)
	.external(externals)
	.transform(reactify)
	.on('update', bundleJS)

function bundleJS() {
	var bundle = b.bundle({ debug: watch })
		.on('error', console.error.bind(console))

	if(watch) write(JS_MAIN_OUT, bundle)
	else minify(JS_MAIN_OUT, bundle)
}
bundleJS()

// module bundle
var m = browserify()
	.require(externals)
	.bundle({ debug: watch })
	.on('error', console.error.bind(console))

	if(watch) write(JS_MODULES_OUT, m)
	else minify(JS_MODULES_OUT, m)

// highcharts
minify(HIGHCHARTS_OUT, fs.createReadStream(HIGHCHARTS_IN))

function write(file, stream) {
	stream.pipe(fs.createWriteStream(file))
	stream.pipe(exorcist(file + '.map'))
	stream.on('finish', function() {
		console.log('%s written', path.basename(file))
	})
}

function minify(file, stream) {
	stream.pipe(concat({ encoding: 'string' }, function(js) {
		fs.writeFile(file, uglify(js, { fromString: true }).code, function(err) {
			if(err) console.error(err)
			else console.log('minified %s written', path.basename(file))
		})
	}))
}

/* css stuff */
function bundleCSS() {
	var cssStr = fs.readFileSync(CSS_IN).toString()
	var css = rework(cssStr)
		.use(reworkNPM({
			dir: path.dirname(CSS_IN),
			shim: { 'leaflet': 'dist/leaflet.css' }
		})).toString({ compress: !watch })
	fs.writeFile(CSS_OUT, autoprefixer.process(css).css, function(err) {
		if(err) console.error(err)
		else console.log((!watch ? 'minified ' : '') + 'css bundle written')
	})
}
bundleCSS()

if(watch) {
	var g = __dirname + '/app/**/*.css'
	var gaze = new Gaze(g)
	gaze.on('all', bundleCSS)
}