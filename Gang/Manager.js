/**
 * @typedef {Object} Equipment 
 * @property {string} name
 * @property {number} cost
 * @property {number} prio
 * */

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
const gangs = ['Slum Snakes', 'The Syndicate', 'The Dark Army', 'Speakers for the Dead', 'The Black Hand', 'Tetrads', 'NiteSec']
const MemberNames = ["1Genie", "2Myconid", "3Ogre", "4Pixie", "5Treant", "6Troglo", "7Loco", "8Puppet", "9Stretch", "0Eternity", "AZen", "BCable"];
/**@type{boolean} */
let combatgang;
/**@type{Array<Equipment>} */
let equipment = [];
let equipment_Augmentation = [];
let min_winChance = Number.MAX_VALUE;

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	//ns.clearLog();
	ns.tail();
	combatgang = !ns.gang.getGangInformation().isHacking;
	for (let equ of ns.gang.getEquipmentNames()) {
		let prio = 5;
		let type = ns.gang.getEquipmentType(equ);
		if (type === "Augmentation") {

			let stats = ns.gang.getEquipmentStats(equ);
			if (combatgang) {
				if (stats.str > 0
					|| stats.def > 0
					|| stats.dex > 0
					|| stats.agi > 0)
					prio = 1;
				else
					prio = 20;
			}
			else {
				if (stats.hack > 0)
					prio = 1;
				else
					prio = 30;
			}
		}
		else if (combatgang) {
			if (type === "Rootkit")
				prio = 3000;
			else
				prio = 4;
		}
		else {
			if (type !== "Rootkit")
				prio = 3000;
			else
				prio = 4;
		}
		/**@type{Equipment} */
		let ele = { name: equ, cost: ns.gang.getEquipmentCost(equ), prio: prio };
		if (type === "Augmentation")
			equipment_Augmentation.push(ele);
		else
			equipment.push(ele);

	}
	equipment = equipment.sort((a, b) => (a.cost * a.prio) - (b.cost * b.prio));
	equipment_Augmentation = equipment_Augmentation.sort((a, b) => (a.cost * a.prio) - (b.cost * b.prio));
	while (true) {

		//ns.clearLog();

		const gangInfo = ns.gang.getGangInformation();
		let membernames = ns.gang.getMemberNames();
		/**@type {Array<GangMemberInfo>} */
		let memberarray = [];
		for (let name of membernames) {
			memberarray.push(ns.gang.getMemberInformation(name));
		}

		min_winChance = Number.MAX_VALUE;
		for (let gang of gangs)
			if (gang !== gangInfo.faction)
				if (ns.gang.getOtherGangInformation()[gang].territory > 0) {
					let chance = ns.gang.getChanceToWinClash(gang);
					min_winChance = Math.min(min_winChance, chance);
				}

		if (gangInfo.territory >= 1) {
			if (gangInfo.territoryWarfareEngaged)
				ns.gang.setTerritoryWarfare(false);
		}
		else if (!gangInfo.territoryWarfareEngaged && membernames.length >= 12) {
			if (min_winChance > 0.7)
				ns.gang.setTerritoryWarfare(true);
		}




		if (ns.gang.canRecruitMember())
			RecruitProspect(ns, membernames);



		for (let mem of memberarray) {
			Prepare(ns, mem);

			let next_Mult;
			let current_Mult;
			if (combatgang) {
				let next_Point = ns.formulas.gang.ascensionPointsGain(mem.agi_exp);
				let next_Mult_agi = ns.formulas.gang.ascensionMultiplier(mem.agi_asc_points + next_Point);
				next_Point = ns.formulas.gang.ascensionPointsGain(mem.dex_exp);
				let next_Mult_dex = ns.formulas.gang.ascensionMultiplier(mem.dex_asc_points + next_Point);
				next_Point = ns.formulas.gang.ascensionPointsGain(mem.def_exp);
				let next_Mult_def = ns.formulas.gang.ascensionMultiplier(mem.def_asc_points + next_Point);
				next_Point = ns.formulas.gang.ascensionPointsGain(mem.str_exp);
				let next_Mult_str = ns.formulas.gang.ascensionMultiplier(mem.str_asc_points + next_Point);
				next_Mult = (next_Mult_agi + next_Mult_def + next_Mult_dex + next_Mult_str) / 4;

				current_Mult = (mem.agi_asc_mult + mem.def_asc_mult + mem.dex_asc_mult + mem.str_asc_mult) / 4;

			}
			else {
				let next_Point = ns.formulas.gang.ascensionPointsGain(mem.hack_exp);
				next_Mult = ns.formulas.gang.ascensionMultiplier(mem.hack_asc_points + next_Point);

				current_Mult = mem.hack_asc_mult;

			}
			if (gangInfo.territory >= 1 || !gangInfo.territoryWarfareEngaged || current_Mult < 6 || min_winChance >= 0.97)
				if (memberarray.length >= 12 || current_Mult < 6)
					if ((next_Mult / current_Mult) >= CalculateAscendTreshold(current_Mult)) {
						ns.gang.ascendMember(mem.name);

					}


		}
		GiveAssignments(ns, gangInfo, memberarray);

		display(ns, gangInfo);
		await ns.sleep(1000);
	}


}

