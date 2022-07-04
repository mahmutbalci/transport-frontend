import { Component, OnDestroy, Input, ElementRef, forwardRef } from "@angular/core";
import { MatFormFieldControl, MatDialog, MatDialogRef } from "@angular/material";
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Subject } from "rxjs";
import { FocusMonitor } from "@angular/cdk/a11y";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { MmultiLangInputPopupComponent } from "@components/mmulti-lang-input-popup/mmulti-lang-input-popup.component";
import { MErrorDialogComponent } from "@core/components/m-error-dialog/m-error-dialog.component";

@Component({
	selector: 'm-multi-lang-input',
	templateUrl: 'mmulti-lang-input.component.html',
	providers: [
		{
			provide: MatFormFieldControl,
			useExisting: MmultiLangInputComponent
		}, {
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => MmultiLangInputComponent),
			multi: true
		}
	],
	host: {
		'[class.example-floating]': 'shouldLabelFloat',
		'[id]': 'id',
		'[attr.aria-describedby]': 'describedBy',
	}
})
export class MmultiLangInputComponent implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy {

	dialogRef: MatDialogRef<MmultiLangInputPopupComponent>;

	static nextId = 0;
	private _disabled = false;
	_value: any;

	@Input() hidePopup = false;
	@Input() maxlength = 4000;

	stateChanges = new Subject<void>();
	focused = false;
	ngControl = null;
	errorState = false;
	controlType = 'm-multi-lang-input';
	id = `m-multi-lang-input-${MmultiLangInputComponent.nextId++}`;
	describedBy = '';

	constructor(private fm: FocusMonitor, private elRef: ElementRef<HTMLElement>, private dialog: MatDialog) {

		fm.monitor(elRef, true).subscribe(origin => {
			this.focused = !!origin;
			this.stateChanges.next();
		});
	}

	get empty() {
		return !this._value;
	}

	get shouldLabelFloat() { return this.focused || !this.empty; }

	@Input()
	get placeholder(): string { return this._placeholder; }
	set placeholder(value: string) {
		this._placeholder = value;
		this.stateChanges.next();
	}
	_placeholder: string;

	@Input()
	get required(): boolean { return this._required; }
	set required(value: boolean) {
		this._required = coerceBooleanProperty(value);
		this.stateChanges.next();
	}
	_required = false;

	@Input()
	get disabled(): boolean { return this._disabled; }
	set disabled(value: boolean) {
		this._disabled = coerceBooleanProperty(value);
		this.stateChanges.next();
	}

	/**
	 * Disables the input. Implemented as a part of `ControlValueAccessor`.
	 * @param isDisabled Whether the component should be disabled.
	 */
	setDisabledState(isDisabled: boolean) {
		this._disabled = isDisabled;
	}

	@Input()
	get value(): any {
		return this._value;
	}
	set value(value) {
		this._value = value;
		this.onChange(value);
		this.stateChanges.next();
	}


	ngOnDestroy() {
		this.stateChanges.complete();
		this.fm.stopMonitoring(this.elRef);
	}

	setDescribedByIds(ids: string[]) {
		this.describedBy = ids.join(' ');
	}

	onContainerClick(event: MouseEvent) {
		if ((event.target as Element).tagName.toLowerCase() != 'input') {
			this.elRef.nativeElement.querySelector('input')!.focus();
		}
	}

	onChange = (val: any) => { };

	onTouched = () => { };

	writeValue(val: any): void {
		this._value = val;
	}
	registerOnChange(fn: (v: any) => void): void {
		this.onChange = fn;
	}
	registerOnTouched(fn: () => void): void {
		this.onTouched = fn;
	}

	openMultiLangPopup() {
		if (!this.hidePopup && !this._disabled) {
			this.dialogRef = this.dialog.open(MmultiLangInputPopupComponent, {
				width: '40%',
				data: { value: this.value, placeHolder: this._placeholder, isRequired: this._required, maxlength: this.maxlength },
			});
			const sub = this.dialogRef.componentInstance.valueChange.subscribe(result => {
				this.value = result;
			});

			this.dialogRef.afterClosed().subscribe(() => {
				sub.unsubscribe();
			});
		}
	}
}
