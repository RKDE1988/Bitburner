import { RebalanceEmployees, cities, productCity } from './Corp/rebalance_employee.js'
import { aggro_Start } from './Corp/Beginning.js'



const colors = {
	black: "\u001b[30m",
	red: "\u001b[31m",
	green: "\u001b[32m",
	yellow: "\u001b[33m",
	blue: "\u001b[34m",
	magenta: "\u001b[35m",
	cyan: "\u001b[36m",
	white: "\u001b[37m",
	brightBlack: "\u001b[30;1m",
	brightRed: "\u001b[31;1m",
	brightGreen: "\u001b[32;1m",
	brightYellow: "\u001b[33;1m",
	brightBlue: "\u001b[34;1m",
	brightMagenta: "\u001b[35;1m",
	brightCyan: "\u001b[36;1m",
	brightWhite: "\u001b[37;1m",
	reset: "\u001b[0m"
};

/**
 * @readonly
 * @enum {number}
 */
const upgradelistEnum = {
	insight: 0,
	dreamSense: 1,
	salesBots: 2,
	factories: 3,
	storage: 4,
	accelerators: 5,
	injector: 6,
	focusWires: 7,
	speech: 8,
	wilson: 9
}

const upgradeList = [
	// lower priority value -> upgrade faster
	{ prio: 2, name: "Project Insight", displayname: 'PI' },
	{ prio: 2, name: "DreamSense", displayname: 'DS' },
	{ prio: 4, name: "ABC SalesBots", displayname: 'Sales' },
	{ prio: 4, name: "Smart Storage", displayname: 'Stor' },
	{ prio: 4, name: "Smart Factories", displayname: 'Fact' },
	{ prio: 8, name: "Neural Accelerators", displayname: 'NA' },
	{ prio: 8, name: "Nuoptimal Nootropic Injector Implants", displayname: 'NNII' },
	{ prio: 8, name: "FocusWires", displayname: 'Wire' },
	{ prio: 8, name: "Speech Processor Implants", displayname: 'SPI' },
	{ prio: 4, name: "Wilson Analytics", displayname: 'WA' },
];
const laboratory = "Hi-Tech R&D Laboratory"
const marketTAI = "Market-TA.I";
const marketTAII = "Market-TA.II";
const researchList = [
	// lower priority value -> upgrade faster
	{ prio: 10, name: "Overclock", agri: true },
	{ prio: 10, name: "uPgrade: Fulcrum", agri: false },
	{ prio: 15, name: "uPgrade: Capacity.I", agri: false },
	//{ prio: 15, name: "uPgrade: Capacity.II", agri:false },
	{ prio: 10, name: "Self-Correcting Assemblers", agri: true },
	{ prio: 21, name: "Drones", agri: true },
	{ prio: 4, name: "Drones - Assembly", agri: true },
	{ prio: 8, name: "Drones - Transport", agri: true },
	{ prio: 26, name: "Automatic Drug Administration", agri: true },
	{ prio: 10, name: "CPH4 Injections", agri: true },
	{ prio: 10, name: "JoyWire", agri: true },
	{ prio: 10, name: "Go-Juice", agri: true },
	{ prio: 15, name: "Sti.mu", agri: true },
	{ prio: 20, name: "AutoBrew", agri: true },
	{ prio: 20, name: "AutoPartyManager", agri: true },
];

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('disableLog');
	ns.disableLog('sleep');
	ns.tail();
	await aggro_Start(ns);
	//for (var Division of Corp.divisions)
	//	ns.tprint(Division);
	let divs = ns.corporation.getCorporation().divisions;
	while (true) {
		let Div = ns.corporation.getDivision(divs[1]);

		upgradeWarehouses(ns, Div);
		hireAdvert(ns, Div);
		upgradeCorp(ns);
		hireEmployees(ns, Div);
		newProduct(ns, Div);

		for (var str_div of divs)
			doResearch(ns, ns.corporation.getDivision(str_div));

		display(ns, Div);
		await ns.sleep(100);

	}

}

/**
 * @param {NS} ns
 * @param {Division} division
 */
