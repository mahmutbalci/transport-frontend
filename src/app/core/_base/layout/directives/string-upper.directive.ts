import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
	selector: '[stringUpper]'
})
export class StringUpperDirective {

	constructor(private ref: ElementRef, private control: NgControl) {
	}

	@HostListener('input', ['$event']) onEvent() {
		let srtVal = this.ref.nativeElement.value.replace('i', 'İ').toUpperCase();
		this.control.control.setValue(srtVal);
	}
}
