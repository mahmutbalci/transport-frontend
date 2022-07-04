import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentAnimateDirective, HeaderDirective, MenuDirective, StickyDirective } from './_base/layout';
import {
	FirstLetterPipe, GetObjectPipe, JoinPipe, OffcanvasDirective, SafePipe, ScrollTopDirective,
	SparklineChartDirective, TabClickEventDirective, TimeElapsedPipe, ToggleDirective
} from './_base/metronic';
import { TranslateModule } from '@ngx-translate/core';
import { CardNumberFormatPipe } from '@core/pipes/card-number-format-pipe';
import { RateFormatPipe, RateTimes100FormatPipe, DivideTo100Pipe } from '@core/pipes/rate-mask-pipe';
import { TimeFormatPipe } from 'app/pipes/time-format-pipe';
import { DateMmyyyyFormatPipe, DateMmyyyyFormatTxnPipe, YYMMDDToDDMMYYYYPipe, YYMMToMMYYYYPipe } from 'app/pipes/expiry-format-pipe';
import { TokenStorage } from './services/token-storage.service';
import { StringUpperDirective } from './_base/layout/directives/string-upper.directive';
import { ArnFormatPipe } from './pipes/arn-mask-pipe';
import { PictureConvertPipe } from './pipes/picture-convert.pipe';

const _pipes = [
	FirstLetterPipe,
	TimeElapsedPipe,
	JoinPipe,
	GetObjectPipe,
	SafePipe,
	TimeFormatPipe,
	DateMmyyyyFormatPipe,
	DateMmyyyyFormatTxnPipe,
	CardNumberFormatPipe,
	RateFormatPipe,
	RateTimes100FormatPipe,
	DivideTo100Pipe,
	StringUpperDirective,
	ArnFormatPipe,
	YYMMDDToDDMMYYYYPipe,
	YYMMToMMYYYYPipe,
	PictureConvertPipe,
];

const _directives = [
	ScrollTopDirective,
	HeaderDirective,
];

@NgModule({
	imports: [CommonModule,
		TranslateModule.forChild()],
	declarations: [
		// directives
		ScrollTopDirective,
		HeaderDirective,
		OffcanvasDirective,
		ToggleDirective,
		MenuDirective,
		TabClickEventDirective,
		SparklineChartDirective,
		ContentAnimateDirective,
		StickyDirective,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		FirstLetterPipe,
		..._pipes,
		..._directives,
	],
	exports: [
		// directives
		ScrollTopDirective,
		HeaderDirective,
		OffcanvasDirective,
		ToggleDirective,
		MenuDirective,
		TabClickEventDirective,
		SparklineChartDirective,
		ContentAnimateDirective,
		StickyDirective,
		TranslateModule,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		FirstLetterPipe,
		..._pipes,
		..._directives,
	],
	providers: [TokenStorage]
})
export class CoreModule {
}
