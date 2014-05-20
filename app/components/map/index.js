/** @jsx React.DOM */
var React = require('react')
var L = require('leaflet')

module.exports = React.createClass({
	displayName: require('./package.json').name,
	getDefaultProps: function() {
		return { geoJSON: {}, selection: null }
	},
	getInitialState: function() {
		return {
			map: null,
			// route: L.geoJson(),
			route: L.polyline([], {}),
			selection: L.polyline([], { color: 'red' })

		}
	},
	componentDidMount: function() {
		var state = this.state
		state.map = L.map('map')

		L.tileLayer('http://{s}.tiles.mapbox.com/v3/hendrikcech.i8m409e1/{z}/{x}/{y}.png', {
		    maxZoom: 18
		}).addTo(state.map)

		state.route.addTo(state.map)
		state.selection.addTo(state.map)

		var zoomLevel = state.map.getBoundsZoom(state.route.getBounds(), true)
		state.map.fitBounds(state.route.getBounds(), zoomLevel)
	},
	selectSegment: function() {
		var segment = this.props.model.getSegment(1000, 1000)
		return this.props.model.getCoordinates(segment, true)
	},

	render: function() {
		var state = this.state
		var props = this.props
		console.log(props)
		state.route.setLatLngs(props.model.getCoordinates(props.model.data.points, true))
		state.selection.setLatLngs(this.selectSegment())
		return (
			<div className='panel' id='map' />
		)
	}
})