import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareByTenantComponent } from './compare-by-tenant.component';

describe('CompareByTenantComponent', () => {
  let component: CompareByTenantComponent;
  let fixture: ComponentFixture<CompareByTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareByTenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareByTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
