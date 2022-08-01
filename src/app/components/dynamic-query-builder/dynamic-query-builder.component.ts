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
			Object.keys(res.data).forEach(item => {
				if (item === 'merchantCode' || item === 'merchantChainCode') {
					this.isActiveMrcCode = true;
				}

				res.data[item].name = this.translate.instant(res.data[item].name);

				if (res.data[item].lookupEntity != null) {
					if (_.startsWith(_.toLower(res.data[item].lookupEntity), 'Cacheable/filter')) {
						filteredLookups.push(res.data[item].lookupEntity);
					} else {
						lookups.push(res.data[item].lookupEntity);
					}

				}
			});

			if (lookups.length > 0 || filteredLookups.length > 0) {
				let lookupList: any[] = [];
				this.transportApi.getLookups(lookups).then(lookUp => {
					lookupList = lookUp;

					Object.keys(res.data).forEach(resultItem => {
						if (res.data[resultItem].lookupEntity != null) {
							if (!_.startsWith(_.toLower(res.data[resultItem].lookupEntity), 'Cacheable/filter')) {
								let codeDescLookup = _.cloneDeep(lookupList.find(x => x.name === res.data[resultItem].lookupEntity).data);
								let nameValueLookup: any[] = [];
								codeDescLookup.forEach(item => {
									nameValueLookup.push({ name: item.description, value: item.code });
								});
								res.data[resultItem].options = nameValueLookup;
								this.config = { fields: res.data };
							}
						}
					});

					if (filteredLookups.length > 0) {
						Object.keys(res.data).forEach(resultItem => {
							if (res.data[resultItem].lookupEntity != null) {
								if (_.startsWith(_.toLower(res.data[resultItem].lookupEntity), 'Cacheable/filter')) {
									this.transportApi.get<any>(res.data[resultItem].lookupEntity).subscribe(filteredLookupRes => {
										if (filteredLookupRes.data) {
											let codeDescLookup = _.cloneDeep(filteredLookupRes.data);
											let filteredNameValueLookup: any[] = [];
											codeDescLookup.forEach(item => {
												filteredNameValueLookup.push({ name: item.description, value: item.code });
											});
											res.data[resultItem].options = filteredNameValueLookup;
											this.config = { fields: res.data };

											filteredLookups.pop();
											if (filteredLookups.length == 0) {
												this.config = { fields: res.data };
												this.configLoaded = true;
											}
										}
									});
								}
							}
						});
					}

					if (filteredLookups.length === 0) {
						this.config = { fields: res.data };
						this.configLoaded = true;
					}
				});
			}
		});
	}
}
