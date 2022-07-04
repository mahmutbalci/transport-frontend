import {
	Directive,
	OnDestroy,
	ElementRef,
	Input
} from '@angular/core';

@Directive({
	selector: '[ctrlSelect]',
	inputs: ['value: ctrlSelect'],
	host: { '(window:keydown)': 'change($event)' },
})
export class CtrlSelectDirective implements OnDestroy {
	public value: any;

	@Input() refId = '';
	@Input() keyField = 'code';
	@Input() valueField = 'description';

	showCode: boolean = false;

	constructor(private el: ElementRef) {
	}

	ngOnDestroy(): void { }

	change($event) {
		if ($event.keyCode === 17) {
			var target = $event.target || $event.srcElement || $event.currentTarget;
			var idAttr = target.attributes['attr.refId'];
			if (idAttr && idAttr.nodeValue == this.refId) {
				this.showCode = !this.showCode;
			}
		}

		if (this.showCode) {
			this.el.nativeElement.innerHTML = this.value[this.keyField] + ' -' + this.value[this.valueField];
		} else {
			this.el.nativeElement.innerHTML = this.value[this.valueField];
		}
	}
}
