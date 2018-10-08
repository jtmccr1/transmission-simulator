import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

const textColumn = {
	dataAlign: 'left',
	headerAlign: 'left',
};

class LineList extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const displayNodes = this.props.Outbreak.broadSearch(this.props.zoomNode);
		const allData = this.props.Outbreak.caseList.filter(d => d.onset <= this.props.time);
		const processedData = allData.filter(d => displayNodes.map(e => e.Id).indexOf(d.Id) > -1);
		const dataSet = processedData //add an id for each node then get the parent and children id lists
			.map(node => {
				node.onset = Number(node.onset.toFixed(2));
				return node;
			})
			.map(node => {
				node.mutationsFromRoot = this.props.Outbreak.rootToTipMutations(node);
				return node;
			})
			.map(node => {
				node.parentId = node.parent ? node.parent.Id : 'None';

				if (!node.children) {
					node.childrenId = 'No contacts yet';
				} else if (node.children.length === 0) {
					node.childrenId = 'No forward transmission';
				} else {
					node.childrenId = node.children.reduce((all, cur) => `${all}${cur.Id}; `, '');
				}
				return node;
			});

		const selectedRow = dataSet
			.filter(d => this.props.selectedCases.map(n => n.Id).indexOf(d.Id) > -1)
			.map(d => d.Id);
		const selectRowProp = {
			mode: 'checkbox',
			clickToSelect: true, // enable click to select
			bgColor: 'red',
			onSelect: this.props.selectSample,
			//onSelectAll: onSelectAll,
			selected: selectedRow,
		};

		return (
			<div>
				<h2> {`Line List ( ${dataSet.length} cases) `} </h2>
				<BootstrapTable data={dataSet} selectRow={selectRowProp} exportCSV striped>
					<TableHeaderColumn isKey dataField="Id" dataSort width="100" {...textColumn}>
						Id
					</TableHeaderColumn>
					<TableHeaderColumn dataField="onset" dataSort width="100" {...textColumn}>
						Onset
					</TableHeaderColumn>
					<TableHeaderColumn dataField="parentId" dataSort width="200" {...textColumn}>
						Donor Contact
					</TableHeaderColumn>
					<TableHeaderColumn dataField="childrenId" dataSort width="200" {...textColumn}>
						Recipient Contact
					</TableHeaderColumn>
					<TableHeaderColumn dataField="mutationsFromRoot" dataSort width="200" {...textColumn}>
						SNP relative to root
					</TableHeaderColumn>
				</BootstrapTable>
			</div>
		);
	}
}

export default LineList;
