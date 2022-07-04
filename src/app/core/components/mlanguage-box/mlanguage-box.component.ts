import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LanguageConfig, LanguageFlag } from "@core/_config/default/langs";
import { TranslationService } from '@core/_base/metronic';
// import { TranslationService } from '@core/services/translation.service';
import { StringHelper } from '@core/util/stringHelper';

@Component({
	selector: 'm-mlanguage-box',
	templateUrl: './mlanguage-box.component.html'
})
export class MLanguageBoxComponent {

	language: LanguageFlag = null;
	languages: LanguageFlag[] = [];
	@Output() onLanguageChange = new EventEmitter<object>();

	constructor(private translationService: TranslationService, private router: Router,
		private translate: TranslateService) {

		this.languages = LanguageConfig.languages;
	}

	ngOnInit() {
		this.setSelectedLanguage();
		this.router.events
			.pipe(filter(event => event instanceof NavigationStart))
			.subscribe(event => {
				this.setSelectedLanguage();
			});
	}
	getCultureLang(item) {
		if (item != null)
			return this.translate.instant("Translator." + StringHelper.convertToCamelCase(item.cultureLang));
	}
	changeLanguage() {
		if (this.language != null)
			this.translationService.setLanguage(this.language.lang);

		this.onLanguageChange.emit(this.language);
	}
	setLanguage(lang: string) {
		this.languages.forEach((language: LanguageFlag) => {
			if (language.lang === lang) {
				this.language = language;
			}
		});
		this.translationService.setLanguage(lang);

	}

	setSelectedLanguage(): any {
		this.translationService.getSelectedLanguage().subscribe(lang => {
			if (lang) {
				this.setLanguage(lang);
			}
		});
	}
}
