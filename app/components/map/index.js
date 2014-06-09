/** @jsx React.DOM */
var React = require('react')
var L = require('leaflet')

module.exports = React.createClass({
	displayName: 'map',
	getDefaultProps: function() {
		return { data: {}, selection: [] }
	},
	getInitialState: function() {
		return {
			map: null,
			route: L.polyline([], { }),
			selection: L.multiPolyline([], { color: 'red' })
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

		var bounds = state.route.getBounds()
		var zoomLevel = state.map.getBoundsZoom(state.route.getBounds(), true)
		state.map.fitBounds(bounds, zoomLevel)
		// state.map.setMaxBounds(bounds)
	},
	selectSegment: function() {
		var selection = this.props.selection
		var data = this.props.data
		if(selection.length === 0) return []
		return selection.map(function(s) {
			var segment = data.getSegment(s)
			return data.getCoordinates(segment, true)
		}, this)
	},

	render: function() {
		var state = this.state
		var data = this.props.data
		state.route.setLatLngs(data.getCoordinates(data.points, true))
		state.selection.setLatLngs(this.selectSegment())
		return (
			<div id='map' />
		)
	}
})