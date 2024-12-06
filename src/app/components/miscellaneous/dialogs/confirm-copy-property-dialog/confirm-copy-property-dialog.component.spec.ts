import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCopyPropertyDialogComponent } from './confirm-copy-property-dialog.component';

describe('ConfirmCopyPropertyDialogComponent', () => {
  let component: ConfirmCopyPropertyDialogComponent;
  let fixture: ComponentFixture<ConfirmCopyPropertyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmCopyPropertyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmCopyPropertyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
