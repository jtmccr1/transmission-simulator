import React, { Component } from 'react';
import seedrandom from 'seedrandom';
import Selectors from './Selectors';
import SerialInterval from './SerialInterval';
import NumberofTransmissions from './NumberofTransmissions';

import { pdfFunctions, sampleDistribution, NegBinSample, meanFunctions } from '../lib/commonFunctions';
import '../style/App.css';
import '../style/plots.css';
import { Outbreak } from '../lib/outbreak.js';
// import Clockyness from './ClockPlot';
import TransmissionPanels from './TransmissionPanels';
//https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const TwobigPlot = [w * 0.4, h * 0.5];
class App extends Component {
	constructor(props) {
		super(props);
		this.updateOnSelection = this.updateOnSelection.bind(this);
		this.updateOutbreak = this.updateOutbreak.bind(this);
		this.reset = this.reset.bind(this);
		this.state = {
			distributionOptions: ['Gamma', 'LogNormal'],
			distributionSelection: 'Gamma',
			distributionParameters: [8.4, 1.7],
			transmissionOptions: ['NegativeBinomial'],
			transmissionSelection: 'NegativeBinomial',
			transmissionParameters: [2.9, 0.38],
			randomSeed: 10,
			addDays: 100,
			Outbreak: new Outbreak(),
			time: 0,
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
		// set random seed if this is the first call
		if ((this.state.Outbreak.caseList.length === 1) & !this.state.Outbreak.index.children) {
			seedrandom(this.state.randomSeed, { global: true });
		}
		let activeInfections = this.state.Outbreak.caseList.filter(x => !x.children).length;

		if (activeInfections > 500) {
			alert('Reacted maximum number of active infections (500)');
		} else {
			//const R = sampleDistribution[this.state.transmissionSelection];
			const R = NegBinSample;
			const serialInterval = sampleDistribution[this.state.distributionSelection];
			const newTree = this.state.Outbreak;

			newTree.epiParams = {
				R0: () => R(...this.state.transmissionParameters),
				serialInterval: () => serialInterval(...this.state.distributionParameters),
			};

			const targetTime = this.state.time + this.state.addDays;
			newTree.time = targetTime;
			let needSpread = [1]; //  do it at least once to populate any "future" infections newTree.caseList.filter(node => (node.onset < targetTime) & !node.futureChildren);
			while ((needSpread.length > 0) & (needSpread.length < 500)) {
				newTree.spread();

				needSpread = newTree.caseList.filter(node => (node.onset < targetTime) & !node.futureChildren);
			}
			this.setState({
				Outbreak: newTree,
				time: targetTime,
				cases: newTree.caseList.filter(x => x.onset <= targetTime),
			});
			if (needSpread.length > 500) {
				alert('Reacted maximum number of active infections(500)');
			}
		}
	}
	reset() {
		this.setState({ Outbreak: new Outbreak(), time: 0, cases: [], selectedCases: [] });
		this.setState({
			zoomNode: this.state.Outbreak.indexCase,
		});
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
							time={this.state.time}
						/>
					</div>
					<div>
						<SerialInterval
							size={TwobigPlot}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={this.state.distributionParameters}
							pdf={pdfFunctions[this.state.distributionSelection]}
							mean={meanFunctions[this.state.distributionSelection]}
						/>
					</div>
					<div>
						<NumberofTransmissions
							size={TwobigPlot}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={this.state.transmissionParameters}
							pdf={pdfFunctions[this.state.transmissionSelection]}
						/>
					</div>
				</div>
				<div>
					<TransmissionPanels Outbreak={this.state.Outbreak} time={this.state.time} />
				</div>
			</div>
		);
	}
}

export default App;
