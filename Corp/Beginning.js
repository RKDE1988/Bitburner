import { RebalanceEmployees, SetEmployess, cities, productCity } from './Corp/rebalance_employee.js'

const corp_Name = "Moma Bigguns";
const agriculture_Name = "Moma Aggro";
const healer_Name = "Moma Autschy";
const materialPhases = [
	[125, 0, 75, 27000],
	[2675, 96, 2445, 119400],
	[6500, 630, 3750, 84000]
];
const boostMaterials = ["Hardware", "Robots", "AI Cores", "Real Estate"];

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("disableLog");
	ns.disableLog("sleep");
	ns.tail();
	await aggro_Start(ns);
}
/** @param {NS} ns */
export async function aggro_Start(ns) {
	if (!ns.corporation.hasCorporation())
		beginning(ns);
	if (ns.corporation.getMaterial(agriculture_Name, productCity, boostMaterials[0]).qty < materialPhases[0][0])
		await purchaseMaterials(ns, 0);
	if (ns.corporation.getInvestmentOffer().round == 1) {
		await employeesMax(ns);
		await getInvestment(ns, 1);
	}
	if (ns.corporation.getOffice(agriculture_Name, productCity).employees < 9) {
		afterFirstInvestment(ns);
	}
	if (ns.corporation.getMaterial(agriculture_Name, productCity, boostMaterials[0]).qty < materialPhases[1][0])
		await purchaseMaterials(ns, 1);
	if (ns.corporation.getInvestmentOffer().round == 2) {
		await employeesMax(ns);
		await getInvestment(ns, 2);
	}
	if (!ns.corporation.getCorporation().public) {
		ns.corporation.goPublic(0);
		ns.corporation.issueDividends(0.01);
	}
	if (ns.corporation.getMaterial(agriculture_Name, productCity, boostMaterials[0]).qty < materialPhases[2][0]) {
		afterSecondInvestment(ns);
		await purchaseMaterials(ns, 2);
	}
	if (ns.corporation.getCorporation().divisions.length < 2) {
		createHealthcare(ns);
	}
}
/** @param {NS} ns */
function beginning(ns) {

	ns.corporation.createCorporation(corp_Name, true);


	ns.corporation.expandIndustry("Agriculture", agriculture_Name);
	ns.corporation.unlockUpgrade("Smart Supply");
	ns.print('Corp Created');
	for (let city of cities) {
		if (city != cities[0]) {
			ns.corporation.expandCity(agriculture_Name, city);
			ns.corporation.purchaseWarehouse(agriculture_Name, city);
		}
		ns.corporation.setSmartSupply(agriculture_Name, city, true);

		while (ns.corporation.hireEmployee(agriculture_Name, city));

		ns.corporation.setAutoJobAssignment(agriculture_Name, city, "Operations", 1);
		ns.corporation.setAutoJobAssignment(agriculture_Name, city, "Engineer", 1);
		ns.corporation.setAutoJobAssignment(agriculture_Name, city, "Business", 1);

		ns.corporation.sellMaterial(agriculture_Name, city, "Plants", "MAX", "MP");
		ns.corporation.sellMaterial(agriculture_Name, city, "Food", "MAX", "MP");
		ns.print("Expanded to ", city)
	}
	ns.print('Corp Expanded');
	ns.corporation.hireAdVert(agriculture_Name);
	ns.corporation.levelUpgrade("Smart Factories");
	ns.corporation.levelUpgrade("FocusWires");
	ns.corporation.levelUpgrade("Neural Accelerators");
	ns.corporation.levelUpgrade("Speech Processor Implants");
	ns.corporation.levelUpgrade("Nuoptimal Nootropic Injector Implants");
	ns.corporation.levelUpgrade("Smart Factories");
	ns.corporation.levelUpgrade("FocusWires");
	ns.corporation.levelUpgrade("Neural Accelerators");
	ns.corporation.levelUpgrade("Speech Processor Implants");
	ns.corporation.levelUpgrade("Nuoptimal Nootropic Injector Implants");
	ns.print('Corp Upgrated');
	for (let i = 0; i < 2; i++)
		for (let city of cities)
			ns.corporation.upgradeWarehouse(agriculture_Name, city, 1);
}

