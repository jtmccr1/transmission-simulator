import React from 'react';
import '../style/selectors.css';
const Sliderselector = props => {
	return (
		<div>
			<label>{props.label}</label>
			<input
				type={'range'}
				min={props.min}
				max={props.max}
				step={props.step}
				name={props.name}
				value={props.value}
				onChange={e => props.updater(props.stateKey, props.index, e)}
				className="sliderSelector"
			/>
		</div>
	);
};
export default Sliderselector;
