import { filter } from 'rxjs/operators';
import { Component, ElementRef, HostBinding, OnInit, Input } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StringHelper } from '@core/util/stringHelper';
import { TranslationService } from '@core/_base/metronic';
import { LanguageFlag, LanguageConfig } from '@core/_config/default/langs';

@Component({
	selector: 'kt-language-selector',
	templateUrl: './language-selector.component.html',
})
export class LanguageSelectorComponent implements OnInit {
	// tslint:disable-next-line:max-line-length
	@HostBinding('class') classes = '';
	@Input() iconType: '' | 'brand';

	@HostBinding('attr.dropdown-toggle') mDropdownToggle = 'click';
	language: LanguageFlag;
	languages: LanguageFlag[] = [];

	constructor(
		private translationService: TranslationService,
		private router: Router,
		private el: ElementRef,
		private translate: TranslateService
	) {
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

	setLanguage(lang) {
		this.languages.forEach((language: LanguageFlag) => {
			if (language.lang === lang) {
				language.active = true;
				this.language = language;
			} else {
				language.active = false;
			}
		});
		this.translationService.setLanguage(lang);
	}

	setSelectedLanguage(): any {
		// this.setLanguage(this.translationService.getSelectedLanguage());
		this.translationService.getSelectedLanguage().subscribe(lang => {
			if (lang) {
				setTimeout(() => {
					this.setLanguage(lang);
				});
			}
		});
	}
	getCultureLang(item) {
		if (item != null) {
			return this.translate.instant('Translator.' + StringHelper.convertToCamelCase(item.cultureLang));
		}
	}
}
