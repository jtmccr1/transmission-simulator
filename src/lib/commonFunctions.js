import * as jStat from 'jStat';
import * as d3 from 'd3';

// from http://bl.ocks.org/mbostock/4349187 from https://github.com/rambaut/Probability-of-Difference/blob/gh-pages/index.html
// Sample from a normal distribution with mean 0, stddev 1.
export const getData = (curriedF, xStep = 1, minP = 0.001, initial = 0) => {
	let data = [];
	let i = initial;
	let needSomeDensity = true;
	do {
		const el = {
			q: i,
			p: curriedF(i),
		};
		data.push(el);
		i = i + xStep;
		needSomeDensity = d3.max(data, d => d.p) < minP ? true : false; // So we don't stop too soon
	} while (data[data.length - 1].p > minP || needSomeDensity);
	return data;
};

export const drawAxis = (svgGroup, xScale, yScale, size, margins, xlab, ylab) => {
	//Make axis
	const xAxis = d3
		.axisBottom()
		.scale(xScale)
		.ticks(10);
	const yAxis = d3
		.axisLeft()
		.scale(yScale)
		.ticks(5);
	// draw Axis
	svgGroup
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', `translate(0,${size[1] - margins.top - margins.bottom} )`)
		.call(xAxis);
	// Add the text label for the x axis
	svgGroup
		.append('text')
		.attr('transform', `translate(${size[0] / 2},${size[1] - margins.top - margins.bottom + 30})`)
		.style('text-anchor', 'middle')
		.text(xlab);
	svgGroup
		.append('g')
		.attr('class', 'y axis')
		.attr('transform', `translate(${margins.left},0)`)
		.call(yAxis);
	// Add the text label for the Y axis
	svgGroup
		.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', margins.left - 45)
		.attr('x', 0 - size[1] / 2)
		.attr('dy', '1em')
		.style('text-anchor', 'middle')
		.text(ylab);
};

//By d. Knuth ref : https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables
export const poissonSample = lamda => {
	let L = Math.exp(-lamda);
	let k = 0;
	let p = 1;
	while (p > L) {
		k++;
		const u = Math.random();
		p = u * p;
	}
	return k - 1;
};

// export const negbinSample = (r, p) => {
// 	//sample lamda from gamma dist\
// 	const lamda = jStat.gamma.sample(r, 1 - p);
// 	//sample from poisson
// 	const sample = poissonSample(lamda);
// 	return sample;
// };

export const NegBinPMF = (k, r, p) => {
	if (k !== k >>> 0) {
		return false;
	}
	if (k < 0) {
		return 0;
	}
	return jStat.combination(k + r - 1, k) * Math.pow(p, k) * Math.pow(1 - p, r);
};

export const NegBinSample = (r, p) => {
	const u = Math.random();
	let k = 0;
	let indexes = [k];
	let cdf = NegBinPMF(k, r, p);
	while (cdf < u) {
		k++;
		indexes.push(k);
		cdf += NegBinPMF(k, r, p);
	}
	return k;
};

export const pdfFunctions = {
	LogNormal: jStat.lognormal.pdf,
	Gamma: jStat.gamma.pdf,
	NegativeBinomial: NegBinPMF,
};
export const cdfFunctions = {
	LogNormal: jStat.lognormal.cdf,
	Gamma: jStat.gamma.cdf,
};
export const meanFunctions = {
	LogNormal: jStat.lognormal.mean,
	Gamma: jStat.gamma.mean,
};
export const sampleDistribution = {
	LogNormal: jStat.lognormal.sample,
	Gamma: jStat.gamma.sample,
	NegativeBinomial: NegBinSample,
};
