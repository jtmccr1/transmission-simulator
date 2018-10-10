import React from 'react';
import * as d3 from 'd3';
import regression from 'regression';
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

		const trendConfig = {
			order: 2,
			precision: 5,
		};

		const processedData = this.props.Outbreak.caseList.filter(d => d.onset <= this.props.time).map(node => {
			const point = {
				x: node.onset,
				y: this.props.Outbreak.rootToTipLength(node),
				expected: node.onset * (0.01 / 365),
				node: node,
			};

			return point;
		});

		const expectedLine = d3
			.line()
			.x(d => xScale(d.x))
			.y(d => yScale(d.expected));

		const predictedLine = d3
			.line()
			.x(d => xScale(d[0]))
			.y(d => yScale(d[1]));

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
			.attr('r', 5)
			.style('fill', d => {
				const color = this.props.selectedCases.map(n => n.Id).indexOf(d.node.Id) > -1 ? 'red' : 'grey';
				return color;
			})
			.style('opacity', d => {
				const color = this.props.selectedCases.map(n => n.Id).indexOf(d.node.Id) > -1 ? 1 : 0.2;
				return color;
			})
			.on('click', d => this.props.selectSample(d.node));

		svgGroup
			.append('path')
			.datum(processedData)
			.attr('class', 'trendline')
			.attr('d', expectedLine);

		if (this.props.selectedCases.length > 1) {
			const trendConfig = {
				order: 2,
				precision: 5,
			};
			const measuredTrend = regression.linear(
				this.props.selectedCases.map(d => [d.onset, this.props.Outbreak.rootToTipLength(d)]),
				trendConfig
			);
			//https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
			function onlyUnique(value, index, self) {
				return self.indexOf(value) === index;
			}
			const uniqueX = processedData.map(d => d.x).filter(onlyUnique);
			const predictedPoints = uniqueX.map(d => measuredTrend.predict(d));
			svgGroup
				.append('path')
				.datum(predictedPoints)
				.attr('class', 'predictedLine')
				.attr('d', predictedLine);
		}

		drawAxis(svgGroup, xScale, yScale, this.props.size, this.props.margin, 'Day of infection', 'Node Height');
	}

	render() {
		return (
			<div>
				<h3>Evolution rate vs. expectation (blue)</h3>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default Clockyness;
