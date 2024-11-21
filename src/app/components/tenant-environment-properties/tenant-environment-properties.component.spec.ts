import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantEnvironmentPropertiesComponent } from './tenant-environment-properties.component';

describe('TenantEnvironmentPropertiesComponent', () => {
  let component: TenantEnvironmentPropertiesComponent;
  let fixture: ComponentFixture<TenantEnvironmentPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantEnvironmentPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantEnvironmentPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
