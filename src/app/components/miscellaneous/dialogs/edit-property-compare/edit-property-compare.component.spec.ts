import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPropertyCompareComponent } from './edit-property-compare.component';

describe('EditPropertyCompareComponent', () => {
  let component: EditPropertyCompareComponent;
  let fixture: ComponentFixture<EditPropertyCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPropertyCompareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPropertyCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