function upgradeWarehouses(ns, div) {
	for (const city of cities) {
		// check if warehouses are near max capacity and upgrade if needed
		let cityWarehouse = ns.corporation.getWarehouse(div.name, city);
		if (cityWarehouse.sizeUsed > 0.9 * cityWarehouse.size) {
			if (ns.corporation.getCorporation().funds > ns.corporation.getUpgradeWarehouseCost(div.name, city)) {
				ns.print(div.name + " Upgrade warehouse in " + city);
				ns.corporation.upgradeWarehouse(div.name, city);
			}
		}
	}
}

/**
 * @param {NS} ns
 * @param {Division} division
 */
function hireAdvert(ns, division) {
	if (ns.corporation.getUpgradeLevel(upgradeList[upgradelistEnum.wilson].name) >= 8) {
		// Upgrade AdVert.Inc after a certain amount of Wilson Analytivs upgrades are available
		if (ns.corporation.getCorporation().funds > (4 * ns.corporation.getHireAdVertCost(division.name))) {
			ns.print(division.name + " Hire AdVert");
			ns.corporation.hireAdVert(division.name);
		}
	}
}
/**
 * @param {NS} ns
 */
function upgradeCorp(ns) {
	for (const upgrade of upgradeList) {
		// purchase upgrades based on available funds and priority; see upgradeList
		if (ns.corporation.getCorporation().funds > (upgrade.prio * ns.corporation.getUpgradeLevelCost(upgrade.name))) {
			// those two upgrades ony make sense later once we can afford a bunch of them and already have some base marketing from DreamSense
			if ((upgrade.name != upgradeList[upgradelistEnum.salesBots].name
				&& upgrade.name != upgradeList[upgradelistEnum.wilson].name)
				|| (ns.corporation.getUpgradeLevel(upgradeList[upgradelistEnum.dreamSense].name) >= 20)) {
				ns.print("Upgrade " + upgrade.name + " to " + (ns.corporation.getUpgradeLevel(upgrade.name) + 1));
				ns.corporation.levelUpgrade(upgrade.name);
			}
		}
	}
	if (!ns.corporation.hasUnlockUpgrade("Shady Accounting") && ns.corporation.getUnlockUpgradeCost("Shady Accounting") * 2 < ns.corporation.getCorporation().funds) {
		ns.print("Unlock Shady Accounting")
		ns.corporation.unlockUpgrade("Shady Accounting");
	}
	else if (!ns.corporation.hasUnlockUpgrade("Government Partnership") && ns.corporation.getUnlockUpgradeCost("Government Partnership") * 2 < ns.corporation.getCorporation().funds) {
		ns.print("Unlock Government Partnership")
		ns.corporation.unlockUpgrade("Government Partnership");
	}
}


/**
 * @param {NS} ns
 * @param {Division} division
 */
function hireEmployees(ns, division) {

	let numbers = 3;
	let completecost = 0;
	let hired = false;
	for (const city of cities) {
		completecost += ns.corporation.getOfficeSizeUpgradeCost(division.name, city, numbers);
	}
	if (ns.corporation.getCorporation().funds > completecost) {

		for (const city of cities) {
			completecost += ns.corporation.getOfficeSizeUpgradeCost(division.name, city, numbers);
		}
		// upgrade all cities + 3 employees if sufficient funds
		ns.print(division.name + " Upgrade office size");
		hired = true;
		for (const city of cities) {
			ns.corporation.upgradeOfficeSize(division.name, city, numbers);
			for (let i = 0; i < numbers; i++) {
				ns.corporation.hireEmployee(division.name, city);
			}
		}
	}


	if (hired) {
		RebalanceEmployees(ns, division, productCity, cities);
	}
}

/**
 * @param {NS} ns
 * @param {Division} division
 * @returns {boolean}
 */
