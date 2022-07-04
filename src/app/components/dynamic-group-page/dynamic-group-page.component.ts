import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { MatSort } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LookupPipe } from 'app/pipes/lookup.pipe';
import { LangParserPipe } from 'app/pipes/lang-parser.pipe';
import { StringHelper } from '@core/util/stringHelper';
import { GridOptionsModel } from '@core/_base/layout/models/grid-options.model';

@Component({
	selector: 'm-dynamic-group-page',
	templateUrl: './dynamic-group-page.component.html',
	styleUrls: ['./dynamic-group-page.component.scss']
})

export class DynamicGroupPageComponent implements OnInit, OnChanges {
	lookupPipe: LookupPipe = new LookupPipe(new LangParserPipe());

	@Input('model') model: any;
	@Input('column') column: any;
	@Input('sortActive') sortActive: any;
	@Input('sortDirection') sortDirection: any;
	@Input('options') options: GridOptionsModel;

	@ViewChild('variableSort') variableSort: MatSort;

	displayedColumnsDetail = ['stmtDate', 'bucketAmnt'];
	groupColumns = [];
	filterColumns = [];
	groupInitialColumns = [];
	groupFilterForm: FormGroup = new FormGroup({});
	tableFilterForm: FormGroup = new FormGroup({});
	groupModel: any;
	sumFooterModel: any;
	showIcon: boolean = false;

	constructor(
		private translate: TranslateService,
		private langparser: LangParserPipe
	) { }

	ngOnInit() {
		merge(this.variableSort.sortChange).pipe(
			tap(() => {
				this.onChangeGroupValue();
			})
		).subscribe();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.model) {
			this.model = changes.model.currentValue;
			this.filterColumns = [];
			this.groupInitialColumns = [];

			this.groupModel = Object.assign([], this.model.data);
			if (this.column.length > 0) {
				this.column.forEach(element => {
					if (element.filterable && this.tableFilterForm.controls[element.key + '_filter']) {
						this.tableFilterForm.controls[element.key + '_filter'].setValue('');
					}
				});
			}
		}
		if (changes.column) {
			this.column = changes.column.currentValue;
			this.column.forEach(element => {
				this.groupFilterForm.addControl(element.key, new FormControl(element.isGroupBy));
				this.groupFilterForm.controls[element.key].setValue(element.isGroupBy);
				if (element.filterable) {
					this.tableFilterForm.addControl(element.key + '_filter', new FormControl(''));
				}
			});
		}
		if (changes.sortActive) {
			this.sortActive = changes.sortActive.currentValue;
			this.variableSort.active = this.sortActive;
		}
		if (changes.sortDirection) {
			this.sortDirection = changes.sortDirection.currentValue;
			this.variableSort.direction = this.sortDirection;
		}
		if (changes.options) {
			this.options = changes.options.currentValue;
		}

