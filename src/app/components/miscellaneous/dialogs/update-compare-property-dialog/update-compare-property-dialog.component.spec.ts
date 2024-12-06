import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateComparePropertyDialogComponent } from './update-compare-property-dialog.component';

describe('UpdateComparePropertyDialogComponent', () => {
  let component: UpdateComparePropertyDialogComponent;
  let fixture: ComponentFixture<UpdateComparePropertyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateComparePropertyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateComparePropertyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
