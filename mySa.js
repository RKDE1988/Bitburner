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

/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('ALL');
	MAXHack = 0;
	TotalRAM = 0;

	var Mark = ns.args[0];
	ScanWriter(ns, 'home', 'home', 0, Mark);
	ns.tprint(`Max Hack: ${MAXHack} TotalRAM${ns.formatRam(TotalRAM)}`);
}

var TotalRAM = 0;
var MAXHack = 0;
/** 
 * @param {NS} ns 
 * @param {string} host
 * @param {string} source
 * @param {number} level
 * @param {string} mark
 * */
function ScanWriter(ns, host, source, level, mark) {
	/**@type{string} */
	var Suffix;
	if (level > 0)
		Suffix = ''.padEnd(level, '-') + '>';
	else
		Suffix = '';
	for (const S of ns.scan(host))
		if (S !== source) {
			let Hack = ns.getServerRequiredHackingLevel(S);
			let RAM = ns.getServerMaxRam(S);
			if (MAXHack < Hack)
				MAXHack = Hack;
			TotalRAM += RAM;
			let line = `${(Suffix + S).padEnd(50)} R: ${ns.hasRootAccess(S).toString().padEnd(5)} H: ${Hack.toString().padStart(4)} RAM:${ns.formatRam(RAM).padStart(9)}`;

			if (mark && S.includes(mark))
				ns.tprint(colors.red + line);
			else if (Hack > ns.getHackingLevel())
				ns.tprint(colors.yellow + line);
			else
				ns.tprint(line);
			ScanWriter(ns, S, host, level + 1, mark);
		}

}

export function autocomplete(data, args) {
	return [...data.servers];
}