import React, { Component } from 'react';
import seedrandom from 'seedrandom';
import Selectors from './Selectors';
import SerialInterval from './SerialInterval';
import NumberofTransmissions from './NumberofTransmissions';

import { pdfFunctions, sampleDistribution, NegBinSample, meanFunctions } from '../lib/commonFunctions';
import '../style/App.css';
import '../style/plots.css';
import TransmissionPanels from './TransmissionPanels';
//https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

const TwobigPlot = [w * 0.4, h * 0.5];
const SelectionPanels = props=> {
		return (
			<div>
				<div className="container">
					<div>
						<Selectors
							updater={props.updater}
							options={props.options}
							distributionOptions={props.distributionOptions}
							distributionSelection={props.distributionSelection}
							distributionParameters={props.distributionParameters}
							transmissionParameters={props.transmissionParameters}
							transmissionOptions={props.transmissionOptions}
							transmissionSelection={props.transmissionSelection}
							randomSeed={props.randomSeed}
							addDays={props.addDays}
							buttonAction={props.buttonAction}
							reset={props.reset}
							time={props.time}
						/>
					</div>
					<div>
						<SerialInterval
							size={TwobigPlot}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={props.distributionParameters}
							pdf={pdfFunctions[props.distributionSelection]}
							mean={meanFunctions[props.distributionSelection]}
						/>
					</div>
					<div>
						<NumberofTransmissions
							size={TwobigPlot}
							margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
							params={props.transmissionParameters}
							pdf={pdfFunctions[props.transmissionSelection]}
						/>
					</div>
				</div>
			</div>
		);
	}


export default SelectionPanels;
