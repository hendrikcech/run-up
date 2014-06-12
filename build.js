var fs = require('fs')
var path = require('path')
var rework = require('rework')
var reworkNPM = require('rework-npm')
var autoprefixer = require('autoprefixer')
var browserify = require('browserify')
var watchify = require('watchify')
var reactify = require('reactify')
var brfs = require('brfs')
var exorcist = require('exorcist')
var uglify = require('uglify-js').minify
var concat = require('concat-stream')
var chokidar = require('chokidar')

var joinDir = path.join.bind(path, __dirname)
var JS_IN = joinDir('/app/app.js')
var JS_MAIN_OUT = joinDir('/dist/main.js')
var JS_MODULES_OUT = joinDir('/dist/modules.js')
var HIGHCHARTS_IN = joinDir('/app/vendor/highcharts-custom.js')
var HIGHCHARTS_OUT = joinDir('/dist/highcharts-custom.js')
var CSS_IN = joinDir('/app/style.css')
var CSS_OUT = joinDir('/dist/bundle.css')
var DATA_IN = joinDir('/app/data')
var DATA_OUT = joinDir('/dist/data.js')

var watch = process.argv[2] === '-w'

process.on('uncaughtException', function(err) {
	console.error('uncaught!')
	console.error(err.stack)
	process.exit(1)
})

/* process all the javascripts */
var externals = ['react', 'leaflet', 'moment', 'fastclick', 'gps-distance']

var data = fs.readdirSync(DATA_IN).map(function(file) {
	return path.join(DATA_IN, file)
})

var d = browserify()
	.require(data)
	.bundle()
	.on('error', console.error.bind(console))

minify(DATA_OUT, d)

// app code bundle
var i = watch ? watchify : browserify
var b = i(JS_IN)
	.external(externals)
	.external(data)
	.transform(reactify)
	.transform(brfs)
	.on('error', console.error.bind(console))
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
	try {
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
	} catch(e) {
		console.error(e)
	}
}
bundleCSS()

if(watch) {
	var g = __dirname + '/app/**/*.css'
	var watcher = chokidar.watch('app', {
		ignoreInitial: true,
		ignored: function(file) {
			var ext = path.extname(file)
			return (ext === '.css' || ext === '') ? false : true
		}
	})
	watcher.on('error', console.error.bind(console))
	watcher.on('all', bundleCSS)
}