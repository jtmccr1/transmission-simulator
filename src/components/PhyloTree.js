import React from 'react';
import * as d3 from 'd3';
import { drawAxis } from '../lib/commonFunctions';

class SelectedPhyloTree extends React.Component {
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

		// function positionNodes(selectedCases, subtreeParents, tree) {
		// 	//Get selected Cases that are not ancesters to any othe selected nodes
		// 	const externalCases = selectedCases.filter(x => subtreeParents.map(d => d.Id).indexOf(x.Id) === -1);
		// 	// external nodes get assigned height in 0-1.
		// 	// external nodes are taken from the nodelist which is preorder traversal

		// 	const numberOfExternalNodes = externalCases.length - 1;

		// 	let postOrder = [...tree.postorder()].map(x => x.Id);
		// 	const externalNodes = externalCases.sort((a, b) => {
		// 		return postOrder.indexOf(a.Id) - postOrder.indexOf(b.Id);
		// 	});

		// 	for (const [i, node] of externalNodes.entries()) {
		// 		//  x and y are in [0,1]
		// 		node.subY = i / numberOfExternalNodes; // Other axis width?
		// 		//node.mutationsFromRoot = tree.rootToTipMutations(node);
		// 	}
		// 	// internal nodes get the mean height of their childern
		// 	const internalNodes = [...selectedCases, ...subtreeParents].filter(
		// 		d => externalCases.map(x => x.Id).indexOf(d.Id) === -1
		// 	);
		// 	internalNodes.sort((a, b) => {
		// 		return postOrder.indexOf(a.Id) - postOrder.indexOf(b.Id);
		// 	});
		// 	for (const node of internalNodes) {
		// 		// maintains order of the main tree
		// 		if (node.children && node.children.length > 0) {
		// 			const childrenInSubtree = node.children.filter(
		// 				x => [...selectedCases, ...subtreeParents].map(d => d.Id).indexOf(x.Id) > -1
		// 			);
		// 			node.subY = d3.mean(childrenInSubtree, kid => kid.subY);
		// 			//node.mutationsFromRoot = tree.rootToTipMutations(node);
		// 		}
		// 	}
		// }

		const mrca = this.props.Outbreak.MRCA(this.props.selectedCases);
		let subtreeParents = [mrca];
		for (const node of this.props.selectedCases) {
			if (node.parent) {
				let currentNode = node.parent;
				while (currentNode !== mrca) {
					subtreeParents.push(currentNode);
					currentNode = currentNode.parent;
				}
			}
		}

		//positionNodes(this.props.selectedCases, subtreeParents, this.props.Outbreak);
		const processedData = [...this.props.selectedCases, ...subtreeParents].filter(x => x.onset <= this.props.time);
		//positionNodes(subtree);
		const node = this.node;
		const width = this.props.size[0];
		const height = this.props.size[1];
		const svg = d3.select(node).style('font', '10px sans-serif');

		//const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent, target: d }));
		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom - 10, this.props.margin.bottom])
			.domain([0, 1]);
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain([d3.min(processedData, d => d.mutationsFromRoot), d3.max(processedData, d => d.mutationsFromRoot)]);

		const colorScale = d3.scaleSequential(d3.interpolateViridis);

		const makeLinePath = d3
			.line()
			.x(d => xScale(d.mutationsFromRoot))
			.y(d => yScale(d.subY))
			.curve(d3.curveStepBefore);
		//remove current plot
		svg.selectAll('g').remove();
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');
		//Create SVG element
		//Create edges as lines
		const maxMutations = this.props.Outbreak.caseList
			.filter(d => d.onset <= this.props.time)
			.reduce((acc, cur) => Math.max(acc, cur.mutationsFromRoot), 0);
		// edges
		svgGroup
			.selectAll('.line')
			.data(
				processedData.filter(d => d.Id !== this.props.Outbreak.indexCase.Id).map(n => {
					//processedData.map(n => {
					return {
						target: n,
						values: [
							{ mutationsFromRoot: n.parent.mutationsFromRoot, subY: n.parent.subY },
							{ mutationsFromRoot: n.mutationsFromRoot, subY: n.subY },
						],
					};
				})
			)
			.enter()
			.append('path')
			.attr('class', 'branch')
			.attr('fill', 'none')
			.attr('stroke-width', 2)
			.attr('d', edge => makeLinePath(edge.values))
			.style('stroke', edge => colorScale(edge.target.mutationsFromRoot / maxMutations));

		//Create nodes as circles
		svgGroup
			.selectAll('circle')
			.data(processedData)
			.enter()
			.append('circle');

		svgGroup
			.selectAll('circle')
			.attr('id', d => d.Id)
			.attr('cx', d => xScale(d.mutationsFromRoot))
			.attr('cy', d => yScale(d.subY))
			.attr('r', 5)
			.style('stroke', d => colorScale(d.mutationsFromRoot / maxMutations))
			.style('stroke-width', 2)
			.style(
				'fill',
				d =>
					this.props.selectedCases.map(n => n.Id).indexOf(d.Id) > -1
						? colorScale(d.mutationsFromRoot / maxMutations)
						: 'white'
			);
		//.attr('fill-opacity', d => (this.props.selectedCases.map(c => c.Id).indexOf(d.Id) > -1 ? 1 : 0.1));

		drawAxis(
			svgGroup,
			xScale,
			d3.scaleLinear().range(0),
			this.props.size,
			this.props.margin,
			'Mutations from root',
			''
		);
		svgGroup.select('.y').remove();
	}

	render() {
		return (
			<div>
				<h4>Selected "phylogenetic" tree</h4>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default SelectedPhyloTree;
