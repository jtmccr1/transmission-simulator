const jStat = require('jStat');
const poissonSample = lamda => {
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

const NegBinPMF = (k, r, p) => {
	if (k !== k >>> 0) {
		return false;
	}
	if (k < 0) {
		return 0;
	}
	return jStat.combination(k + r - 1, k) * Math.pow(p, k) * Math.pow(1 - p, r);
};

const NegBinSample = (r, p) => {
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
poissonSample(1);

const testData = [];
for (let i = 0; i < 100000; i++) {
	testData.push(NegBinSample(2, 0.5));
}

console.log(testData.reduce((acc, curr) => acc + curr, 0) / testData.length);
console.log(`Expected: ${(2 * (1 - 0.5)) / 0.5}`);
