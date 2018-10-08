import React from 'react';
import * as d3 from 'd3';

class PhyloTree extends React.Component {
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
			let postOrder = [...tree.postorder()];
			const externalNodes = tree.externalCases.sort((a, b) => {
				return postOrder.indexOf(a) - postOrder.indexOf(b);
			});

			for (const [i, node] of externalNodes.entries()) {
				//  x and y are in [0,1]
				node.y = i / numberOfExternalNodes; // Other axis width?
				node.height = tree.rootToTipLength(node);
			}
			// internal nodes get the mean height of their childern
			for (const node of [...tree.postorder()]) {
				if (node.children && node.children.length > 0) {
					node.y = d3.mean(node.children, kid => kid.y);
					node.height = tree.rootToTipLength(node);
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
		const processedData = this.props.Outbreak.caseList;
		//const edges = this.props.data.filter(d => d.parent).map(d => ({ source: d.parent, target: d }));
		const yScale = d3
			.scaleLinear()
			.range([height - this.props.margin.top - this.props.margin.bottom, this.props.margin.bottom])
			.domain([0, 1]);
		const xScale = d3
			.scaleLinear()
			.range([this.props.margin.left, width - this.props.margin.left - this.props.margin.right])
			.domain(d3.extent(processedData, d => d.height));

		const makeLinePath = d3
			.line()
			.x(d => xScale(d.height))
			.y(d => yScale(d.y));
		//.curve(d3.curveStepBefore);
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
				processedData.filter(n => n.parent).map(n => {
					return {
						target: n,
						values: [{ height: n.parent.height, y: n.parent.y }, { height: n.height, y: n.y }],
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
			.data(processedData)
			.enter()
			.append('circle');

		//const minNon0Branch = d3.min(processedData.filter(x => x.branchLength > 0), d => d.branchLength) * 0.1;
		svgGroup
			.selectAll('circle')
			.attr('id', d => d.Id)
			.attr('cx', d => xScale(d.height)) //Math.max(xScale(d.height), xScale(minNon0Branch)))
			.attr('cy', d => yScale(d.y))
			.attr('r', 5);

		svgGroup.selectAll('.branch').on('mouseover', function(d, i) {
			d3.select(this).attr('stroke-width', 5);
		});
		svgGroup.selectAll('.branch').on('mouseout', function(d, i) {
			d3.select(this).attr('stroke-width', 2);
		});
	}

	render() {
		return (
			<div>
				<svg ref={node => (this.node = node)} width={this.props.size[0]} height={this.props.size[1]} />
			</div>
		);
	}
}

export default PhyloTree;
