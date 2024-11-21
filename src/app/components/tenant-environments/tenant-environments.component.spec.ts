import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantEnvironmentsComponent } from './tenant-environments.component';

describe('TenantEnvironmentsComponent', () => {
  let component: TenantEnvironmentsComponent;
  let fixture: ComponentFixture<TenantEnvironmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantEnvironmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantEnvironmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
