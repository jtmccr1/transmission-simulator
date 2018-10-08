import React, { Component } from 'react';
import seedrandom from 'seedrandom';
import Selectors from './Selectors';
import SerialInterval from './SerialInterval';
import NumberofTransmissions from './NumberofTransmissions';
import SerialIntervalTest from './SerialIntervalTest';
import NumberofTransmissionsTest from './NumberofTransmissionsTest';
import TransmissionNetworkTree from './TransmissionFixedNetwork';
import PhyloTree from './PhyloTree';
import LineList from './LineList';
import EpidemicContainer from './EpidemicContainer';
import { pdfFunctions, sampleDistribution, NegBinSample, meanFunctions } from '../lib/commonFunctions';
import '../style/App.css';
import '../style/plots.css';
import { Outbreak } from '../lib/outbreak.js';
import Clockyness from './ClockPlot';
class App extends Component {
	constructor(props) {
		super(props);
		this.updateOnSelection = this.updateOnSelection.bind(this);
		this.updateOutbreak = this.updateOutbreak.bind(this);
		this.reset = this.reset.bind(this);
		this.selectSample = this.selectSample.bind(this);
		this.state = {
			distributionOptions: ['Gamma', 'LogNormal'],
			distributionSelection: 'Gamma',
			distributionParameters: [1.5, 3],
			transmissionOptions: ['NegativeBinomial'],
			transmissionSelection: 'NegativeBinomial',
			transmissionParameters: [1.4, 0.5],
			randomSeed: 10,
			addDays: 5,
			transmissionTree: new Outbreak(),
			time: 0,
			cases: [],
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
		if ((this.state.transmissionTree.caseList.length === 1) & !this.state.transmissionTree.index.children) {
			seedrandom(this.state.randomSeed, { global: true });
		}
		let activeInfections = this.state.transmissionTree.caseList.filter(x => !x.children).length;

		if (activeInfections > 500) {
			alert('Reacted maximum number of active infections (500)');
		} else {
			//const R = sampleDistribution[this.state.transmissionSelection];
			const R = NegBinSample;
			const serialInterval = sampleDistribution[this.state.distributionSelection];
			const newTree = this.state.transmissionTree;

			newTree.epiParams = {
				R0: () => R(...this.state.transmissionParameters),
				serialInterval: () => serialInterval(...this.state.distributionParameters),
			};
			newTree.evoParams = {
				genomeLength: 3000,
				rateSiteYear: 0.01,
				rate: (0.01 * 3000) / 365,
			};

			let currentTime = this.state.time;
			const targetTime = currentTime + this.state.addDays;
			while (
				(currentTime < targetTime) &
				(newTree.caseList.filter(x => !x.children).length > 0) &
				(activeInfections < 500)
			) {
				newTree.spread();
				currentTime = newTree.caseList
					.map(node => node.onset)
					.reduce((max, cur) => Math.max(max, cur), -Infinity);
				activeInfections = newTree.caseList.filter(x => !x.children).length;
			}
			this.setState({
				transmissionTree: newTree,
				time: targetTime,
				cases: newTree.caseList.filter(x => x.onset <= targetTime),
			});
			if (activeInfections > 500) {
				alert('Reacted maximum number of active infections(500)');
			}
		}
	}
	reset() {
		this.setState({ transmissionTree: new Outbreak(), time: 0, cases: [], selectedCases: [] });
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
							data={this.state.cases}
							time={this.state.time}
						/>
					</div>
					<div>
						<SerialInterval
							size={[700, 500]}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={this.state.distributionParameters}
							pdf={pdfFunctions[this.state.distributionSelection]}
							mean={meanFunctions[this.state.distributionSelection]}
						/>
					</div>
					<div>
						<NumberofTransmissions
							size={[700, 500]}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={this.state.transmissionParameters}
							pdf={pdfFunctions[this.state.transmissionSelection]}
						/>
					</div>
				</div>
				{this.state.transmissionTree.caseList.length > 1 ? (
					<div>
						<div className="container">
							<div>
								<h2>Empirical parameters</h2>
							</div>
							<div>
								<SerialIntervalTest
									size={[700, 500]}
									margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
									Outbreak={this.state.transmissionTree}
								/>
							</div>
							<div>
								<NumberofTransmissionsTest
									size={[700, 500]}
									margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
									Outbreak={this.state.transmissionTree}
								/>
							</div>
						</div>
						<div className="container">
							<div>
								<h2> Outbreak characteristics</h2>
							</div>
							<EpidemicContainer
								data={this.state.cases}
								size={[700, 500]}
								margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							/>
							<Clockyness
								size={[700, 500]}
								margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
								Outbreak={this.state.transmissionTree}
							/>
						</div>
						<div>
							<div>
								<div className="inner">
									{/*<PhyloTree
										Outbreak={this.state.transmissionTree}
										margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
										size={[1500, 800]}
									/>*/}
									<h1>Transmission tree</h1>
									<TransmissionNetworkTree
										size={[1500, 800]}
										data={this.state.cases}
										Outbreak={this.state.transmissionTree}
										margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
										selectedCases={this.state.selectedCases}
										selectSample={this.selectSample}
									/>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div />
				)}
				<div className="inner">
					<LineList data={this.state.cases} Outbreak={this.state.transmissionTree} />
				</div>
			</div>
		);
	}
}

export default App;
