import React from 'react';
import * as d3 from 'd3';
import { drawAxis } from '../lib/commonFunctions';

class SelectedTransmissionNetwork extends React.Component {
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
		// get sub tree from samples -

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
		const subtree = this.props.Outbreak.subtree(this.props.selectedCases);
		// positionNodes(this.props.Outbreak)
		positionNodes(subtree);
		const node = this.node;
		const width = this.props.size[0];
		const height = this.props.size[1];
		const svg = d3.select(node).style('font', '10px sans-serif');

		const processedData = subtree.caseList;
		//const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent, target: d }));
		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain([0, 1]);
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain([0, d3.max(processedData, d => d.onset)]);

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
		const maxMutations = this.props.Outbreak.caseList.reduce((acc, cur) => Math.max(acc, cur.mutationsFromRoot), 0);
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
			.style('fill', d => colorScale(d.mutationsFromRoot / maxMutations));

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
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default SelectedTransmissionNetwork;