function newProduct(ns, division) {
	//ns.print("Products: " + division.products);
	var productNumbers = [];
	for (var product of division.products) {
		if (ns.corporation.getProduct(division.name, product).developmentProgress < 100) {
			//ns.print(division.name + " Product development progress: " + ns.corporation.getProduct(division.name, product).developmentProgress.toFixed(1) + "%");
			return false;
		}
		else {
			productNumbers.push(product.charAt(product.length - 1));
			// initial sell value if nothing is defined yet is 0
			if (ns.corporation.getProduct(division.name, product).sCost == 0) {
				ns.print(division.name + " Start selling product " + product);
				ns.corporation.sellProduct(division.name, productCity, product, "MAX", "MP", true);
				if (ns.corporation.hasResearched(division.name, "Market-TA.II")) {
					ns.corporation.setProductMarketTA1(division.name, product, true);
					ns.corporation.setProductMarketTA2(division.name, product, true);
				}
			}
		}
	}

	let numProducts = 3;
	// amount of products which can be sold in parallel is 3; can be upgraded
	if (ns.corporation.hasResearched(division.name, "uPgrade: Capacity.I")) {
		numProducts = 4;
		if (ns.corporation.hasResearched(division.name, "uPgrade: Capacity.II")) {
			numProducts = 5;
		}
	}

	if (productNumbers.length >= numProducts) {
		// discontinue the oldest product if over max amount of products
		ns.print(division.name + " Discontinue product " + division.products[0]);
		ns.corporation.discontinueProduct(division.name, division.products[0]);
	}

	// get the product number of the latest product and increase it by 1 for the mext product. Product names must be unique. 
	var newProductNumber = 0;
	if (productNumbers.length > 0) {
		newProductNumber = parseInt(productNumbers[productNumbers.length - 1]) + 1;
		// cap product numbers to one digit and restart at 0 if > 9.
		if (newProductNumber > 9) {
			newProductNumber = 0;
		}
	}
	const newProductName = division.name + "-" + newProductNumber;
	let productInvest = 1e9;
	if (productInvest < division.lastCycleRevenue / 10) {
		productInvest = division.lastCycleRevenue / 10;
		if (ns.corporation.getCorporation().funds < (2 * productInvest))
			return false;
	}
	if (ns.corporation.getCorporation().funds < (2 * productInvest)) {
		if (ns.corporation.getCorporation().funds <= 0) {
			ns.print("WARN negative funds, cannot start new product development " + ns.formatNumber(ns.corporation.getCorporation().funds));
			return false;
			// productInvest = 0; // product development with 0 funds not possible if corp has negative funds
		}
		else {
			productInvest = Math.floor(ns.corporation.getCorporation().funds / 2);
		}
	}
	ns.print("Start new product development " + newProductName);
	ns.corporation.makeProduct(division.name, productCity, newProductName, productInvest, productInvest);
	return true;
}

/**
 * @param {NS} ns
 * @param {Division} division
 */
function doResearch(ns, division) {

	if (!ns.corporation.hasResearched(division.name, laboratory)) {
		// always research labaratory first
		if (division.research > ns.corporation.getResearchCost(division.name, laboratory)) {
			ns.print(division.name + " Research " + laboratory);
			ns.corporation.research(division.name, laboratory);
		}
	}
	else if (!ns.corporation.hasResearched(division.name, marketTAII)) {
		// always research Market-TA.I plus .II first and in one step
		var researchCost = ns.corporation.getResearchCost(division.name, marketTAI)
			+ ns.corporation.getResearchCost(division.name, marketTAII);

		if (division.research > researchCost * 1.1) {
			ns.print(division.name + " Research " + marketTAI);
			ns.corporation.research(division.name, marketTAI);
			ns.print(division.name + " Research " + marketTAII);
			ns.corporation.research(division.name, marketTAII);
			RebalanceEmployees(ns, division, productCity, cities);
			for (var product of division.products) {
				ns.corporation.setProductMarketTA1(division.name, product, true);
				ns.corporation.setProductMarketTA2(division.name, product, true);
			}
		}
		return;
	}
	else {
		for (const researchObject of researchList) {
			// research other upgrades based on available funds and priority; see researchList
			if ((division.type !== "Agriculture" || researchObject.agri) && !ns.corporation.hasResearched(division.name, researchObject.name)) {
				if (division.research > (researchObject.prio * ns.corporation.getResearchCost(division.name, researchObject.name))) {
					ns.print(division.name + " Research " + researchObject.name);
					ns.corporation.research(division.name, researchObject.name);
				}
			}
		}
	}
}
let prev_Research = 0;
let research_save = 0;
/**
 * @param {NS} ns
 * @param {Division} division
 */