/** 
 * @param {NS} ns 
 * @param {number} phase 
 * */
async function purchaseMaterials(ns, phase) {
	let startHardware = ns.corporation.getMaterial(agriculture_Name, productCity, boostMaterials[0]).qty;
	for (let city of cities)
		for (let i = 0; i < 4; i++)
			ns.corporation.buyMaterial(agriculture_Name, city, boostMaterials[i], materialPhases[phase][i] / 10);

	ns.print('Wait until material bought');
	while (startHardware === ns.corporation.getMaterial(agriculture_Name, productCity, boostMaterials[0]).qty)
		await ns.sleep(100);
	ns.print('Material bought');

	for (let city of cities)
		for (let i = 0; i < 4; i++)
			ns.corporation.buyMaterial(agriculture_Name, city, boostMaterials[i], 0);
}
/** 
 * @param {NS} ns 
 * */
async function employeesMax(ns) {
	let lopper = true;
	while (lopper) {
		lopper = false;
		for (let city of cities) {
			let office = ns.corporation.getOffice(agriculture_Name, city);
			if (office.avgEne < 99) {
				ns.corporation.buyCoffee(agriculture_Name, city)
				lopper = true;
			}
			if (office.avgHap < 99 || office.avgMor < 99) {
				ns.corporation.throwParty(agriculture_Name, city, 10000000);
				lopper = true;
			}
		}
		await ns.sleep(1000);
	}
}
/** 
 * @param {NS} ns 
 * */
async function getInvestment(ns, round) {
	if (ns.corporation.getInvestmentOffer().round == round) {
		await upgradeWarehouses(ns);
		//await inflateInvestment(ns);
		let amount = Number.MAX_VALUE;


		while (ns.corporation.getInvestmentOffer().round == round) {
			let max_amount = amount * 0.97;

			await inflateInvestment(ns);
			amount = ns.corporation.getInvestmentOffer().funds;
			let startamount = amount * 1.1;

			while (max_amount > amount && (amount <= startamount || amount <= ns.corporation.getInvestmentOffer().funds)) {
				let currentAmount = ns.corporation.getInvestmentOffer().funds;
				if (currentAmount !== amount) {
					amount = currentAmount;
					ns.print(`Investmentoffer${ns.corporation.getInvestmentOffer().round}: amount:${ns.formatNumber(amount)}`);
				}
				if (max_amount > amount)
					await ns.sleep(100);
			}
			if (max_amount <= amount) {
				ns.print("Got Investemnt: ", ns.formatNumber(ns.corporation.getInvestmentOffer().funds));
				ns.corporation.acceptInvestmentOffer();
				break;
			}
			else
				ns.print(`Investmentoffer${ns.corporation.getInvestmentOffer().round}: MaxAmount:${ns.formatNumber(amount)}`);
		}
	}
}
/** 
 * @param {NS} ns 
 * */
async function inflateInvestment(ns) {
	ns.print("inflateInvestment");


	for (const city of cities) {
		// put all employees into production to produce as fast as possible 
		const employees = ns.corporation.getOffice(agriculture_Name, city).employees;
		ns.corporation.sellMaterial(agriculture_Name, city, "Plants", "0", "MP");
		ns.corporation.sellMaterial(agriculture_Name, city, "Food", "0", "MP");

		SetEmployess(ns, agriculture_Name, city, employees, 0, 0, 0, 0, 0);
	}

	ns.print("Wait for warehouses to fill up");
	//ns.print("Warehouse usage: " + refWarehouse.sizeUsed + " of " + refWarehouse.size);
	let allWarehousesFull = false;
	while (!allWarehousesFull) {

		allWarehousesFull = true;
		for (const city of cities) {
			let warehouse = ns.corporation.getWarehouse(agriculture_Name, city);
			if (warehouse.sizeUsed <= (0.98 * ns.corporation.getWarehouse(agriculture_Name, city).size)) {
				allWarehousesFull = false;
				break;
			}
		}
		await ns.sleep(5000);
	}
	ns.print("Warehouses are full, start selling");
	for (const city of cities) {
		// put all employees into production to produce as fast as possible 
		const posEmployees = ns.corporation.getOffice(agriculture_Name, city).employees / 3;
		ns.corporation.sellMaterial(agriculture_Name, city, "Plants", "MAX", "MP");
		ns.corporation.sellMaterial(agriculture_Name, city, "Food", "MAX", "MP");
		SetEmployess(ns, agriculture_Name, city, posEmployees, posEmployees, posEmployees, 0, 0, 0);
	}
}

