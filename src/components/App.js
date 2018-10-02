import React, { Component } from 'react';
import Selectors from './Selectors';
import SerialInterval from './SerialInterval';
import NumberofTransmissions from './NumberofTransmissions';
import { pdfFunctions, meanFunctions, sampleDistribution } from '../lib/commonFunctions';
import '../style/App.css';
import '../style/plots.css';
import { Outbreak } from '../lib/outbreak.js';
class App extends Component {
	constructor(props) {
		super(props);
		this.updateOnSelection = this.updateOnSelection.bind(this);
		this.updateOutbreak = this.updateOutbreak.bind(this);
		this.reset = this.reset.bind(this);
		this.state = {
			distributionOptions: ['Gamma', 'LogNormal'],
			distributionSelection: 'Gamma',
			distributionParameters: [1.5, 3],
			transmissionOptions: ['Gamma', 'LogNormal'],
			transmissionSelection: 'Gamma',
			transmissionParameters: [1, 1.1],
			randomSeed: 43,
			addDays: 0,
			transmissionTree: new Outbreak(),
		};
	}
	updateOnSelection(key, index, event, numeric = true) {
		let newState = {};
		const newValue = numeric ? parseFloat(event.target.value) : event.target.value;
		if (Array.isArray(this.state[key])) {
			newState[key] = this.state[key].slice();
			newState[key][index] = newValue;
		} else {
			newState[key] = newValue;
		}

		this.setState(newState);
	}

	updateOutbreak() {
		const R0 = sampleDistribution[this.state.transmissionSelection];
		const serialInterval = sampleDistribution[this.state.distributionSelection];
		const newTree = this.state.transmissionTree;
		newTree.epiParams = {
			R0: () => R0(...this.state.transmissionParameters),
			serialInterval: () => serialInterval(...this.state.distributionParameters),
		};
		newTree.spread();
		this.setState({ transmissionTree: newTree });
		console.log(this.state.transmissionTree);
	}
	reset() {
		this.setState({ transmissionTree: new Outbreak() });
	}

	render() {
		return (
			<div>
				<div className="container">
					<div>
						<Selectors
							updater={this.updateOnSelection}
							options={this.state.conditionalOptions}
							distributionOptions={this.state.distributionOptions}
							distributionSelection={this.state.distributionSelection}
							distributionParameters={this.state.distributionParameters}
							transmissionParameters={this.state.transmissionParameters}
							transmissionOptions={this.state.transmissionOptions}
							transmissionSelection={this.state.transmissionSelection}
							randomSeed={this.state.randomSeed}
							addDays={this.state.addDays}
							buttonAction={this.updateOutbreak}
							reset={this.reset}
						/>
					</div>
					<div>
						<SerialInterval
							size={[700, 500]}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={this.state.distributionParameters}
							pdf={pdfFunctions[this.state.distributionSelection]}
						/>
					</div>
					<div>
						<NumberofTransmissions
							size={[700, 500]}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={this.state.transmissionParameters}
							pdf={pdfFunctions[this.state.transmissionSelection]}
							meanFunction={meanFunctions[this.state.transmissionSelection]}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
