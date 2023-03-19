/**
 * @typedef {Object} Server
 * @property {string} name
 * @property {number} money
 * @property {number} time
 * @property {number} moneyPerTime
 * @property {number} chance
 * @property {number} moneyPerTimeChance
 */

/** @param {NS} ns */
export async function main(ns) {
	ns.clearLog();
	ns.disableLog('ALL');
	const File_Json = '/Hack/CIjson.txt';
	/** @type{Array<Server>} */
	let targets = [];
	let SaveTop;
	if (ns.args.length > 0)
		SaveTop = ns.args[0];
	else SaveTop = 0;


	GetTargets(ns, 'home', 'home', targets);

	targets.sort((a, b) => a.moneyPerTimeChance - b.moneyPerTimeChance);

	let MaxLengeth = 0;
	for (const S of targets) {
		MaxLengeth = Math.max(MaxLengeth, S.name.length);
	}



	if (SaveTop > 0) {
		let SaveArray = [];
		for (let i = targets.length - 1; i >= 0, SaveTop > 0; i--, SaveTop--) {
			SaveArray.push(targets[i].name);
		}
		var j = JSON.stringify(SaveArray);
		ns.tprint(j);
		ns.write(File_Json, j, 'w');
	}
	else {
		for (const S of targets) {
			let ServerRow = S.name.padEnd(MaxLengeth);
			let MoneyRow = ns.formatNumber(S.money).padStart(10);
			let TimeRow = ns.tFormat(S.time).padStart(20);
			let MoneyPerTimeRow = (`${ns.formatNumber(S.moneyPerTime)} €/s`).padStart(14);
			let ChanceRow = ns.formatPercent(S.chance, 1).padStart(7);
			let MoneyPerTimeChanceRow = (`${ns.formatNumber(S.moneyPerTimeChance)} €/s`).padStart(14);
			ns.print(`${ServerRow} ${MoneyRow} ${TimeRow} ${MoneyPerTimeRow} ${ChanceRow} ${MoneyPerTimeChanceRow}`);
		}
		ns.tail(ns.pid);
		await ns.sleep(10);
		ns.resizeTail(900, 200, ns.pid);
	}
}

/**
 * @param {NS} ns
 * @param {string} host -
 * @param {string} source -
 * @param {Array<Server>} targets -
 */
function GetTargets(ns, host, source, targets) {
	for (const S of ns.scan(host)) {
		if (S !== source && ns.hasRootAccess(S)) {
			if (ns.getServerMaxMoney(S) > 0 && ns.getServerRequiredHackingLevel(S) <= ns.getHackingLevel()) {
				let Money = ns.getServerMaxMoney(S);
				let Time = calculateHackingTime(ns, S);
				let MoneyPerTime = Money / Time;
				let Chance = ns.hackAnalyzeChance(S);
				let MoneyPerTimeChance = MoneyPerTime * Chance;
				/** @type {Server} */
				let Ele = { name: S, money: Money, time: Time, moneyPerTime: MoneyPerTime, chance: Chance, moneyPerTimeChance: MoneyPerTimeChance };
				targets.push(Ele);
			}
			GetTargets(ns, S, host, targets);
		}
	}
}
/**
 * @param {NS} ns -
 * @param {string} host -
 * @returns {number} -
 */
function calculateHackingTime(ns, host) {
	const difficultyMult = ns.getServerRequiredHackingLevel(host) * ns.getServerMinSecurityLevel(host);

	const baseDiff = 500;
	const baseSkill = 50;
	const diffFactor = 2.5;
	let skillFactor = diffFactor * difficultyMult + baseDiff;

	skillFactor /= ns.getHackingLevel() + baseSkill;

	const hackTimeMultiplier = 5;

	const hackingTime =
		(hackTimeMultiplier * skillFactor) /
		(ns.getHackingMultipliers().speed * 1 /*calculateIntelligenceBonus(ns.int, 1)*/);

	return hackingTime * 1000;
}