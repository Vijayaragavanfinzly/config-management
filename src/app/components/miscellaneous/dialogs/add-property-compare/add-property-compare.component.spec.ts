import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertyCompareComponent } from './add-property-compare.component';

describe('AddPropertyCompareComponent', () => {
  let component: AddPropertyCompareComponent;
  let fixture: ComponentFixture<AddPropertyCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPropertyCompareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPropertyCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
