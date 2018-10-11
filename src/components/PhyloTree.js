import React from 'react';
import * as d3 from 'd3';
import { positionNodes, addBranches, addNodes } from '../lib/plotTreeFunctions.js';
class Phylotree extends React.Component {
	constructor(props) {
		super(props);
		this.drawTree = this.drawTree.bind(this);
	}
	componentDidMount() {
		this.drawTree();
	}
	componentDidUpdate() {
		this.drawTree();
	}
	drawTree() {
		const node = this.node;
		const svg = d3.select(node).style('font', '10px sans-serif');
		svg.selectAll('g').remove();
		svg.append('g').attr('transform', `translate(${this.props.margin.left},${this.props.margin.top})`);

		const svgGroup = svg.select('g');

		this.props.Outbreak.buildPhylo();
		const tree = this.props.Outbreak.tree;
		// get the size of the svg we are drawing on
		const width = this.props.size[0];
		const height = this.props.size[1];

		//Assign the node positions on a scale of 0-1
		positionNodes(tree);
		//remove the tree if it is there already

		//to save on writing later
		// create the scales
		const xScale = d3
			.scaleLinear()
			.domain([0, 1])
			.range([this.props.margin.left, width - this.props.margin.right]);

		const yScale = d3
			.scaleLinear()
			.domain([0, 1])
			.range([this.props.margin.bottom, height - this.props.margin.top]);
		//create otherstuff
		const scales = { x: xScale, y: yScale };

		addBranches(svgGroup, tree, scales);

		addNodes(svgGroup, tree, scales);

		//  // extra parametersa are ignored if not required by the callback
		// for(const callback of [...callBacks]){
		//   callback(svgSelection,tree,scales)
		// }
		// //addLabels();
	}

	render() {
		this.props.Outbreak.buildPhylo();

		return (
			<div>
				<p>{this.props.Outbreak.tree.toNewick()}</p>

				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default Phylotree;
