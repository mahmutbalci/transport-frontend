export class StringHelper {
	public static convertToCamelCase(str) {
		let retVal = str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, function (match) {
			return match.charAt(match.length - 1).toUpperCase();
		});
		return retVal;
	}

	public static normalizeString(value: string): string {
		let charList = [];
		let replacedCharList = [];
		let i = 0;
		charList = unescape(value).toUpperCase().split('');
		charList.forEach(char => {
			if (char == null || char === '̇' || char == undefined) return;
			replacedCharList[i] = char.replace('Ç', 'C').replace('Ğ', 'G').replace('İ', 'I').replace('Ö', 'O').replace('Ş', 'S').replace('Ü', 'U');
			i++;
		});
		return replacedCharList.join('');
	}
}
