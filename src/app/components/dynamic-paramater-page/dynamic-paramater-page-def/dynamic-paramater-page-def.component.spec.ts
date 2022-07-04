import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicParamaterPageDefComponent } from './dynamic-paramater-page-def.component';

describe('DynamicParamaterPageDefComponent', () => {
  let component: DynamicParamaterPageDefComponent;
  let fixture: ComponentFixture<DynamicParamaterPageDefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicParamaterPageDefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicParamaterPageDefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
