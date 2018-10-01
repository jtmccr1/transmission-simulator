import React from 'react';

export default function InputBox(props) {
	// function updatePositions(evt) {
	// 	if (evt.keyCode === 13) {
	// 		const value = evt.target.value;
	// 		const seg = value.split(':')[0];
	// 		props.filterPosition({ seg: seg, pos: positionsArray });
	// 		}
	// 		//const object = evt.target.value;
	// 		// console.log(object);
	// 		//
	// 	}
	// }
	// function updateText(evt) {
	// 	props.updateDisplay(evt.target.value);
	// }

	return (
		<div className="inputBox">
			<label>{props.label}</label>
			<br />
			<input
				type="text"
				placeholder={props.placeHolder}
				onChange={e => props.updater(props.stateKey, props.index, e)}
				value={props.value ? props.value : ''}
				// onKeyDown={updatePositions}
			/>
		</div>
	);
}
