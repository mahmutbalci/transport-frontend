import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: 'a,span,button'
})
export class ClickEventSharedDirective {
	constructor() { }

	@HostListener('click', ['$event'])
	clickEvent(event) {
		if (event.currentTarget && event.currentTarget.id)
			sessionStorage.setItem('userEvent', event.currentTarget.id);
		else if (event.currentTarget && event.currentTarget.innerText)
			sessionStorage.setItem('userEvent', event.currentTarget.innerText);
		else
			sessionStorage.setItem('userEvent', '');
	}
}
