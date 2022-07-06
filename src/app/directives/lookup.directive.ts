import {
	Directive,
	OnDestroy,
	ElementRef,
	Input
} from '@angular/core';
import { CommonApi } from '@services/common.api';
import { FrameworkApi } from '@services/framework.api';
import { TransportApi } from '@services/transport.api';
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
		private commonApi: CommonApi,
		private frameworkApi: FrameworkApi,
		private transportApi: TransportApi,
		private langparser: LangParserPipe
	) {

	}
	ngOnInit() {

		this.getLookupApi(this.lookupApi).getLookup(this.query).then(lookupList => {
			var result: any = '';
			if (typeof lookupList !== 'undefined' && lookupList != null)
				lookupList.forEach(element => {
					if (element.code == this.code) {
						var desc = element.description;
						if (this.parseLang) {
							desc = this.langparser.transform(desc);
						}

						if (this.withCode) {
							result = element.code + '-' + desc;
						} else {
							result = desc;
						}
					}
				});
			this.el.nativeElement.innerHTML = result;
		});
	}

	getLookupApi(lookupApi) {
		var api;
		switch (lookupApi) {
			case 'CommonApi': { api = this.commonApi; break; };
			case 'FrameworkApi': { api = this.frameworkApi; break; };
			case 'TransportApi': { api = this.transportApi; break; };
			default: break;
		}
		return api;
	}

	ngOnDestroy(): void { }
}
