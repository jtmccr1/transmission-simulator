import React from 'react';
import Sliderselector from './Sliderselectors';
import InputBox from './InputBox';

const Selectors = props => {
	const distributionOptions = props.distributionOptions.map((x, i) => (
		<option value={x} key={i}>
			{x}
		</option>
	));

	const distributionSlidersOptions = {
		LogNormal: [
			{
				min: 0.1,
				max: 5,
				step: 0.5,
				name: 'mu',
				label: `mu: ${props.distributionParameters[0]}`,
				value: props.distributionParameters[0],
				updater: props.updater,
				stateKey: 'distributionParameters',
				index: 0,
			},
			{
				min: 0.1,
				max: 3,
				step: 0.2,
				name: 'sigma',
				label: `sigma: ${props.distributionParameters[1]}`,
				value: props.distributionParameters[1],
				updater: props.updater,
				stateKey: 'distributionParameters',
				index: 1,
			},
		],
		Gamma: [
			{
				min: 0.1,
				max: 10,
				step: 0.1,
				name: 'shape1',
				label: `shape: ${props.distributionParameters[0]}`,
				value: props.distributionParameters[0],
				updater: props.updater,
				stateKey: 'distributionParameters',
				index: 0,
			},
			{
				min: 0.1,
				max: 10,
				step: 0.1,
				name: 'scale',
				label: `scale: ${props.distributionParameters[1]}`,
				value: props.distributionParameters[1],
				updater: props.updater,
				stateKey: 'distributionParameters',
				index: 1,
			},
		],
	};

	const distributionSliders = distributionSlidersOptions[props.distributionSelection].map((x, i) => (
		<Sliderselector {...x} key={i} />
	));

	const transmissionOptions = props.transmissionOptions.map((x, i) => (
		<option value={x} key={i}>
			{x}
		</option>
	));

	const transmissionSlidersOptions = {
		/* LogNormal: [
			{
				min: 0.002,
				max: 5,
				step: 0.005,
				name: 'mu',
				label: `mu: ${props.transmissionParameters[0]}`,
				value: props.transmissionParameters[0],
				updater: props.updater,
				stateKey: 'transmissionParameters',
				index: 0,
			},
			{
				min: 0.02,
				max: 3,
				step: 0.02,
				name: 'sigma',
				label: `sigma: ${props.transmissionParameters[1]}`,
				value: props.transmissionParameters[1],
				updater: props.updater,
				stateKey: 'transmissionParameters',
				index: 1,
			},
		],
		Gamma: [
			{
				min: 0.1,
				max: 10,
				step: 0.1,
				name: 'shape1',
				label: `shape: ${props.transmissionParameters[0]}`,
				value: props.transmissionParameters[0],
				updater: props.updater,
				stateKey: 'transmissionParameters',
				index: 0,
			},
			{
				min: 0.1,
				max: 10,
				step: 0.1,
				name: 'scale',
				label: `scale: ${props.transmissionParameters[1]}`,
				value: props.transmissionParameters[1],
				updater: props.updater,
				stateKey: 'transmissionParameters',
				index: 1,
			},
		], */
		NegativeBinomial: [
			{
				min: 1,
				max: 10,
				step: 0.1,
				name: 'r',
				label: `r: ${props.transmissionParameters[0]}`,
				value: props.transmissionParameters[0],
				updater: props.updater,
				stateKey: 'transmissionParameters',
				index: 0,
			},
			{
				min: 0.01,
				max: 1,
				step: 0.01,
				name: 'p',
				label: `p: ${props.transmissionParameters[1]}`,
				value: props.transmissionParameters[1],
				updater: props.updater,
				stateKey: 'transmissionParameters',
				index: 1,
			},
		],
	};

	const transmissionSliders = transmissionSlidersOptions[props.transmissionSelection].map((x, i) => (
		<Sliderselector {...x} key={i} />
	));
	const activeInfections = props.data.filter(x => !x.contactEvents).length;
	const status = activeInfections === 0 ? 'Ended' : 'On going';

	return (
		<div>
			<h3>Setup</h3>
			<label>Serial Interval Distribution</label>

			<select
				value={props.distributionSelection}
				onChange={e => props.updater('distributionSelection', 0, e, false)}
			>
				{distributionOptions}
			</select>
			<div>{distributionSliders}</div>
			<label>Number of Transmissions</label>
			<select
				value={props.transmissionSelection}
				onChange={e => props.updater('transmissionSelection', 0, e, false)}
			>
				{transmissionOptions}
			</select>
			<div>{transmissionSliders}</div>
			<h3>Simulate Transmission</h3>
			<div>
				<label>Set Random Seed</label>
				<InputBox updater={props.updater} value={props.randomSeed} stateKey={'randomSeed'} />
			</div>
			<div>
				<label>Days to add to current outbreak</label>
				<InputBox updater={props.updater} value={props.addDays} stateKey={'addDays'} />
			</div>
			<button onClick={props.buttonAction}>Run Outbreak</button>
			<button onClick={props.reset}>Reset</button>
			<h4>{`Status: ${status} (${props.time} days)`}</h4>
			<h4>{`Cases: ${props.data.length} (${activeInfections} active cases)`}</h4>
		</div>
	);
};
export default Selectors;
