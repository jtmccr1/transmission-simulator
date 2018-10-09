import React from 'react';
import * as d3 from 'd3';
import { drawAxis } from '../lib/commonFunctions';

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
		function positionNodes(tree) {
			// external nodes get assigned height in 0-1.
			// external nodes are taken from the nodelist which is preorder traversal
			const numberOfExternalNodes = tree.externalCases.length;
			// Here we get the order based on a current traversal
			tree.order(tree.index);
			let postOrder = [...tree.postorder()];
			const externalNodes = tree.externalCases.sort((a, b) => {
				return postOrder.indexOf(a) - postOrder.indexOf(b);
			});

			for (const [i, node] of externalNodes.entries()) {
				//  x and y are in [0,1]
				node.y = i / numberOfExternalNodes; // Other axis width?
				node.mutationsFromRoot = tree.rootToTipMutations(node);
			}
			// internal nodes get the mean height of their childern
			for (const node of [...tree.postorder()]) {
				if (node.children && node.children.length > 0) {
					node.y = d3.mean(node.children, kid => kid.y);
					node.mutationsFromRoot = tree.rootToTipMutations(node);
				}
			}
		}
		positionNodes(this.props.Outbreak);
		const node = this.node;
		const width = this.props.size[0];
		const height = this.props.size[1];
		const svg = d3.select(node).style('font', '10px sans-serif');
		// get space not effient
		// const that = this;
		// this.props.data.forEach(d => {
		// 	const offspring = [...that.props.Outbreak.preorder(d)].length - 1;
		// 	const neices = that.props.data
		// 		.filter(node => node.level === d.level)
		// 		.map(node => [...that.props.Outbreak.preorder(node)].length - 1)
		// 		.reduce((acc, curr) => acc + curr, 0);
		// 	const proportion = offspring / neices;
		// 	d.y = proportion * 0.5;
		// });
		const displayNodes = this.props.Outbreak.broadSearch(this.props.zoomNode);
		const allData = this.props.Outbreak.caseList.filter(d => d.onset <= this.props.time);
		const processedData = allData.filter(d => displayNodes.map(e => e.Id).indexOf(d.Id) > -1);
		//const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent, target: d }));
		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom - 10, this.props.margin.bottom])
			.domain([d3.min(processedData, d => d.y), d3.max(processedData, d => d.y)]);
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain([d3.min(processedData, d => d.onset), d3.max(processedData, d => d.onset)]);

		const colorScale = d3.scaleSequential(d3.interpolateViridis);

		const makeLinePath = d3
			.line()
			.x(d => xScale(d.onset))
			.y(d => yScale(d.y))
			.curve(d3.curveStepBefore);
		//remove current plot
		svg.selectAll('g').remove();
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');
		//Create SVG element
		//Create edges as lines
		const maxMutations = allData.reduce((acc, cur) => Math.max(acc, cur.mutationsFromRoot), 0);
		// edges
		svgGroup
			.selectAll('.line')
			.data(
				processedData.filter(n => n.parent).map(n => {
					return {
						target: n,
						values: [{ onset: n.parent.onset, y: n.parent.y }, { onset: n.onset, y: n.y }],
					};
				})
			)
			.enter()
			.append('path')
			.attr('class', 'branch')
			.attr('fill', 'none')
			.attr('stroke-width', 2)
			.attr('d', edge => makeLinePath(edge.values))
			.attr('stroke', edge => colorScale(edge.target.mutationsFromRoot / maxMutations));

		svgGroup
			.selectAll('.branch')
			.on('mouseover', function(d, i) {
				d3.select(this).attr('stroke-width', 5);
			})
			.on('mouseout', function(d, i) {
				d3.select(this).attr('stroke-width', 2);
			})
			.on('click', (d, i) => this.props.zoomToNode(d.target));

		svgGroup.on('dbclick', (d, i) => this.props.zoomToNode(this.props.Outbreak.indexCase));
		//Create nodes as circles
		svgGroup
			.selectAll('circle')
			.data(processedData)
			.enter()
			.append('circle');

		svgGroup
			.selectAll('circle')
			.attr('id', d => d.Id)
			.attr('cx', d => xScale(d.onset))
			.attr('cy', d => yScale(d.y))
			.attr('r', 5)
			.style('fill', d => colorScale(d.mutationsFromRoot / maxMutations))
			.style('stroke-width', 2)
			.style('stroke', d => {
				const color =
					this.props.selectedCases.map(n => n.Id).indexOf(d.Id) > -1
						? 'red'
						: colorScale(d.mutationsFromRoot / maxMutations);
				return color;
			})

			.on('click', d => this.props.selectSample(d));

		drawAxis(
			svgGroup,
			xScale,
			d3.scaleLinear().range(0),
			this.props.size,
			this.props.margin,
			'Days since index case',
			''
		);
		svgGroup.select('.y').remove();
	}

	render() {
		return (
			<div>
				<button onClick={this.props.resetZoom}>Reset View</button>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default TransmissionNetworkTree;
