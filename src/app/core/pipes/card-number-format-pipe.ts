import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'cardNoMask'
})
export class CardNumberFormatPipe implements PipeTransform {
	transform(value: string): string {
		if (value === '' || value == null) {
			return '';
		}
		return value.match(/.{1,4}/g).toString().replace(/,/g, ' ');
	}
}
