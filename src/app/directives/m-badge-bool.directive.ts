import {
	Directive,
	OnDestroy,
	ElementRef,
	Renderer2,
	ChangeDetectorRef
} from '@angular/core';

@Directive({
	selector: '[mbadgeBool]',
	inputs: ['value: mbadgeBool'],
})
export class MBadgeBoolDirective implements OnDestroy {
	public value: any;

	constructor(
		private renderer: Renderer2,
		private el: ElementRef,
		private changeDetectorRef: ChangeDetectorRef,
	) { }

	ngOnChanges() {
		this.renderer.addClass(this.el.nativeElement, 'kt-badge');
		if (this.value.toString() === 'true') {
			this.renderer.removeClass(this.el.nativeElement, 'kt-badge--metal');
			this.renderer.addClass(this.el.nativeElement, 'kt-badge--info');
			this.renderer.addClass(this.el.nativeElement, 'kt-badge--inline');
			this.renderer.addClass(this.el.nativeElement, 'kt-badge--pill');
			// this.changeDetectorRef.checkNoChanges();
		} else if (this.value.toString() === 'false') {
			this.renderer.removeClass(this.el.nativeElement, 'kt-badge--info');
			this.renderer.addClass(this.el.nativeElement, 'kt-badge--metal');
			this.renderer.addClass(this.el.nativeElement, 'kt-badge--inline');
			this.renderer.addClass(this.el.nativeElement, 'kt-badge--pill');
			// this.changeDetectorRef.checkNoChanges();
		} else {
			this.renderer.removeClass(this.el.nativeElement, 'kt-badge');
		}
	}

	ngOnInit() { }

	ngOnDestroy(): void { }
}
