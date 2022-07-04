import {
	Directive,
	OnDestroy,
	ElementRef,
	Input
} from '@angular/core';
import { AcquiringApi } from '@services/acquiring.api';
import { ClearingApi } from '@services/clearing.api';
import { CleveractApi } from '@services/cleveract.api';
import { CommonApi } from '@services/common.api';
import { FrameworkApi } from '@services/framework.api';
import { IssuingApi } from '@services/issuing.api';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';

@Directive({
	selector: '[lookup]',
	inputs: ['lookupApi: lookup'],
})
export class LookupDirective implements OnDestroy {

	lookupApi: string;

	@Input() query: string;
	@Input() code: any;
	@Input() withCode: boolean;
	@Input() parseLang: boolean = false;

	constructor(private el: ElementRef,
		private acquiringApi : AcquiringApi,
		private clearingApi : ClearingApi,
		private cleveractApi : CleveractApi,
		private commonApi :  CommonApi,
		private frameworkApi : FrameworkApi,
		private issuingApi : IssuingApi,
		private langparser: LangParserPipe
	) {

	}
	ngOnInit() {

		this.getLookupApi(this.lookupApi).getLookup(this.query).then(lookupList => {
			var result: any = "";
			if (typeof lookupList !== 'undefined' && lookupList != null)
				lookupList.forEach(element => {
					if (element.code == this.code) {
						var desc = element.description;
						if (this.parseLang) {
							desc = this.langparser.transform(desc);
						}
						if (this.withCode)
							result = element.code + "-" + desc;
						else
							result = desc;
					}
				});
			this.el.nativeElement.innerHTML = result;
		});
	}

	getLookupApi(lookupApi) {
		var api;
		switch (lookupApi) {
			case "AcquiringApi": { api = this.acquiringApi; break; };
			case "ClearingApi": { api = this.clearingApi; break; };
			case "CleveractApi": { api = this.cleveractApi; break; };
			case "CommonApi": { api = this.commonApi; break; };
			case "FrameworkApi": { api = this.frameworkApi; break; };
			case "IssuingApi": { api = this.issuingApi; break; };
			case "AcquiringApi": { api = this.acquiringApi; break; };
			default: break;
		} 
		return api;
	}

	ngOnDestroy(): void { }
}
