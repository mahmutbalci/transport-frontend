import { Component, OnInit, ViewChild, EventEmitter, Output, Inject, HostListener } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSort, MatDialogRef, MatPaginator, MAT_DIALOG_DATA } from '@angular/material';
import { tap } from 'rxjs/operators';
import { FilteredDataSource } from '@core/_base/crud/models/filtered.datasource';
import * as _ from 'lodash';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import { Key } from '@core/_config/keys';
import { PtcnSearchRequestDto } from '@models/transport/card/ptcnSearchRequestDto.model';
import { PtcnSearchResponseDto } from '@models/transport/card/ptcnSearchResponseDto.model';
import { TxnTransactionService } from '@services/transport/txn/txnTransaction-service';

@Component({
	selector: 'ptcn-info',
	templateUrl: './ptcn-info.component.html'
})
export class PtcnInfoComponent implements OnInit {
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	requestForm: FormGroup = new FormGroup({});
	requestDto: PtcnSearchRequestDto = new PtcnSearchRequestDto();
	hasFormErrors: boolean = false;

	dataSource: FilteredDataSource;
	displayedColumns = ['choose', 'merchantCode', 'nswUniqueId', 'tradeName', 'merchantNameplate', 'merchantStat', 'mcc', 'chainGuid',
		'ownerName', 'ownerSurname', 'customerNo', 'identityNumber', 'branchGuid', 'terminalCount'];

	cardMaskPattern = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, ' ', /[0-9]/, /[0-9]/, '** **** ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];

	txnMccDefs: any[] = [];
	mrcStatDefs: any[] = [];
	cfgBranchDefs: any = [];

	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@Output() valueSelect = new EventEmitter<PtcnSearchResponseDto>();
	frmControlSearch: FormControl = new FormControl();

	maskNoDecimal = createNumberMask({
		prefix: '',
		suffix: '',
		includeThousandsSeparator: false,
	});

	constructor(private ptcnService: TxnTransactionService,
		public dialogRef: MatDialogRef<PtcnInfoComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,) { }

	ngOnInit() {
		Object.keys(this.requestDto).forEach(name => {
			this.requestForm.addControl(name, new FormControl(this.requestDto[name]));
		});

		this.requestDto.ptcn = this.data.partData;
		this.requestDto.cardMask = this.data.cardMask;
		this.requestForm.controls['ptcn'].setValue(this.requestDto.ptcn);
		this.requestForm.controls['cardMask'].setValue(this.requestDto.cardMask);
		this.dataSource = new FilteredDataSource(this.ptcnService);

		this.paginator.page
			.pipe(
				tap(() => {
					this.merchantSearch();
				})
			)
			.subscribe();
	}

	close() {
		this.dialogRef.close();
	}

	infoSearch() {
		this.paginator.pageIndex = 0;
		this.merchantSearch();
	}

	merchantSearch() {
		this.hasFormErrors = false;
		const controls = this.requestForm.controls;
		/** check form */
		if (this.requestForm.invalid) {
			Object.keys(this.requestDto).forEach(name =>
				controls[name].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			this.paginator.pageIndex,
			this.paginator.pageSize
		);

		this.dataSource.load(queryParams, 'findPtcn');
	};

	filterConfiguration(): any {
		return this.requestDto = <PtcnSearchRequestDto>this.requestForm.value;
	}

	valueSelected(_item: PtcnSearchResponseDto) {
		this.valueSelect.emit(_item);
		this.dialogRef.close();
	}

	clear() {
		this.requestForm.reset();
		this.dataSource.clear();
	}

	@HostListener('keydown', ['$event'])
	handleKeyboardEvent(event: KeyboardEvent): void {
		if (event.keyCode === Key.Enter) {
			this.infoSearch();
		}
	}
}
