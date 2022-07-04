import { Pipe, PipeTransform } from '@angular/core';
import { LangParserPipe } from './lang-parser.pipe';

@Pipe({
	name: 'lookup'
})
export class LookupPipe implements PipeTransform {
	constructor(private langparser: LangParserPipe) {

	}
	transform(value: any, lookupList: any[], withCode: boolean = false, parseLang: boolean = false): any {
		if (typeof value !== 'boolean' && (value !== 0 && (!value || value == null))) {
			return '';
		}

		let newValue: any = value;
		if (typeof value === 'boolean') {
			newValue = value ? 1 : 0;
		}

		let result: any = value;
		if (typeof lookupList !== 'undefined' && lookupList != null) {
			lookupList.forEach(element => {
				if (element.code === newValue) {
					let desc = element.description;
					if (parseLang) {
						desc = this.langparser.transform(desc);
					}

					if (withCode) {
						result = element.code + '-' + desc;
					} else {
						result = desc;
					}
				}
			});
		}

		return result;
	}
}
