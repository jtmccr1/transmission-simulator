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
		const node = this.node;
		const padding = 100;
		const xScale = d3
			.scaleLinear()
			.domain([d3.min(this.props.data, d => d['onset']), d3.max(this.props.data, d => d['onset'])])
			.range([50, this.props.size[0] - padding]);

		const histogram = d3
			.histogram()
			.value(d => d['onset'])
			.domain(xScale.domain());

		let bins = histogram(this.props.data).filter(d => d.length > 0);
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
			const correctBin = [...bins.filter(bin => findBin(bin, key, value))[0]]; // This should only be 1 of the original bins but should be probably be test and made more robust
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

		d3.select(node)
			.selectAll('circle')
			.data(this.props.data)
			.exit()
			.remove();

		d3.select(node)
			.selectAll('circle')
			.attr('cx', d => xScale(d['onset']))
			.attr('cy', d => getCy(bins, 'id', d.id, 10))
			.attr('r', 10)
			.attr('id', d => d.id)
			.style('fill', (d, i) => {
				if (this.props.hoverElement === d.id) {
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
