var getDistance = require('geo-distance-js').getDistance
var moment = require('moment')

/*{
	name: "",
	time: start time,
	duration: total moving time in seconds,
	hr: average hr of moving points in bmp,
	pace: average pace in seconds per km,
	distance: total distance in m,
	// coordinates: raw array,
	points: [{
		time: time moving since start of activity in seconds,
		distance: distance since start in m,
		hr: hr in bmp,
		coordinates: [lon, lat, ele]
		pace: in seconds per km,
		moving: true if paces > 8 min/km (?),
		length: distance of this point,
		duration: time passed during this point
	}]
}*/

module.exports = Model
function Model(geoJSON) {
	this.data = this._convertGeoJSON(geoJSON)
}

Model.prototype._convertGeoJSON = function(json) {
	var co = json.features[0].geometry.coordinates
	var hr = json.features[0].properties.hr
	var times = json.features[0].properties.times

	var res = {
		name: json.features[0].properties.name || '', // name of activity
		time: times[0], // start time
		pace: { // pace of active points in seconds per km
			avg: null,
			min: null,
			max: null
		},
		hr: { // hr of active points in bmp
			avg: null,
			min: null,
			max: null
		},
		distance: 0, // total active distance in m
		duration: 0, // total active time in ms
		points: []
	}

	var hrPoints = []
	var pacePoints = []

	for(var i = 1; i < co.length; i++) { // start at seconds point
		var point = {
			time: null, // total active time since start in seconds
			coordinates: co[i], // lat, lng, ele data point
			pace: null, // in seconds per km
			hr: hr[i] || 0, // in bmp
			distance: 0, // distance at start of point since start of activity (round 2 decimals)
			length: null, // distance passed since last point in m (round 2 decimals)
			duration: null // time passed since last point in ms
		}

		var distance = getDistance(co[i-1][1], co[i-1][0], co[i][1], co[i][0], 10)
		// point.length = Math.round(distance * 100) / 100,
		point.length = distance
		point.duration = new Date(times[i]) - new Date(times[i-1])

		// var ms = point.length / (point.duration / 1000) // convert to seconds
		// if(ms > 0) point.pace = Math.round(1000 / ms)
		var mss = point.length / point.duration
		if(mss > 0) point.pace = 1000 / mss // pace in ms per km

		if(point.pace) {
			res.distance += point.length
			res.duration += point.duration
			
			hrPoints.push(point.hr)
			pacePoints.push(point.pace)
		} else {
			console.log(i, mss, pointd)
		}

		point.time = res.duration
		// point.distance = Math.round(res.distance * 100) / 100
		point.distance = res.distance

		res.points.push(point)
	}

	res.time = times[0]
	res.hr = {
		avg: hrPoints.reduce(sum) /  hrPoints.length,
		min: Math.min.apply(null, hrPoints),
		max: Math.max.apply(null, hrPoints)
	}

	res.pace = {
		avg: pacePoints.reduce(sum) / pacePoints.length,
		min: Math.min.apply(null, pacePoints),
		max: Math.max.apply(null, pacePoints)
	}
	res.distance = Math.round(res.distance * 100) / 100
console.log(res)
	return res
}

function sum(a, b) {
	return a + b
}

function avg(sum, n) {
	return Math.round(sum / n)
}

Model.prototype.getSegment = function(boundaries) { // both in m
	var start = boundaries[0]
	var length = boundaries[1]
	var points = []
	this.data.points.forEach(function(point) {
		if(point.distance < start || point.distance > start + length) return
		points.push(point)
	}, this)
	return points
}

Model.prototype.getAvg = function(type, points) {
	var total = points.reduce(function(memo, point) {
		return memo + point[type] // hr, pace, ...
	}, 0)
	return Math.round(total / points.length)
}

Model.prototype.getCoordinates = function(points, latlng) {
	return points.map(function(point) {
		if(!latlng) return point.coordinates
		else return [point.coordinates[1], point.coordinates[0], point.coordinates[2]]
	})
}