/**Recruit a new prospect to a full gang member.
 * @param {NS} ns
 * @param {Array<string>} currentMembers
 */
function RecruitProspect(ns, currentMembers) {

	let availableNames = MemberNames.filter(x => !currentMembers.includes(x));
	ns.gang.recruitMember(availableNames[0]);
}
/** 
 * @param {GangMemberInfo} gangster
 * @returns {number}
 */
function AvgCombat(gangster) {
	return (gangster.agi + gangster.def + gangster.dex + gangster.str) / 4;
}
/** 
 * @param {GangMemberInfo} gangster
 * @returns {number}
 */
function GetRelevantSkill(gangster) {
	if (combatgang)
		return AvgCombat(gangster);
	else
		return gangster.hack;
}
/** 
 * @param {NS} ns
 * @param {GangGenInfo} gangInfo
 * @param {Array<GangMemberInfo>} memberarray
 * @param {number} skillLevel
 * @returns {number}
 */
function GiveAssignments(ns, gangInfo, memberarray) {
	let NumberReadyWar = 0;
	for (let member of memberarray) {
		const skillLevel = GetRelevantSkill(member);
		const war = ns.gang.getTaskStats("Territory Warfare");

		let earnedRespect = member.earnedRespect;
		/**@type{GangTaskStats} */
		let task = null;

		// TRAIN
		if (skillLevel < 400 && earnedRespect < 500) {
			if (gangInfo.isHacking)
				task = ns.gang.getTaskStats("Train Hacking");
			else
				task = ns.gang.getTaskStats("Train Combat");
		}

		else if (earnedRespect < 10000) {
			// Raise Respect
			let max = Number.MIN_VALUE;
			for (let tn of ns.gang.getTaskNames()) {
				let TI = ns.gang.getTaskStats(tn);

				let res = ns.formulas.gang.respectGain(gangInfo, member, TI);
				if (res > max) {
					max = res;
					task = TI;
				}
			}
		}
		else if (gangInfo.wantedPenalty < 0.9) {
			//reduce Wanted
			let min = Number.MAX_VALUE;
			for (let tn of ns.gang.getTaskNames()) {
				let TI = ns.gang.getTaskStats(tn);

				let WG = ns.formulas.gang.wantedLevelGain(gangInfo, member, TI)
				if (WG < min) {
					min = WG;
					task = TI;
				}
			}
		}
		else if (memberarray.length < 12) {
			let max = Number.MIN_VALUE;
			for (let tn of ns.gang.getTaskNames()) {
				let TI = ns.gang.getTaskStats(tn);

				let res = ns.formulas.gang.respectGain(gangInfo, member, TI) * 500 + ns.formulas.gang.moneyGain(gangInfo, member, TI);
				if (res > max) {
					max = res;
					task = TI;
				}
			}
		}
		else if (min_winChance < 0.97 && ((gangInfo.territory < 1 && ns.getServerMoneyAvailable("home") > 5e6) || gangInfo.territoryWarfareEngaged)) {
			task = war;
		}

		else {
			// Raise Money
			let max = Number.MIN_VALUE;
			for (let tn of ns.gang.getTaskNames()) {
				let TI = ns.gang.getTaskStats(tn);

				let res = ns.formulas.gang.moneyGain(gangInfo, member, TI);
				if (res > max) {
					max = res;
					task = TI;
				}
			}
		}

		ns.gang.setMemberTask(member.name, task.name);
	}

}
/** 
 * @param {NS} ns
 * @param {GangGenInfo} gangInfo
 * @param {GangMemberInfo} member
 * @param {number} skillLevel
 * @returns {number}
 */
