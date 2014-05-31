var getDistance = require('geo-distance-js').getDistance

module.exports = Model
function Model(json) {
	// this.data = this._convertJSON(json)
	this.name = json.name || 'Random Run'
	this.points = processPoints(json.points)
	this.startTime = json.points[0].time
	this.duration = this.getDuration(this.points)
	this.distance = this.getDistance(this.points)

	var hr = this.points.map(function(p) { return p.hr })
	this.hr = {
		avg: this.getHR(this.points),
		min: Math.min.apply(null, hr),
		max: Math.max.apply(null, hr)
	}

	var pace = this.points.map(function(p) { return p.pace })
	this.pace = {
		avg: this.getPace(this.points),
		min: Math.min.apply(null, pace),
		max: Math.max.apply(null, pace)
	}
	console.log(this)
}

Model.prototype.getDuration = function(points) {
	return points.reduce(function(memo, point) {
		return memo + point.time
	}, 0)
}

Model.prototype.getDistance = function(points) {
	return points.reduce(function(memo, point) {
		return memo + point.distance
	}, 0)
}

Model.prototype.getSegment = function(boundaries) { // both in m
	var start = boundaries[0]
	var length = boundaries[1]
	var points = []
	this.points.forEach(function(point) {
		if(point.totalDistance < start || point.totalDistance > start + length) return
		points.push(point)
	}, this)
	return points
}

Model.prototype.getHR = function(points) {
	var total = points.reduce(function(memo, point) {
		return memo + point.hr
	}, 0)
	return Math.round(total / points.length)
}

Model.prototype.getPace = function(points) {
	var vals = points.reduce(function(memo, point) {
		return {
			distance: memo.distance + point.distance,
			time: memo.time + point.time
		}
	}, { distance: 0, time: 0 })
	return calcPace(vals.distance, vals.time)
}

Model.prototype.getCoordinates = function(points, latlng) {
	return points.map(function(point) {
		if(!latlng) return point.coordinates
		else return [point.coordinates[1], point.coordinates[0], point.coordinates[2]]
	})
}

function processPoints(points) {
	var totalTime = 0
	var totalDist = 0
	return points.map(function(p, i) {
		var p1 = points[i-1]
		if(!p1) {
			p1 = { time: p.time, coordinates: p.coordinates }
		}
		var time = timeDiff(p.time, p1.time)
		var dist = distDiff(p.coordinates, p1.coordinates)
		return {
			coordinates: p.coordinates,
			hr: p.hr,
			time: time,
			distance: dist,
			totalTime: (totalTime += time),
			totalDistance: (totalDist += dist),
			pace: calcPace(dist, time) || 0
		}
	})
}
function timeDiff(t1, t2) {
	return Math.abs(Date.parse(t1) - Date.parse(t2))
}
function distDiff(d1, d2) {
	return getDistance(d1[1], d1[0], d2[1], d2[0], 10)
}
function calcPace(dist, time) {
	return 1000 / (dist / time)
}

// Model.prototype._convertJSON = function(json) {

// 	for(var i = 1; i < json.points.length; i++) { // start at second point
// 		var point = json.points[i]
// 		point.
// 	}

	// for(var i = 1; i < json.points.length; i++) { // start at seconds point
	// 	var point = {
	// 		coordinates: co[i], // lat, lng, ele data point
	// 		hr: hr[i] || 0, // in bmp
	// 		//totalTime: null, // total active time since start in seconds
	// 		//totalDistance: 0, // distance at start of point since start of activity
	// 		distance: null, // distance passed since last point in m
	// 		time: null, // time passed since last point in ms
	// 		pace: null // in milliseconds per km
	// 	}

	// 	point.distance = getDistance(co[i-1][1], co[i-1][0], co[i][1], co[i][0], 10)
	// 	point.time = new Date(times[i]) - new Date(times[i-1])

	// 	var mms = point.length / point.duration // meters per millisecond
	// 	point.pace = 1000 / mms // pace in ms per km

	// 	points.push(point)
	// }

	// res.time = times[0]
	// res.hr = {
	// 	avg: hrPoints.reduce(sum) /  hrPoints.length,
	// 	min: Math.min.apply(null, hrPoints),
	// 	max: Math.max.apply(null, hrPoints)
	// }

	// res.pace = {
	// 	avg: pacePoints.reduce(sum) / pacePoints.length,
	// 	min: Math.min.apply(null, pacePoints),
	// 	max: Math.max.apply(null, pacePoints)
	// }
	// res.distance = Math.round(res.distance * 100) / 100

// console.log(points)
// 	return res
// }

// function sum(a, b) {
// 	return a + b
// }

// function avg(sum, n) {
// 	return Math.round(sum / n)
// }