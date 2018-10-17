import React from 'react';
import * as d3 from 'd3';

class Transmission extends React.Component {
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
		const svg = d3.select(node).style('font', '10px sans-serif');

		const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent.Id, target: d.Id }));
		// const xScale = d3
		// 	.scaleTime()
		// 	.domain([
		// 		d3.min(this.props.nodes, d => d['Date of Symptom Onset']),
		// 		d3.max(this.props.nodes, d => d['Date of Symptom Onset']),
		// 	])
		// 	.range([50, 900 - 100]);
		const simulation = d3
			.forceSimulation()
			.force(
				'link',
				d3
					.forceLink()
					.id(function(d) {
						return d.Id;
					})
					.strength(0.2)
			)
			.force('charge', d3.forceManyBody().strength(-50))
			.force(
				'forceX',
				d3
					.forceX()
					.strength(0.1)
					.x(this.props.size[0] * 0.5)
			)
			.force(
				'forceY',
				d3
					.forceY()
					.strength(0.1)
					.y(this.props.size[1] * 0.4)
			);

		//remove current plot
		svg.selectAll('g').remove();
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');
		//Create SVG element
		//Create edges as lines
		const edgesSVG = svgGroup
			.selectAll('line')
			.data(edges)
			.enter()
			.append('line')
			.style('stroke', '#ccc')
			.style('stroke-width', 1);

		//Create nodes as circles
		const nodesSVG = svgGroup
			.selectAll('circle')
			.data(this.props.data)
			.enter()
			.append('circle');

		svgGroup
			.selectAll('circle')
			.attr('id', d => d.Id)
			.attr('r', 10)
			.style('fill', '#5EAFC6');

		simulation.nodes(this.props.data).on('tick', ticked);

		simulation.force('link').links(edges);
		function ticked() {
			edgesSVG
				.attr('x1', function(d) {
					return d.source.x;
				})
				.attr('y1', function(d) {
					return d.source.y;
				})
				.attr('x2', function(d) {
					return d.target.x;
				})
				.attr('y2', function(d) {
					return d.target.y;
				});

			nodesSVG
				.attr('cx', function(d) {
					return d.x;
				})
				.attr('cy', function(d) {
					return d.y;
				});
		}
	}

	render() {
		return (
			<div>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default Transmission;