		this.onChangeGroupValue();
	}

	onKeyupFilter(event: any) {
		this.filterColumns = [];
		if (this.column) {
			this.column.forEach(element => {
				if (element.filterable) {
					this.filterColumns.push({ key: element.key, filter: this.tableFilterForm.get(element.key + '_filter').value });
				}
			});
		}
		this.groupDataSourceFill();
	}

	isGroup(index, item): boolean {
		return item.isGroupBy;
	}

	getColumnsKeys() {
		return this.column.filter(f => !f.isHidden).map(m => m.key);
	}

	getColumnsLastKeys() {
		const columnsKey = this.getColumnsKeys();
		if (columnsKey.length > 0) {
			return columnsKey[columnsKey.length - 1];
		} else {
			return '';
		}
	}

	addFooterSum(footerArray) {
		if (this.column && this.column.find(x => x.isSumBy)) {
			let sumValueObj: any = [];
			if (footerArray.length > 0) {
				this.column.forEach(cl => {
					if (cl.isSumBy) {
						if (!sumValueObj[cl.key]) {
							sumValueObj[cl.key] = 0;
						}
						sumValueObj[cl.key] += _.sumBy(footerArray, cl.key);
					}
				});
			} else {
				this.column.forEach(cl => {
					if (cl.isSumBy) {
						sumValueObj[cl.key] = 0;
					}
				});
			}

			sumValueObj.isSumBy = true;
			this.groupModel.push(sumValueObj);
		}
	}

	drop(event: CdkDragDrop<string[]>) {
		moveItemInArray(this.column, event.previousIndex, event.currentIndex);
		this.groupDataSourceFill();
	}

	onChangeGroupValue() {
		this.groupColumns = [];
		this.groupInitialColumns = [];
		if (this.column) {
			this.column.forEach(element => {
				if (this.groupFilterForm.get(element.key).value) {
					this.groupColumns.push(element.key);
				}
			});
		}

		if (this.groupModel) {
			this.groupModel.filter(f => f.isGroupBy).map(m => m.key).forEach(element => {
				this.groupInitialColumns.push(element);
			});
		}

		if (this.variableSort.direction && this.variableSort.active) {
			if (this.variableSort.direction === 'desc') {
				this.model.data = _.orderBy(this.model.data, this.variableSort.active, 'desc');
			} else {
				this.model.data = _.orderBy(this.model.data, this.variableSort.active, 'asc');
			}
		}

		this.groupModel = Object.assign([], this.model.data);

		this.groupDataSourceFill();
	}

	collapseAllGroups() {
		this.groupInitialColumns = [];
		this.groupModel.filter(f => f.isGroupBy).map(m => m.key).forEach(element => {
			this.groupInitialColumns.push(element);
		});
		this.groupDataSourceFill();
	}

	expandAllGroups() {
		this.groupInitialColumns = [];
		this.groupDataSourceFill();
	}

	groupClick(groupKey) {
		const findIndex = this.groupInitialColumns.findIndex(f => f === groupKey);
		if (findIndex >= 0) {
			this.groupInitialColumns.splice(findIndex, 1);
		} else {
			this.groupInitialColumns.push(groupKey);
		}
		this.groupDataSourceFill();
	}

	groupDataSourceFill() {
		if (this.groupColumns && this.groupColumns.length > 0) {
			let groupModelTemp = [];
			this.groupModel = [];
			const searchArray = this.searchInArray(this.model.data, this.filterColumns);
			if (searchArray.length > 0) {
				for (let index = 0; index < searchArray.length; index++) {
					let groupKey = '';
					let groupText = '';
					this.groupColumns.forEach(grp => {
						groupKey += searchArray[index][grp] + '~';

						const findColumn = this.column.find(f => f.key === grp);
						let translateText = searchArray[index][grp];
						if (findColumn) {
							if (findColumn.lookup) {
								translateText = this.lookupPipe.transform(translateText, findColumn.lookup);
							}
							if (findColumn.pipe === 'langparser') {
								translateText = this.langparser.transform(translateText);
							}
						}
						groupText += translateText + '~';
					});

					groupKey = groupKey.substr(0, groupKey.length - 1);
					groupText = groupText.substr(0, groupText.length - 1);

					const findIndex = groupModelTemp.findIndex(x => x.key === groupKey);
					if (findIndex < 0) {
						groupModelTemp.push({ key: groupKey, text: groupText, value: [searchArray[index]] });
					} else {
						groupModelTemp[findIndex].value.push(searchArray[index]);
					}

					if (index === searchArray.length - 1) {
						for (let grpInd = 0; grpInd < groupModelTemp.length; grpInd++) {
							const groupDown = !this.groupInitialColumns.find(f => f === groupModelTemp[grpInd].key);

							this.groupModel.push({
								key: groupModelTemp[grpInd].key,
								initial: groupModelTemp[grpInd].text + ' (' + groupModelTemp[grpInd].value.length + ' ' + this.translate.instant('General.Quantity') + ')',
								isGroupBy: true,
								down: groupDown
							});

							if (groupDown) {
								groupModelTemp[grpInd].value.forEach(item => {
									this.groupModel.push(item);
								});

							}
							let isSumValue = false;
							let sumValueObj: any = [];

							for (let sumInd = 0; sumInd < this.column.length; sumInd++) {
								if (this.column[sumInd].isSumBy) {
									isSumValue = true;
									if (!sumValueObj[this.column[sumInd].key]) {
										sumValueObj[this.column[sumInd].key] = 0;
									}
									sumValueObj[this.column[sumInd].key] = _.sumBy(groupModelTemp[grpInd].value, this.column[sumInd].key);
								}

								if (isSumValue && sumInd === this.column.length - 1) {
									sumValueObj.isSum = true;
									sumValueObj.isSumBy = true;
									this.groupModel.push(sumValueObj);
								}
							}

							if (grpInd === groupModelTemp.length - 1) {
								this.addFooterSum(searchArray);
							}
						}
					}
				}
			} else {
				this.addFooterSum(searchArray);
			}
		} else {
			this.groupModel = this.searchInArray(Object.assign([], this.model.data), this.filterColumns);
			this.addFooterSum(this.model.data);
		}
	}

	searchInArray(_incomingArray: any[], _filtrationFields: any[] = []): any[] {
		let result: any[] = Object.assign([], _incomingArray);
		let indexes: number[] = [];

		_filtrationFields.forEach((item) => {
			if (item.filter !== '') {
				const searchText = StringHelper.normalizeString(item.filter.toString().trim());
				try {
					indexes = [];
					result.forEach((element, index) => {
						const findColumn = this.column.find(f => f.key === item.key);
						let translateText = element[item.key];
						if (findColumn) {
							if (findColumn.lookup) {
								translateText = this.lookupPipe.transform(translateText, findColumn.lookup);
							}
							if (findColumn.pipe === 'langparser') {
								translateText = this.langparser.transform(translateText);
							}
						}
						const _val = StringHelper.normalizeString(translateText.toString().trim());
						if (_val.indexOf(searchText) > -1 && indexes.indexOf(index) === -1) {
							indexes.push(index);
						}
					});

					let resultIndexArr: any[] = [];
					indexes.forEach(re => {
						resultIndexArr.push(result[re]);
					});
					result = Object.assign([], resultIndexArr);
				} catch (ex) {
				}
			}
		});

		return result;
	}

	focusElement(key) {
		document.getElementById(key).focus();
	}

	getPercent(value) {
		if (value) {
			return parseFloat((value * 100).toString()).toLocaleString('en-US', { minimumFractionDigits: 2 });
		}
	}
}
