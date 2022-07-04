import { Component, Output, EventEmitter, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormGroup, FormControl } from "@angular/forms";
import { LangParserPipe } from "app/pipes/lang-parser.pipe";
import { LanguageConfig, LanguageFlag } from "@core/_config/default/langs";
import { TranslateService } from "@ngx-translate/core";
import { StringHelper } from '@core/util/stringHelper';

@Component({
	selector: 'm-mmulti-lang-input-popup',
	templateUrl: './mmulti-lang-input-popup.component.html',
	styleUrls: ['./mmulti-lang-input-popup.component.scss']
})

export class MmultiLangInputPopupComponent {
	langItems: LanguageFlag[] = [];
	@Output() valueChange = new EventEmitter();

	private maxlength: number = null;
	private _required: boolean = false;
	hasFormErrors: boolean = false;
	errorMessage: string = this.translate.instant('General.Exception.PleaseFillAllTextBoxes');

	form: FormGroup = new FormGroup({});

	constructor(
		public dialogRef: MatDialogRef<MmultiLangInputPopupComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private translate: TranslateService,
		private langParser: LangParserPipe) {
		this.setSortedLangs();
	}

	setSortedLangs() {
		this.langItems = [];
		LanguageConfig.languages.forEach(langItem => {
			if (langItem.lang == this.translate.currentLang) {
				this.langItems.push(langItem);
			}
		});
		LanguageConfig.languages.forEach(langItem => {
			if (langItem.lang != this.translate.currentLang) {
				this.langItems.push(langItem);
			}
		});
	}

	ngOnInit() {
		this.langItems.forEach(langItem => {
			let val = this.langParser.parseOcean(this.data.value, langItem.lang.toLocaleUpperCase());
			this.form.addControl(langItem.lang, new FormControl(val));
		});

		this._required = this.data.isRequired;
		this.maxlength = this.data.maxlength ? this.data.maxlength : 4000;
	}

	close() {
		this.dialogRef.close();
	}

	getTitle(): string {
		return this.data.placeHolder;
	}

	getLangTitle(langItem) {
		if (langItem) {
			let key = StringHelper.convertToCamelCase(this.langItems.find(t => t.lang == langItem.lang).cultureLang);			
			return this.translate.instant("Translator." + key);
		}
	}

	save() {
		let oceanLangString = "";
		let firstItem: boolean = true;
		let diffLenght: number = 0;
		this.hasFormErrors = false;

		this.langItems.forEach(langItem => {
			if (!this.form.value[langItem.lang]) {
				this.hasFormErrors = true;
				this.errorMessage = this.translate.instant('General.Exception.PleaseFillAllTextBoxes');
				return;
			}

			var val = <string>(this.form.value[langItem.lang]).trim();

			if (val == null || !val)
				val = "";

			if (this._required && (!val || val == "")) {
				this.hasFormErrors = true;
				return;
			}

			if (firstItem) {
				oceanLangString = langItem.lang.toLocaleUpperCase() + ":=" + val;
				diffLenght += langItem.lang.length + 2;
				firstItem = false;
			} else {
				oceanLangString = oceanLangString + ";;" + langItem.lang.toLocaleUpperCase() + ":=" + val;
				diffLenght += langItem.lang.length + 4;
			}
		});

		if (this.maxlength && oceanLangString) {
			if (oceanLangString.length > this.maxlength) {
				this.hasFormErrors = true;
				this.errorMessage = this.translate.instant('General.Exception.PleaseEnterValueWithValidLength') + ' Maxlength:' + (this.maxlength - diffLenght).toString();
			}

			let aa = this.langItems.forEach(lng => lng.lang)
		}

		if (this.hasFormErrors)
			return;

		this.valueChange.next(oceanLangString);
		this.dialogRef.close();
	}
}
