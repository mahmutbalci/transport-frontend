export class LanguageConfig {

	public static languages: LanguageFlag[] = [

		{
			lang: 'en',
			country: 'USA',
			cultureLang: 'ENGLISH',
			flag: './assets/media/flags/012-uk.svg'
		},
		{
			lang: 'tr',
			country: 'TURKEY',
			cultureLang: "TURKISH",
			flag: './assets/media/flags/006-turkey.svg'
		}
	];
}

export interface LanguageFlag {
	lang: string;
	country: string;
	flag: string;
	active?: boolean;
	cultureLang: string;
}	
