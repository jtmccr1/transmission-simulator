import React from 'react';
import * as d3 from 'd3';
import { drawAxis } from '../lib/commonFunctions';

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
		const width = this.props.size[0];
		const height = this.props.size[1];
		const node = this.node;

		const svg = d3.select(node).style('font', '10px sans-serif');

		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain(d3.extent(this.props.data, d => d.onset))
			.nice();
		const bins = d3.histogram().domain(xScale.domain())(this.props.data.map(d => d.onset));

		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain([0, d3.max(bins, d => d.length)])
			.nice();

		//remove current plot
		svg.selectAll('g').remove();
		// do the drawing
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');

		drawAxis(
			svgGroup,
			xScale,
			yScale,
			this.props.size,
			this.props.margin,
			'Days since index case',
			'Probability density'
		);
		svgGroup
			.attr('fill', 'steelblue')
			.selectAll('rect')
			.data(bins)
			.enter()
			.append('rect')
			.attr('x', d => xScale(d.x0) + 1)
			.attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
			.attr('y', d => yScale(d.length))
			.attr('height', d => height - this.props.margin.bottom - this.props.margin.top - yScale(d.length));
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
