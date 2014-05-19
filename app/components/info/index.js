/** @jsx React.DOM */
var React = require('react')
var moment = require('moment')
var distance = require('geo-distance-js').getDistance

module.exports = React.createClass({
	displayName: require('./package.json').name,

	render: function() {
		var data = this.props.data
		var name = data.name || 'Random Run'
		var time = moment(data.time).calendar()
		var duration = moment.duration(data.duration, 'seconds')
		var distance = Math.round(data.distance / 1000 * 100) / 100
		var pace = moment.duration(data.pace, 'seconds')
		return (
			<div className='info panel'>
				<div className='info__top'>
					<div className='info__avatar'>
						<img className='info__avatar-img' src={this.props.profile.avatar} />
					</div>
					<div className='info__list'>
						<h1 className='info__name'>{name+'yo'}</h1>
						<span>{time}</span>
					</div>
				</div>
				<div className='info__bottom'>
					<div className='info__item'>
						<span className='info__item-value'>{distance}</span>
						<span className='info__item-label'>Distance</span>
					</div>
					<div className='info__item'>
						<span className='info__item-value'>
							{WLZ(duration.minutes()) +':'+ WLZ(duration.seconds())}
						</span>
						<span className='info__item-label'>Duration</span>
					</div>
					<div className='info__item'>
						<span className='info__item-value'>
							{WLZ(pace.minutes()) +':'+ WLZ(pace.seconds())}
						</span>
						<span className='info__item-label'>Pace</span>
					</div>
					<div className='info__item'>
						<span className='info__item-value'>{data.hr}</span>
						<span className='info__item-label'>Heart Rate</span>
					</div>
				</div>
			</div>
		)
	}
})


function WLZ(d) { // withLeadingZero
	var str = d.toString()
	if(str.length < 2) {
		return '0' + str
	}
	return str
}