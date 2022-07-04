import { FormControl, FormGroup } from '@angular/forms';

export class BaseModel {
	// Edit
	_isEditMode: boolean = false;
	_isNew: boolean = false;
	_isUpdated: boolean = false;
	_isDeleted: boolean = false;
	_prevState: any = null;
	// Filter
	_defaultFieldName: string = '';
	// Log
	_userId: any = null; // Admin
	_createdDate: string;
	_updatedDate: string;

	getValuesFromResult(result: any) {
		Object.keys(this).forEach(name => {
			if (result[name] || typeof result[name] === 'boolean') {
				this[name] = result[name];
			}
		});
	}

	addFormControls(form: FormGroup) {
		Object.keys(this).forEach(name => {
			form.addControl(name, new FormControl(this[name]));
		});
	}

	setFormValues(form: FormGroup) {
		const controls = form.controls;
		Object.keys(this).forEach(name => {
			if (controls[name]) {
				controls[name].setValue(this[name]);
			}
		});
	}

	getFormValues(form: FormGroup): boolean {
		const controls = form.controls;

		if (form.invalid) {
			Object.keys(this).forEach(name =>
				controls[name].markAsTouched()
			);

			return false;
		}

		Object.keys(this).forEach(name => {
			if (controls[name]) {
				this[name] = form.get(name).value;
			}
		});

		return true;
	}
}