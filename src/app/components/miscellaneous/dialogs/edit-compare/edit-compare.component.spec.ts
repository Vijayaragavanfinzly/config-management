import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCompareComponent } from './edit-compare.component';

describe('EditCompareComponent', () => {
  let component: EditCompareComponent;
  let fixture: ComponentFixture<EditCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
