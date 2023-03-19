const DivName = "Big Mama Health";
const RedoCities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
export const cities = ["Sector-12", "Aevum", "Volhaven", "Chongqing", "New Tokyo", "Ishima"];
export const productCity = cities[0];
/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('disableLog');
	var divs = ns.corporation.getCorporation().divisions;
	for (let i of divs) {
		let Div = ns.corporation.getDivision(i);

		RebalanceEmployees(ns, Div, RedoCities[0], RedoCities);
	}
}
/**
 * @param {NS} ns
 * @param {Division} division
 * @param {string} productCity
 * @param {Array<string>} cities
 */
export function RebalanceEmployees(ns, division, productCity, cities) {


	// set jobs after hiring people just in case we hire lots of people at once and setting jobs is slow
	for (let city of cities) {
		while (ns.corporation.hireEmployee(division.name, city));
		let employees = ns.corporation.getOffice(division.name, city).employees;
		if (ns.corporation.hasResearched(division.name, "Market-TA.II")) {
			ns.corporation.setAutoJobAssignment(division.name, city, "Operations", 0);
			ns.corporation.setAutoJobAssignment(division.name, city, "Engineer", 0);
			ns.corporation.setAutoJobAssignment(division.name, city, "Business", 0);
			ns.corporation.setAutoJobAssignment(division.name, city, "Management", 0);
			ns.corporation.setAutoJobAssignment(division.name, city, "Research & Development", 0);
			ns.corporation.setAutoJobAssignment(division.name, city, "Training", 0);
			if (city == productCity) {
				let bEmpl = Math.ceil(employees / 5);
				SetEmployess(ns, division.name, city, bEmpl, bEmpl, bEmpl, employees - (3 * bEmpl), 0, 0);
			}
			else {
				var remainingEmployees = employees - (Math.floor(employees / 5) + Math.floor(employees / 10) + 1 + Math.ceil(employees / 100));
				SetEmployess(ns, division.name, city, Math.floor(employees / 10), 1, Math.floor(employees / 5), Math.ceil(employees / 100), remainingEmployees, 0);

			}
		}
		else {
			if (city == productCity) {
				SetEmployess(ns, division.name, city, Math.floor((employees - 2) / 2), Math.ceil((employees - 2) / 2), 0, 2, 0, 0);
			}
			else {
				SetEmployess(ns, division.name, city, 1, 1, 0, 0, (employees - 2), 0);
			}
		}
	}

}
/**
 * @param {NS} ns
 * @param {string} name
 * @param {string} city
 * @param {number} operations
 * @param {number} engineer
 * @param {number} business
 * @param {number} management
 * @param {number} researchAndDevelopment
 * @param {number} training
 */
export function SetEmployess(ns, name, city, operations, engineer, business, management, researchAndDevelopment, training) {
	ns.corporation.setAutoJobAssignment(name, city, "Operations", 0);
	ns.corporation.setAutoJobAssignment(name, city, "Engineer", 0);
	ns.corporation.setAutoJobAssignment(name, city, "Business", 0);
	ns.corporation.setAutoJobAssignment(name, city, "Management", 0);
	ns.corporation.setAutoJobAssignment(name, city, "Research & Development", 0);
	ns.corporation.setAutoJobAssignment(name, city, "Training", 0);

	ns.corporation.setAutoJobAssignment(name, city, "Operations", operations);
	ns.corporation.setAutoJobAssignment(name, city, "Engineer", engineer);
	ns.corporation.setAutoJobAssignment(name, city, "Business", business);
	ns.corporation.setAutoJobAssignment(name, city, "Management", management);
	ns.corporation.setAutoJobAssignment(name, city, "Research & Development", researchAndDevelopment);
	ns.corporation.setAutoJobAssignment(name, city, "Training", training);
}