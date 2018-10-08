import React from 'react';
import * as d3 from 'd3';
import { drawAxis } from '../lib/commonFunctions';

class Clockyness extends React.Component {
	constructor(props) {
		super(props);
		this.drawTransPlot = this.drawTransPlot.bind(this);
	}
	componentDidMount() {
		this.drawTransPlot();
	}
	componentDidUpdate() {
		this.drawTransPlot();
	}
	drawTransPlot() {
		const node = this.node;
		const width = this.props.size[0];
		const height = this.props.size[1];
		const svg = d3.select(node).style('font', '10px sans-serif');

		const processedData = this.props.Outbreak.caseList.map(node => {
			const point = {
				x: node.onset,
				y: this.props.Outbreak.rootToTipLength(node),
				expected: node.onset * (0.01 / 365),
			};
			return point;
		});

		const expectedLine = d3
			.line()
			.x(d => xScale(d.x))
			.y(d => yScale(d.expected));

		//const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent, target: d }));
		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain(d3.extent(processedData, d => d.y));
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain(d3.extent(processedData, d => d.x));

		//remove current plot
		svg.selectAll('g').remove();
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');
		//Create SVG element
		//Create edges as lines

		//Create nodes as circles
		svgGroup
			.selectAll('circle')
			.data(processedData)
			.enter()
			.append('circle');

		svgGroup
			.selectAll('circle')
			.attr('cx', d => xScale(d.x))
			.attr('cy', d => yScale(d.y))
			.attr('r', 5);

		svgGroup
			.append('path')
			.datum(processedData)
			.attr('class', 'trendline')
			.attr('d', expectedLine);

		drawAxis(svgGroup, xScale, yScale, this.props.size, this.props.margin, 'Day of infection', 'Node Height');
	}

	render() {
		return (
			<div>
				<h3>Evolution rate vs. expectation (red)</h3>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default Clockyness;