function display(ns, division) {

	division = ns.corporation.getDivision(division.name);
	ns.clearLog();
	const bordercolor = colors.blue;
	const textColor = colors.reset;
	const numbercolor = colors.yellow;
	const border = bordercolor + '|';
	const borderline = bordercolor + "".padEnd(50, "-");
	ns.print(borderline);

	let corp = ns.corporation.getCorporation();
	let profit = textColor + ' Funds:' + numbercolor + ns.formatNumber(corp.funds, 1).padStart(7).padEnd(8);
	let profit_increase = textColor + ' ^    :' + numbercolor + ns.formatNumber((corp.revenue - corp.expenses) * 10, 1).padStart(7).padEnd(8);
	let market2 = textColor + ' TII: ' + numbercolor + ns.corporation.hasResearched(division.name, marketTAII).toString().padStart(5).padEnd(6);
	if (ns.corporation.hasResearched(division.name, marketTAII)) {
		let res_Ges = 0;
		let res_done = 0;
		for (let r of researchList) {
			res_Ges++;
			if (ns.corporation.hasResearched(division.name, r.name))
				res_done++;
		}
		market2 = textColor + ' Res: ' + numbercolor + (res_done.toString().padStart(3) + '/' + res_Ges.toString().padStart(2)).padEnd(6);
	}
	let div_income = textColor + ' DI:' + numbercolor + ns.formatNumber(corp.dividendEarnings * 10).padStart(8).padEnd(6);
	let res = textColor + 'Research: ' + numbercolor + ns.formatNumber(division.research).padStart(7).padEnd(8);
	let res_increase = textColor + '^Res.: ' + numbercolor + ns.formatNumber(division.research - research_save).padStart(9).padEnd(11);
	if (prev_Research !== division.research) {
		research_save = prev_Research;
		prev_Research = division.research;
	}
	ns.print(border, profit, border, border, market2, border, border, res, border);
	ns.print(border, profit_increase, border, border, div_income, border, border, res_increase, border);
	ns.print(borderline);
	let lines = [];
	for (let upg of upgradeList) {
		lines.push(`${textColor}${upg.displayname.padEnd(6).padStart(8)}: ${numbercolor}${ns.corporation.getUpgradeLevel(upg.name).toString().padStart(3).padEnd(5)}`);
	}
	while (lines.length % 3 > 0)
		lines.push(`${textColor}${''.padEnd(6).padStart(8)}: ${numbercolor}${''.padStart(3).padEnd(5)}`);
	const complines = Math.floor(lines.length / 3);

	for (let i = 0; i < complines; i++) {
		ns.print(border, lines[i * 3], border, border, lines[i * 3 + 1], bordercolor, border, border, lines[i * 3 + 2], bordercolor, border);
	}

	ns.print(borderline);
	for (let citylong of cities) {
		/**@type{string} */
		let city = citylong;
		const office = ns.corporation.getOffice(division.name, city);
		const wh = ns.corporation.getWarehouse(division.name, city);
		const name = textColor + ' ' + city.substring(0, 3) + ' ';
		const empl = numbercolor + office.employees.toString().padStart(4) + '/' + office.size.toString().padStart(4) + ' ';
		const emplStats = numbercolor + Math.floor(office.avgHap + office.avgMor + office.avgEne).toString().padStart(5) + '/' + Math.floor(office.maxHap + office.maxMor + office.maxEne).toString().padStart(4) + '  ';
		//const emplHappy = numbercolor + office.avgHap.toString().padStart(4) + '/' + office.maxHap.toString().padStart(4) + ' ';
		//const emplMot = numbercolor + office.avgMor.toString().padStart(4) + '/' + office.maxMor.toString().padStart(4) + ' ';
		//const emplEne = numbercolor + office.avgEne.toString().padStart(4) + '/' + office.maxEne.toString().padStart(4) + ' ';
		const warehouse = numbercolor + ns.formatNumber(wh.sizeUsed).padStart(9) + '/' + ns.formatNumber(wh.size).padStart(9)
		ns.print(border, name, border, empl, border, warehouse, border, emplStats, border);
	}
	ns.print(borderline);
	//ns print()
}