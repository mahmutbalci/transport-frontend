// Angular
import { Injectable } from '@angular/core';
// Tranlsation
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

export interface Locale {
	lang: string;
	// tslint:disable-next-line:ban-types
	data: Object;
}

@Injectable({
	providedIn: 'root'
})
export class TranslationService {
	// Private properties
	private langIds: any = [];

	/**
	 * Service Constructor
	 *
	 * @param translate: TranslateService
	 */
	constructor(private translate: TranslateService) {
		// add new langIds to the list
		this.translate.addLangs(['tr']);

		// this language will be used as a fallback when a translation isn't found in the current language
		this.translate.setDefaultLang('tr');
	}

	/**
	 * Load Translation
	 *
	 * @param args: Locale[]
	 */
	loadTranslations(...args: Locale[]): void {
		const locales = [...args];

		locales.forEach(locale => {
			// use setTranslation() with the third argument set to true
			// to append translations instead of replacing them
			this.translate.setTranslation(locale.lang, locale.data, true);

			this.langIds.push(locale.lang);
		});

		// add new languages to the list
		this.translate.addLangs(this.langIds);
	}

	/**
	 * Setup language
	 *
	 * @param lang: any
	 */
	setLanguage(lang) {
		if (lang && this.checkLanguageAvailable(lang)) {
			this.translate.use(lang);
			localStorage.setItem('language', lang);
		}
	}

	/**
	 * Returns selected language
	 */
	getSelectedLanguage(): any {
		return of(localStorage.getItem('language') || 'tr');
	}

	checkLanguageAvailable(lang: string): boolean {
		return this.translate.getLangs().includes(lang);
	}
}
