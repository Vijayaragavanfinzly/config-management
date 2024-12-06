import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparePropertyDialogComponent } from './compare-property-dialog.component';

describe('ComparePropertyDialogComponent', () => {
  let component: ComparePropertyDialogComponent;
  let fixture: ComponentFixture<ComparePropertyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparePropertyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparePropertyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
