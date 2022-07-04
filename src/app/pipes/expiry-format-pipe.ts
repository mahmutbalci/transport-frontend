import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'expiryFormat'
})

export class DateMmyyyyFormatPipe implements PipeTransform {
	transform(value: any): string {
		if (!value || value === '0' || value === 0) {
			return '0';
		}
		value = value.toString().padStart(6, '0');
		return value.substr(4, 2) + '-' + value.substr(0, 4);
	}
}

@Pipe({
	name: 'expiryFormatTxn'
})

export class DateMmyyyyFormatTxnPipe implements PipeTransform {
	transform(value): string {
		if (!value || value === '0' || value === 0) {
			return '0';
		}
		value = value.toString().padStart(4, '0');
		return value.substr(2, 2) + '-' + '20' + value.substr(0, 2);
	}
}

// YYMMDD to DD.MM.YYYY
@Pipe({
	name: 'YYMMDDToDDMMYYYY'
})
export class YYMMDDToDDMMYYYYPipe implements PipeTransform {
	transform(value): string {
		if (!value || value === '0' || value === 0) {
			return '0';
		}

		value = value.toString().padStart(6, '0');
		let year = '20' + value.substr(0, 2);
		let month = value.substr(2, 2);
		let days = value.substr(4, 2).padStart(2, '0');
		return days + '.' + month + '.' + year;
	}
}

// YYMM to MM.YYYY
@Pipe({
	name: 'YYMMToMMYYYY'
})
export class YYMMToMMYYYYPipe implements PipeTransform {
	transform(value): string {
		if (!value || value === '0' || value === 0) {
			return '0';
		}

		value = value.toString().padStart(4, '0');
		let year = '20' + value.substr(0, 2);
		let month = value.substr(2, 2);
		return month + '.' + year;
	}
}
