import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamStoreTenantEnvironmentPropertiesComponent } from './param-store-tenant-environment-properties.component';

describe('ParamStoreTenantEnvironmentPropertiesComponent', () => {
  let component: ParamStoreTenantEnvironmentPropertiesComponent;
  let fixture: ComponentFixture<ParamStoreTenantEnvironmentPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParamStoreTenantEnvironmentPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParamStoreTenantEnvironmentPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
