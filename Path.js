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
	ns.disableLog('ALL')
	var Mark = ns.args[0];
	/**@type{Array<string>} */
	var Lst = [];
	/**@type{Array<string>} */
	var End_Lst = [];
	var EndLine = '';
	ScanWriter(ns, 'home', 'home', 0, Mark, Lst, End_Lst);
	if (Lst.length === 0) {
		ns.tprint('nicht gefunden');
	}
	else for (let i = Lst.length - 1; i >= 0; i--) {
		//ns.tprint(Lst[i]);
		EndLine += End_Lst[i];
	}
	eval(`const terminalInput = document.getElementById("terminal-input");
	terminalInput.value = '${EndLine}';
	const handler = Object.keys(terminalInput)[1];
	terminalInput[handler].onChange({ target: terminalInput });
	terminalInput[handler].onKeyDown({key:'Enter',preventDefault:()=>null});`);
}
export function autocomplete(data, args) {
	return [...data.servers];
}
/** 
 * @param {NS} ns 
 * @param {string} host
 * @param {string} source
 * @param {number} level
 * @param {string} mark
 * @param {Array<string>} lst
 * @returns {bool}
 * */
function ScanWriter(ns, host, source, level, mark, lst, end_Lst) {
	/**@type{string} */
	var Suffix;
	if (level > 0)
		Suffix = ''.padEnd(level, '-') + '>';
	else
		Suffix = '';
	for (const S of ns.scan(host))
		if (S !== source) {
			let line = (Suffix + S).padEnd(50) + ' R:' + ns.hasRootAccess(S).toString().padEnd(5) + ' H:' + ns.getServerRequiredHackingLevel(S).toString().padStart(3);
			if (S === mark) {
				lst.push(colors.red + line);
				end_Lst.push(`connect ${S}; `);
				return true;
			}

			if (ScanWriter(ns, S, host, level + 1, mark, lst, end_Lst)) {
				lst.push(line);
				end_Lst.push(`connect ${S}; `);
				return true;
			}
		}
	return false;

}