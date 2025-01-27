import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonEnvironmentPropertiesComponent } from './common-environment-properties.component';

describe('CommonEnvironmentPropertiesComponent', () => {
  let component: CommonEnvironmentPropertiesComponent;
  let fixture: ComponentFixture<CommonEnvironmentPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonEnvironmentPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonEnvironmentPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
