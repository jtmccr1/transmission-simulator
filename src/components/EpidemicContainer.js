import React from 'react';
import * as d3 from 'd3';

// With help from https://bl.ocks.org/gcalmettes/95e3553da26ec90fd0a2890a678f3f69

class EpidemicContainer extends React.Component {
	constructor(props) {
		super(props);
		this.drawEpiPlot = this.drawEpiPlot.bind(this);
	}

	componentDidMount() {
		this.drawEpiPlot();
	}
	componentDidUpdate() {
		this.drawEpiPlot();
	}

	drawEpiPlot() {
		console.log('here');
		const node = this.node;
		const padding = 100;
		const xScale = d3
			.scaleLinear()
			.domain(d3.extent(this.props.data, d => d.onset))
			.nice()
			.range([50, this.props.size[0] - padding]);

		// const histogram = d3
		// 	.histogram()
		// 	.value(d => d['onset'])
		// 	.domain(xScale.domain());

		const ticks = xScale.domain()[1] > 30 ? Math.floor(xScale.domain()[1] / 7) : 10;
		const bins = d3
			.histogram()
			.domain(xScale.domain())
			.thresholds(xScale.ticks(ticks))
			.value(d => d.onset)(this.props.data);

		d3.select(node)
			.selectAll('circle')
			.data(this.props.data)
			.enter()
			.append('circle')
			.on('mouseover', this.props.onHover)
			.on('mouseout', this.props.offHover);

		const findBin = function(bin, key, value) {
			//return true if the is a object in the bin arrary with a key whose value matched value
			return Object.values(bin).filter(b => b[key] === value).length > 0;
		};
		const stackEntries = function(bins, key, value) {
			const correctBin = bins.filter(bin => findBin(bin, key, value))[0]; // This should only be 1 of the original bins but should be probably be test and made more robust
			return correctBin.findIndex(entry => entry[key] === value);
		};
		const that = this;
		const convertIndextoCy = function(i, radius) {
			return that.props.size[1] - i * 2 * radius - radius - padding;
		};
		const getCy = function(bins, key, value, radius) {
			const index = stackEntries(bins, key, value);
			return convertIndextoCy(index, radius);
		};
		const getCx = function(bins, key, value) {
			const correctBin = bins.filter(bin => findBin(bin, key, value))[0];
			return xScale(correctBin.x0);
		};

		const xRadius = (xScale(bins[0].x1) - xScale(bins[0].x0)) / 2;
		const maxPile = bins.reduce((acc, cur) => Math.max(acc, cur.length), 0);
		const yRadius = (this.props.size[1] - padding) / (maxPile * 2); //*2 for radius not diameter
		const radius = Math.min(xRadius, yRadius);
		// d3.select(node)
		// 	.selectAll('circle')
		// 	.data(this.props.data)
		// 	.exit()
		// 	.remove();

		d3.select(node)
			.selectAll('circle')
			.attr('cx', d => getCx(bins, 'Id', d.Id))
			.attr('cy', d => getCy(bins, 'Id', d.Id, radius))
			.attr('r', radius)
			.attr('id', d => d.Id)
			.style('fill', (d, i) => {
				if (this.props.hoverElement === d.Id) {
					return '#FCBC34';
				} else {
					return '#5EAFC6';
				}
			});

		// x axis
		const xAxis = d3
			.axisBottom()
			.scale(xScale)
			.ticks(5);

		d3.selectAll('.xAxis').remove();

		d3.select(node)
			.append('g')
			.attr('class', 'xAxis')
			.attr('transform', `translate(0, ${this.props.size[1] - padding})`)
			.call(xAxis)
			.selectAll('text');
	}

	render() {
		return (
			<div>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default EpidemicContainer;
