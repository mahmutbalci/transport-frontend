// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
	production: false,
	envName: 'LOCAL',
	showEnvName: true,
	baseUrl: 'https://localhost:44347/api',
	commonApiUrl: 'https://localhost:44347/api',
	frameworkApiUrl: 'https://localhost:44356/api',
	clearingApiUrl: 'https://localhost:44395/api',
	cleveractApiUrl: 'https://localhost:44331/api',
	acquiringApiUrl: 'https://localhost:44332/api',
	issuingApiUrl: 'https://localhost:44341/api',
	quartzMinUrl: 'http://localhost:8088/',
	crystalQuartzUrl: 'http://localhost:8088/quartz/',
};
