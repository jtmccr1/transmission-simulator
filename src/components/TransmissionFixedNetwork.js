import React from 'react';
import * as d3 from 'd3';

class TransmissionNetworkTree extends React.Component {
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
		// get space not effient
		const that = this;
		this.props.data.forEach(d => {
			const offspring = [...that.props.Outbreak.preorder(d)].length - 1;
			const neices = that.props.data
				.filter(node => node.level === d.level)
				.map(node => [...that.props.Outbreak.preorder(node)].length - 1)
				.reduce((acc, curr) => acc + curr, 0);
			const proportion = offspring / neices;
			d.y = proportion * 0.5;
		});

		//const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent, target: d }));
		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain([0, 1]);
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain([0, d3.max(this.props.data, d => d.onset)]);

		const makeLinePath = d3
			.line()
			.x(d => xScale(d.onset))
			.y(d => yScale(d.y));
		//remove current plot
		svg.selectAll('g').remove();
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');
		//Create SVG element
		//Create edges as lines

		// edges
		svgGroup
			.selectAll('.line')
			.data(
				this.props.data.filter(n => n.parent).map(n => {
					return {
						target: n,
						values: [{ onset: n.parent.onset, y: n.parent.y }, { onset: n.onset, y: n.y }],
					};
				})
			)
			.enter()
			.append('path')
			.attr('class', 'line branch')
			.attr('fill', 'none')
			.attr('stroke', 'black')
			.attr('stroke-width', 2)
			.attr('d', edge => makeLinePath(edge.values));

		//Create nodes as circles
		svgGroup
			.selectAll('circle')
			.data(this.props.data)
			.enter()
			.append('circle');

		svgGroup
			.selectAll('circle')
			.attr('id', d => d.Id)
			.attr('cx', d => xScale(d.onset))
			.attr('cy', d => yScale(d.y))
			.attr('r', 5);
		// .style('fill', (d, i) => {
		// 	if (this.props.hoverElement === d.Id) {
		// 		return '#FCBC34';
		// 	} else {
		// 		return '#5EAFC6';
		// 	}
		// });
	}

	render() {
		return (
			<div>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default TransmissionNetworkTree;
