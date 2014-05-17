/** @jsx React.DOM */
var React = require('react')
var L = require('leaflet')

module.exports = React.createClass({
	displayName: require('./package.json').name,
	componentDidMount: function() {
		var map = L.map('map')

		L.tileLayer('http://{s}.tiles.mapbox.com/v3/hendrikcech.i8m409e1/{z}/{x}/{y}.png', {
		    maxZoom: 18
		}).addTo(map)

		var geoJson = L.geoJson(this.props.geoJSON).addTo(map)
		window.g = geoJson
		window.m = map
		map.fitBounds(geoJson.getBounds(), map.getBoundsZoom(geoJson.getBounds(), true))
		console.log(map.getBoundsZoom(geoJson.getBounds(), true))
	},

	render: function() {
		return (
			<div className='panel' id='map' />
		)
	}
})