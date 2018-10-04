import React from 'react';
import * as d3 from 'd3';
import * as R from 'ramda';
import { getData, drawAxis } from '../lib/commonFunctions';

class SerialInterval extends React.Component {
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

		const curriedPdf = R.curry(this.props.pdf);
		// draw the plot
		const width = this.props.size[0];
		const height = this.props.size[1];
		const node = this.node;

		const svg = d3.select(node).style('font', '10px sans-serif');

		const data = getData(curriedPdf(R.__, ...this.props.params), 0.005).filter(d => isFinite(d.p));
		// popuate data
		// line chart based on http://bl.ocks.org/mbostock/3883245
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain([0, d3.max(data, d => d.q)]);

		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain([0, d3.max(data, d => d.p)]);

		const makeLinePath = d3
			.line()
			.x(d => xScale(d.q))
			.y(d => yScale(d.p));

		const area = d3
			.area()
			.x(d => xScale(d.q))
			.y0(height - this.props.margin.bottom - this.props.margin.top)
			.y1(d => yScale(d.p));

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
			'Days post infection onset',
			'Probability density'
		);
		svgGroup
			.append('path')
			.datum(data, d => d.q)
			.attr('class', 'area')
			.attr('d', area);
		svgGroup
			.append('path')
			.datum(data)
			.attr('class', 'line')
			.attr('d', makeLinePath);
	}
	render() {
		const mean = this.props.mean(...this.props.params);
		return (
			<div>
				<div>{`Serial interval (days) (mean: ${Number(mean).toFixed(2)}))`}</div>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default SerialInterval;
