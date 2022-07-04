import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'timeFormat'
})
export class TimeFormatPipe implements PipeTransform {
	transform(value: string, length: number = 6): string {
		if (value) {
			value = value.toString().padStart(length, '0');
			if (length === 6) {
				return value.substr(0, 2) + ':' + value.substr(2, 2) + ':' + value.substr(4, 2);
			} else if (length === 4) {
				return value.substr(0, 2) + ':' + value.substr(2, 2);
			} else {
				return value;
			}
		}
	}
}
