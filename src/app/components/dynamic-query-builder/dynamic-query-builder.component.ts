import { Component, OnInit, Input } from '@angular/core';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { FrameworkApi } from '@services/framework.api';
import { TranslateService } from '@ngx-translate/core';
import { TransportApi } from '@services/transport.api';
import * as _ from 'lodash';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

@Component({
	selector: 'm-dynamic-query-builder',
	templateUrl: './dynamic-query-builder.component.html',
	styleUrls: ['./dynamic-query-builder.component.scss']
})
export class DynamicQueryBuilderComponent implements OnInit {
	isActiveMrcCode: boolean = false;

	_configName: string;
	get configName(): string {
		return this._configName;
	}

	@Input('configName') set allowDay(value: string) {
		this._configName = value;
		if (value != null) {
			this.configLoaded = false;
			this.generateConfig();
		}
	}

	@Input("query") query: any;

	config: QueryBuilderConfig = { fields: {} };
	public configLoaded: boolean = false;

	isDisabled = false;
	@Input()
	get disabled(): boolean { return this.isDisabled; }
	set disabled(value: boolean) {
		this.isDisabled = value
	}

	maskNumber = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
		allowDecimal: true,
	});

	merchantCodeMask = [/[1-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];

	constructor(
		private frameworkApi: FrameworkApi,
		private translate: TranslateService,
		private transportApi: TransportApi) { }

	ngOnInit() {
		this.generateConfig();
	}

	generateConfig() {
		let params = { configName: this.configName };
		let endpoint = "exp/CfgExpressionConfigDef/GetQueryConfig";

		this.frameworkApi.get(endpoint, params).subscribe(res => {
			let lookups: string[] = [];
			let filteredLookups: string[] = [];
			Object.keys(res.result).forEach(item => {
				if (item === 'merchantCode' || item === 'merchantChainCode') {
					this.isActiveMrcCode = true;
				}

				res.result[item].name = this.translate.instant(res.result[item].name);

				if (res.result[item].lookupEntity != null) {
					if (_.startsWith(_.toLower(res.result[item].lookupEntity), 'lookup/filter')) {
						filteredLookups.push(res.result[item].lookupEntity);
					} else {
						lookups.push(res.result[item].lookupEntity);
					}

				}
			});

			if (lookups.length > 0 || filteredLookups.length > 0) {
				let lookupList: any[] = [];
				this.transportApi.getLookups(lookups).then(lookUp => {
					lookupList = lookUp;

					Object.keys(res.result).forEach(resultItem => {
						if (res.result[resultItem].lookupEntity != null) {
							if (!_.startsWith(_.toLower(res.result[resultItem].lookupEntity), 'lookup/filter')) {
								let codeDescLookup = _.cloneDeep(lookupList.find(x => x.name === res.result[resultItem].lookupEntity).data);
								let nameValueLookup: any[] = [];
								codeDescLookup.forEach(item => {
									nameValueLookup.push({ name: item.description, value: item.code });
								});
								res.result[resultItem].options = nameValueLookup;
								this.config = { fields: res.result };
							}
						}
					});

					if (filteredLookups.length > 0) {
						Object.keys(res.result).forEach(resultItem => {
							if (res.result[resultItem].lookupEntity != null) {
								if (_.startsWith(_.toLower(res.result[resultItem].lookupEntity), 'lookup/filter')) {
									this.transportApi.get<any>(res.result[resultItem].lookupEntity).subscribe(filteredLookupRes => {
										if (filteredLookupRes.result) {
											let codeDescLookup = _.cloneDeep(filteredLookupRes.result);
											let filteredNameValueLookup: any[] = [];
											codeDescLookup.forEach(item => {
												filteredNameValueLookup.push({ name: item.description, value: item.code });
											});
											res.result[resultItem].options = filteredNameValueLookup;
											this.config = { fields: res.result };

											filteredLookups.pop();
											if (filteredLookups.length == 0) {
												this.config = { fields: res.result };
												this.configLoaded = true;
											}
										}
									});
								}
							}
						});
					}

					if (filteredLookups.length === 0) {
						this.config = { fields: res.result };
						this.configLoaded = true;
					}
				});
			}
		});
	}
}
