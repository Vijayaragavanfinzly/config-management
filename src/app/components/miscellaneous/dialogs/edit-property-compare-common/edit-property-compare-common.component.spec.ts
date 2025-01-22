import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPropertyCompareCommonComponent } from './edit-property-compare-common.component';

describe('EditPropertyCompareCommonComponent', () => {
  let component: EditPropertyCompareCommonComponent;
  let fixture: ComponentFixture<EditPropertyCompareCommonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPropertyCompareCommonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPropertyCompareCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
