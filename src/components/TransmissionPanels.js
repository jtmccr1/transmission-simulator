import React, { Component } from 'react';
import TransmissionNetworkTree from './TransmissionFixedNetwork';
import Phylotree from './PhyloTree';
import LineList from './LineList';
import EpidemicContainer from './EpidemicContainer';
import '../style/App.css';
import '../style/plots.css';
import SelectedTransmissionNetwork from './SelectedTransmissionTree';

//https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const TwobigPlot = [w * 0.4, h * 0.5];
class TransmissionPanels extends Component {
	constructor(props) {
		super(props);
		this.selectSample = this.selectSample.bind(this);
		this.zoomToNode = this.zoomToNode.bind(this);
		this.resetZoom = this.resetZoom.bind(this);
		this.state = {
			zoomNode: this.props.Outbreak.indexCase,
			selectedCases: [],
		};
	}
	selectSample(node) {
		const selectedCases = this.state.selectedCases;
		if (selectedCases.map(n => n.Id).indexOf(node.Id) > -1) {
			//remove it
			const newSelectedCases = selectedCases.filter(x => x !== node);
			this.setState({ selectedCases: newSelectedCases });
		} else {
			//add it

			selectedCases.push(node);
			this.setState({ selectedCases: selectedCases });
		}
	}

	zoomToNode(node) {
		this.setState({ zoomNode: node });
	}

	resetZoom() {
		this.setState({
			zoomNode: this.props.Oubreak.indexCase,
		});
	}
	render() {
		return (
			<div>
				{this.props.Outbreak.caseList.length > 1 ? (
					<div>
						<div>
							<div className="inner">
								<EpidemicContainer
									Outbreak={this.props.Oubreak}
									size={TwobigPlot}
									margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
									time={this.state.time}
								/>
								<h1>Transmission tree</h1>
								<p>{this.props.Oubreak.transmissionToNewick()}</p>
								<TransmissionNetworkTree
									size={[w * 0.9, h * 0.9]}
									Outbreak={this.props.Oubreak}
									margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
									selectedCases={this.state.selectedCases}
									selectSample={this.selectSample}
									time={this.state.time}
									zoomNode={this.state.zoomNode}
									zoomToNode={this.zoomToNode}
									resetZoom={this.resetZoom}
								/>
							</div>
						</div>
						<div className="inner">
							<h1>Time tree</h1>

							<Phylotree
								size={[w * 0.9, h * 0.9]}
								Outbreak={this.props.Oubreak}
								margin={{ top: 50, right: 75, bottom: 50, left: 50 }}
								selectedCases={this.state.selectedCases}
								selectSample={this.selectSample}
							/>
						</div>
					</div>
				) : (
					<div />
				)}
				{this.state.selectedCases.length > 1 ? (
					<div className="container">
						<div>
							<h3>Selected samples</h3>
						</div>
						<div>
							<SelectedTransmissionNetwork
								size={TwobigPlot}
								margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
								Outbreak={this.props.Oubreak}
								selectedCases={this.state.selectedCases}
								time={this.state.time}
							/>
						</div>
						{/*<div>
							<SelectedPhyloTree
								size={TwobigPlot}
								margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
								Outbreak={this.props.Oubreak}
								selectedCases={this.state.selectedCases}
								time={this.state.time}
							/>
						</div>*/}
					</div>
				) : (
					<div />
				)}

				<div className="inner">
					<LineList
						Outbreak={this.props.Oubreak}
						selectSample={this.selectSample}
						selectedCases={this.state.selectedCases}
						time={this.state.time}
						zoomNode={this.state.zoomNode}
					/>
				</div>
			</div>
		);
	}
}

export default TransmissionPanels;
