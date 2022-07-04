import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'lastUpdated'
})
export class LastUpdatedPipe implements PipeTransform {
	transform(value: string): string {
		if (value) {
			if (value.toString().length >= 8) {
				return value.toString().substr(0, 4) + '.' + value.toString().substr(4, 2) + '.' + value.toString().substr(6, 2);
			} else {
				return null;
			}
		}
	}
}
