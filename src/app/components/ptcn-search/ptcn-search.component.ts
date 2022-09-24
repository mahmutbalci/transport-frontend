import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from '@core/_base/crud/models/query-params.model';
import * as _ from 'lodash';
import { TxnTransactionService } from '@services/transport/txn/txnTransaction-service';
import { PtcnInfoComponent } from '@components/ptcn-info/ptcn-info.component';
import { PtcnSearchRequestDto } from '@models/transport/card/ptcnSearchRequestDto.model';
import { PtcnSearchResponseDto } from '@models/transport/card/ptcnSearchResponseDto.model';

@Component({
	selector: 'ptcn-search',
	templateUrl: './ptcn-search.component.html'
})
export class PtcnSearchComponent implements OnInit {
	ptcnSearchForm: FormGroup = new FormGroup({});
	merchantNoForm: FormGroup;
	dialogRef: MatDialogRef<PtcnInfoComponent>;
	resquestDto: PtcnSearchRequestDto = new PtcnSearchRequestDto();
	responseDto: PtcnSearchResponseDto = new PtcnSearchResponseDto();
	loadingSubject = new BehaviorSubject<boolean>(false);

	merchantCodeMask = [/[1-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/,];
	isDialogOpen: boolean = false;

	@Input() data: string = null;
	@Input() formField: any;
	@Input() invisible: boolean;
	@Input() invisibleCardMask: boolean;
	@Output() merchantSelect: EventEmitter<any> = new EventEmitter<any>();

	constructor(
		private dialog: MatDialog,
		private ptcnService: TxnTransactionService,
	) { }

	ngOnInit() {
		Object.keys(this.responseDto).forEach(name => {
			this.ptcnSearchForm.addControl(name, new FormControl(this.responseDto[name]));
		});

		if (this.formField) {
			this.responseDto.ptcn = this.formField;
			this.loadingSubject.next(false);
			const controls = this.ptcnSearchForm.controls;

			if (controls['ptcn']) {
				controls['ptcn'].setValue(this.responseDto.ptcn);
			}
		}

		if (this.invisible == undefined) {
			this.invisible = true;
		}

		if (this.invisibleCardMask == undefined) {
			this.invisibleCardMask = true;
		}
	}

	openDialog() {
		if (this.ptcnSearchForm.controls['merchantCode']) {
			this.data = this.ptcnSearchForm.controls['merchantCode'].value;
			this.clearForm();
			this.isDialogOpen = true;

			this.getControlMerchant().then(result => {
				if (!result) {
					this.dialogRef = this.dialog.open(PtcnInfoComponent, {
						data: {
							partData: this.data,
						}
					});

					const sub = this.dialogRef.componentInstance.valueSelect.subscribe(result => {
						this.responseDto = result;
						this.merchantSelect.emit(this.responseDto);
						this.initForm();
					});

					this.dialogRef.afterClosed().subscribe(() => {
						this.isDialogOpen = false;
						sub.unsubscribe();
					});
				} else {
					this.isDialogOpen = false;
				}
			});
		}
	}

	initForm(): any {
		this.loadingSubject.next(false);
		const controls = this.ptcnSearchForm.controls;

		Object.keys(this.responseDto).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this.responseDto[name]);
			}
		});
	}

	clearForm(): any {
		this.ptcnSearchForm.reset();
		const responseDto = new PtcnSearchResponseDto();
		responseDto.clear();
		this.responseDto = responseDto;
		this.initForm();
	}

	getControlMerchant(): any {
		return new Promise(resolve => {
			if (!this.data || this.data.length === 0) {
				resolve(false);
				return;
			}

			this.resquestDto.ptcn = this.data;
			const queryParams = new QueryParamsModel(this.resquestDto, '', '', 0, 10);
			this.ptcnService.findFiltered(queryParams, 'findPtcn').subscribe(result => {
				if (result.items != null && result.items.length > 0) {
					this.responseDto = result.items[0];
					this.merchantSelect.emit(this.responseDto);

					this.initForm();
					resolve(true);
				} else {
					resolve(false);
				}
			}, () => {
				resolve(false);
			});
		});
	}
} 
