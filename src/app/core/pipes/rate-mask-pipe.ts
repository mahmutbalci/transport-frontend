import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'rateMask'
})
export class RateFormatPipe implements PipeTransform {
	transform(value: string): string {
		if ((value === '' || value === null) && value !== '0') {
			return '';
		}

		return '% ' + value;
	}
}

@Pipe({
	name: 'rateTimes100'
})
export class RateTimes100FormatPipe implements PipeTransform {
	transform(value: any, fixedLength: number = 16): string {
		if ((typeof value === 'string' && (!value || isNaN(+value) || +value == 0)) || (typeof value === 'number' && (!value || value == 0))) {
			return '';
		}

		if (typeof value === 'number' || (typeof value === 'string' && !isNaN(+value))) {
			return '% ' + (+value * 100).toFixed(fixedLength);
		}

		return '';
	}
}

@Pipe({
	name: 'divideTo100'
})
export class DivideTo100Pipe implements PipeTransform {
	transform(value: any, fixedLength: number = 16): string {
		if ((typeof value === 'string' && (!value || isNaN(+value) || +value == 0)) || (typeof value === 'number' && (!value || value == 0))) {
			return '';
		}

		if (typeof value === 'number' || (typeof value === 'string' && !isNaN(+value))) {
			return (+value / 100).toFixed(fixedLength);
		}

		return '';
	}
}
