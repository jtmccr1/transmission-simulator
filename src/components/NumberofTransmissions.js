import React from 'react';
import * as d3 from 'd3';
import * as R from 'ramda';
import * as jStat from 'jStat';
import { getData, drawAxis } from '../lib/commonFunctions';

class NumberofTransmissions extends React.Component {
	constructor(props) {
		super(props);
		this.drawPlot = this.drawPlot.bind(this);
	}

	componentDidMount() {
		this.drawPlot();
	}
	componentDidUpdate() {
		this.drawPlot();
	}

	drawPlot() {
		//Helper functions

		//This will be a negative binomial distribution
		const curriedPdf = R.curry(jStat.negbin.pdf);
		// draw the plot
		const width = this.props.size[0];
		const height = this.props.size[1];
		const node = this.node;

		const svg = d3.select(node).style('font', '10px sans-serif');

		const data = getData(curriedPdf(R.__, ...this.props.params), 1, 0.01, 0).filter(d => isFinite(d.p));
		// popuate data
		// line chart based on http://bl.ocks.org/mbostock/3883245
		const xScale = d3
			.scaleBand()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.padding(0.1)
			.domain(
				data.map(function(d) {
					return d.q;
				})
			);

		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain([0, d3.max(data, d => d.p)]);

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
			'Number of infections',
			'Probability density'
		);

		svgGroup
			.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('class', 'prob-rect')
			.attr('x', d => xScale(d.q))
			.attr('width', xScale.bandwidth())
			.attr('y', d => yScale(d.p))
			.attr('height', d => height - this.props.margin.bottom - this.props.margin.top - yScale(d.p));
	}
	render() {
		const r = this.props.params[0];
		const p = this.props.params[1];
		const mean = (r * (1 - p)) / p;
		return (
			<div>
				<div>{`Number of transmissions/infection (Expectation: ${Number(mean).toFixed(2)})`}</div>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default NumberofTransmissions;
