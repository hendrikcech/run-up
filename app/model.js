var getDistance = require('geo-distance-js').getDistance
var moment = require('moment')

/*{
	name: "",
	time: start time,
	duration: total moving time,
	hr: average hr of moving points,
	pace: average pace of moving points,
	distance: total distance in m,
	coordinates: raw array,
	points: [{
		time: time moving since start of activity in seconds,
		distance: distance since start in m,
		hr: 152,
		coordinates: [lon, lat, ele]
		pace: s/km,
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
	var res = {}

	var hrTotal = 0
	var hrPoints = 0

	var paceTotal = 0
	var pacePoints = 0

	res.distance = 0
	res.duration = 0

	res.points = []
	var co = json.features[0].geometry.coordinates
	var hr = json.features[0].properties.hr
	var times = json.features[0].properties.times
	for(var i = 0; i < co.length - 1; i++) {
		var point = {
			hr: hr[i] || 0,
			coordinates: co[i],
			length: getDistance(co[i][1], co[i][0], co[i+1][1], co[i+1][0], 10),
			duration: new Date(times[i+1]) - new Date(times[i]) // in ms
		}

		var ms = point.length / (point.duration / 1000) // convert to seconds
		point.pace = Math.round(1000 / ms) // seconds per km

		if(point.pace < 8*60 || i < 10) {
			point.moving = true
			res.distance += point.length
			res.duration += point.duration / 1000
			
			hrTotal += point.hr
			hrPoints++

			paceTotal += point.pace
			pacePoints++
		} else {
			point.moving = false
		}

		point.time = res.duration
		point.distance = res.distance

		res.points.push(point)
	}

	res.name = json.features[0].properties.name || ''
	res.time = times[0]
	res.hr = Math.round(hrTotal / hrPoints)
	res.pace = Math.round(paceTotal / pacePoints)
	res.distance = Math.round(res.distance)

	return res
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

Model.prototype.getHR = function(points) {
	var total = points.reduce(function(memo, point) {
		return memo + point.hr
	}, 0)
	return Math.round(total / points.length)
}

Model.prototype.getCoordinates = function(points, latlng) {
	return points.map(function(point) {
		if(!latlng) return point.coordinates
		else return [point.coordinates[1], point.coordinates[0], point.coordinates[2]]
	})
}