function Prepare(ns, member) {
	//let bought = true;
	//while (bought) {
	//	bought = false;
	for (let equ of equipment_Augmentation) {
		if (!member.upgrades.includes(equ.name) && !member.augmentations.includes(equ.name)) {
			if (ns.getServerMoneyAvailable('home') > ns.gang.getEquipmentCost(equ.name) * equ.prio) {
				ns.gang.purchaseEquipment(member.name, equ.name);
				//				bought = true;
			}

		}
	}
	for (let equ of equipment) {
		if (!member.upgrades.includes(equ.name) && !member.augmentations.includes(equ.name)) {
			if (ns.getServerMoneyAvailable('home') > ns.gang.getEquipmentCost(equ.name) * equ.prio) {
				ns.gang.purchaseEquipment(member.name, equ.name);
				//				bought = true;
			}

		}
	}
	//	await ns.sleep(10);
	//}
}

// Credit: Mysteyes. https://discord.com/channels/415207508303544321/415207923506216971/940379724214075442
function CalculateAscendTreshold(mult) {
	if (mult < 1.632) return 1.6326;
	else if (mult < 2.336) return 1.4315;
	else if (mult < 2.999) return 1.284;
	else if (mult < 3.363) return 1.2125;
	else if (mult < 4.253) return 1.1698;
	else if (mult < 4.860) return 1.1428;
	else if (mult < 5.455) return 1.1225;
	else if (mult < 5.977) return 1.0957;
	else if (mult < 6.496) return 1.0869;
	else if (mult < 7.008) return 1.0789;
	else if (mult < 7.519) return 1.073;
	else if (mult < 8.025) return 1.0673;
	else if (mult < 8.513) return 1.0631;
	else return 1.0591;
}

/** 
 * @param {NS} ns
 * @param {GangGenInfo} gangInfo
 */
function display(ns, gangInfo) {
	ns.clearLog();
	const bordercolor = colors.blue;
	const textColor = colors.reset;
	const numbercolor = colors.yellow;
	const border = bordercolor + '|';
	const borderline = bordercolor + "".padEnd(50, "-");

	const gangIncome = gangInfo.moneyGainRate * 5;
	const gangRespect = ns.formatNumber(gangInfo.respect, 2);


	let gangsymbol;
	if (combatgang)
		gangsymbol = "C  ";
	else
		gangsymbol = "H  ";
	let membernames = ns.gang.getMemberNames();
	/**@type {Array<GangMemberInfo>} */
	let memberarray = [];
	for (let name of membernames) {
		memberarray.push(ns.gang.getMemberInformation(name));
	}
	/**@type {Array<GangMemberInfo>} */
	const skillSort = memberarray.sort((b, a) => GetRelevantSkill(a) - GetRelevantSkill(b));

	ns.print(borderline);
	ns.print(border, textColor, "Gang: ", gangsymbol, border, textColor, " Income: ", numbercolor, ns.formatNumber(gangIncome).padStart(8).padEnd(9), border, textColor, "  Respect: ", numbercolor, gangRespect.padStart(7).padEnd(9), border);
	ns.print(border, numbercolor, ns.formatPercent(min_winChance, 1).padStart(6).padEnd(9), border, textColor, " Terr  : ", numbercolor, ns.formatPercent(gangInfo.territory, 3).padStart(8).padEnd(9), border, textColor, "   Clash: ", numbercolor, ns.formatPercent(gangInfo.territoryClashChance).padStart(8).padEnd(10), border);
	ns.print(borderline);

	for (let MI of memberarray) {
		let Stats;
		let Multi;
		if (combatgang) {
			Stats = AvgCombat(MI);
			Multi = (MI.agi_asc_mult + MI.def_asc_mult + MI.dex_asc_mult + MI.str_asc_mult) / 4;
		}
		else {
			Stats = MI.hack;
			Multi = MI.hack_asc_mult;
		}
		let total = ns.gang.getEquipmentNames().length;
		let have = 0;
		for (var equ of ns.gang.getEquipmentNames())
			if (MI.upgrades.includes(equ) || MI.augmentations.includes(equ))
				have++;

		ns.print(border, textColor, MI.name.padEnd(10), border, numbercolor, ns.formatNumber(Stats, 1).padStart(6).padEnd(7), border, numbercolor, ns.formatPercent(Multi, 0).padStart(7).padEnd(8), border, numbercolor, ' ', have.toString().padStart(2), textColor, "/", total, ' ', numbercolor, border, numbercolor, MI.task.substr(0, 11).padStart(12).padEnd(13), border);
	}
	ns.print(borderline);

}