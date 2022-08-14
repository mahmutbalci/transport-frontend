import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'arnMask'
})
export class ArnFormatPipe implements PipeTransform {
	transform(value: string): string {
		if (value === '' || value == null) return '';
		let newValue = '';
		try {
			newValue = value.substring(0, 1) + ' ' + value.substring(1, 7) + ' ' + value.substring(7, 11) + ' ' + value.substring(11, 22) + ' ' + value.substring(22, 23);
			return newValue;
		} catch {
			return value;
		}
	}
}
