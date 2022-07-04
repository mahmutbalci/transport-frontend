import {
	Directive,
	OnDestroy,
} from '@angular/core';
import { ControlContainer, FormGroupDirective } from '@angular/forms';
import { AuthService } from '@core/auth';
@Directive({
	selector: '[checkauth]',
	inputs: ['value: checkauth'],
})
export class CheckAuthDirective implements OnDestroy {

	public value: any;

	constructor(
		private authentication: AuthService,
		private _fg: ControlContainer,
	) {

	}
	ngOnInit() { 
		let authenticationLevel = this.authentication.getCurrentMenuAuthenticationLevel();
		if (authenticationLevel != 2 || (typeof this.value !== 'undefined' && this.value.toString() == 'true')) {
			(<FormGroupDirective>this._fg).control.disable();
		}
	}

	ngOnDestroy(): void { }
}