/** 
 * @param {NS} ns 
 * */
async function upgradeWarehouses(ns) {
	let upgraded = true;

	while (upgraded) {
		upgraded = false;
		let min_stor = Number.MAX_VALUE;
		for (const city of cities) {
			let store = ns.corporation.getWarehouse(agriculture_Name, city).size;
			if (store < min_stor)
				min_stor = store;
		}
		for (const city of cities) {
			if (ns.corporation.getWarehouse(agriculture_Name, city).size <= min_stor && ns.corporation.getCorporation().funds > ns.corporation.getUpgradeWarehouseCost(agriculture_Name, city)) {
				ns.print(agriculture_Name + " Upgrade warehouse in " + city);
				ns.corporation.upgradeWarehouse(agriculture_Name, city);
				upgraded = true;
			}
		}
		await ns.sleep(100);
	}
}
/** 
 * @param {NS} ns 
 * */
function afterFirstInvestment(ns) {
	for (const city of cities) {
		while (ns.corporation.getOffice(agriculture_Name, city).employees < 9) {
			ns.corporation.upgradeOfficeSize(agriculture_Name, city, 3);
			while (ns.corporation.hireEmployee(agriculture_Name, city));
		}
	}

	for (const city of cities) {
		SetEmployess(ns, agriculture_Name, city, 2, 2, 1, 2, 2, 0);
	}

	while (ns.corporation.getUpgradeLevel("Smart Factories") < 10)
		ns.corporation.levelUpgrade("Smart Factories");
	while (ns.corporation.getUpgradeLevel("Smart Storage") < 10)
		ns.corporation.levelUpgrade("Smart Storage");

	for (const city of cities)
		while (ns.corporation.getWarehouse(agriculture_Name, city).size < 2000)
			ns.corporation.upgradeWarehouse(agriculture_Name, city);

}

/** 
 * @param {NS} ns 
 * */
function afterSecondInvestment(ns) {

	for (const city of cities) {
		SetEmployess(ns, agriculture_Name, city, 2, 2, 1, 2, 2, 0);
	}

	for (const city of cities)
		while (ns.corporation.getWarehouse(agriculture_Name, city).size < 3800)
			ns.corporation.upgradeWarehouse(agriculture_Name, city);

}
/** 
 * @param {NS} ns 
 * */
function createHealthcare(ns) {
	ns.corporation.expandIndustry('Healthcare', healer_Name);
	for (let city of cities) {
		if (city != cities[0]) {
			ns.corporation.expandCity(healer_Name, city);
			ns.corporation.purchaseWarehouse(healer_Name, city);
		}

		while (ns.corporation.getWarehouse(healer_Name, city).size < 3800)
			ns.corporation.upgradeWarehouse(healer_Name, city);

		while (ns.corporation.getOffice(healer_Name, city).employees < 60) {
			ns.corporation.upgradeOfficeSize(healer_Name, city, 3);
			while (ns.corporation.hireEmployee(healer_Name, city));
		}

		ns.corporation.setSmartSupply(healer_Name, city, true);
	}
	let division = ns.corporation.getDivision(healer_Name);
	RebalanceEmployees(ns, division, productCity, cities);

	let productInvest = 1e9;
	const newProductName = healer_Name + "-0";
	ns.corporation.makeProduct(healer_Name, productCity, newProductName, productInvest, productInvest);
	ns.corporation.levelUpgrade("Project Insight");
	ns.corporation.levelUpgrade("Project Insight");
	while ((ns.corporation.getUpgradeLevelCost("Project Insight") + ns.corporation.getUpgradeLevelCost("Neural Accelerators")) < ns.corporation.getCorporation().funds) {
		ns.corporation.levelUpgrade("Neural Accelerators");
		ns.corporation.levelUpgrade("Project Insight");
	}
}