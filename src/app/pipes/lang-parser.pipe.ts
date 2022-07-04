import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
@Pipe({
	name: 'langparser'
})
export class LangParserPipe implements PipeTransform {
	constructor() {

	}

	transform(value: any, parser: string = 'ocean'): any {
		let result: string = '';
		parser = parser.toLowerCase();
		let lang = localStorage.getItem('language');
		switch (parser) {
			case 'ocean': {
				result = this.parseOcean(value, lang);
				break;
			}
			case 'json': {
				result = this.parseJson(value, lang);
				break;
			}
			default: {
				result = value;
				break;
			}
		}
		return result;
	}

	// TR:=DÜŞÜK RİSKLİ ;;EN:=
	parseOcean(value: string, lang: string): string {
		if (!value) {
			return;
		}

		let result: string = '';
		let langPrefix = lang.toLocaleUpperCase() + ':=';

		let hasKey: boolean = false;
		let values = value.toString().split(';;');
		values.forEach(item => {
			if (item.length >= 4 && item.substr(0, 4) === langPrefix) {
				result = item.substr(4, item.length - 4);
				hasKey = true;
			}
		});

		if (!result && !hasKey) {
			result = value;
		}

		return result;
	}

	// '{\'tr\':\'DÜŞÜK RİSKLİ\',\'en\':\'LOW RISK\'}'
	parseJson(value: string, lang: string): string {
		let result: string;
		lang = lang.toLowerCase();
		let langObject = JSON.parse(value);

		if (langObject[lang]) {
			result = langObject[lang];
		}

		return result;
	}

}
