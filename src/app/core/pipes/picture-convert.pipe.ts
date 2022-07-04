import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'pictureConvert'
})
export class PictureConvertPipe implements PipeTransform {
	transform(value: string): any {
		if (value) {
			return 'data:image/jpeg;base64,' + value;
		}

		return null;
	}
}
