import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TxnCurrencyDefService } from '@common/txn/txnCurrencyDef.service';
import { ODataParamsModel } from '@core/_base/crud/models/odata-params.model';
import { CacheService } from '@core/_base/layout/services/cache.service';

@Pipe({
	name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {
	currencyList = [];
	constructor(private currencyPipe: CurrencyPipe, txnCurrencyDefService: TxnCurrencyDefService, cache: CacheService) {
		let queryParams: ODataParamsModel = new ODataParamsModel();
		queryParams.select = 'code,alphacode';
		cache.get('TxnCurrencyDefAlphacodes', txnCurrencyDefService.getOData(queryParams)).subscribe((result: any) => {
			this.currencyList = result.body.data;
		});
	}

	transform(value: any, code: any): any {
		let alphacode;
		if (typeof this.currencyList !== 'undefined' && this.currencyList != null) {
			this.currencyList.forEach(element => {
				if (element.code === code) {
					alphacode = element.alphacode;
				}
			});
		}

		let result = '';
		if (typeof alphacode !== 'undefined') {
			result = this.currencyPipe.transform(value, alphacode);
		}

		return result;
	}
}
