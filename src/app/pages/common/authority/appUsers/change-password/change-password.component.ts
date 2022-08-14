import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { LayoutUtilsService, MessageType } from '@core/_base/crud/utils/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { AppUsersService } from '@common/authority/appUsers.service';

@Component({
	selector: 'kt-change-password',
	templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
	isProcessing: boolean = false;

	succesMessage = this.translate.instant('General.Success');
	userCode = sessionStorage.getItem('userCode');
	requestForm: FormGroup = new FormGroup({});

	constructor(private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private entityService: AppUsersService,
	) { }

	ngOnInit() {
		this.requestForm.addControl('oldPassword', new FormControl([]));
		this.requestForm.addControl('newPassword', new FormControl([]));
	}

	submit() {
		let controls = this.requestForm.controls;
		if (this.requestForm.invalid) {
			controls['oldPassword'].markAsTouched();
			controls['newPassword'].markAsTouched();

			this.isProcessing = false;
			return;
		}

		let requestDto = {
			clientId: this.userCode,
			oldPassword: controls['oldPassword'].value,
			newPassword: controls['newPassword'].value,
		};

		this.entityService.changePassword(requestDto).subscribe((res: any) => {
			if (res.success) {
				this.layoutUtilsService.showNotification(this.succesMessage, MessageType.Update, 10000, true, false)
					.afterClosed().subscribe(() => {
						this.clearScreen();
					});
			} else {
				this.isProcessing = false;
				this.layoutUtilsService.showError(res);
			}
		}, (error) => {
			this.isProcessing = false;
			this.layoutUtilsService.showError(error);
		}, () => {
			this.isProcessing = false;
		});
	}

	getComponentTitle() {
		return this.userCode;
	}

	clearScreen() {
		this.requestForm.reset();
	}
}
