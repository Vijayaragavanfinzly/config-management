import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncDialogExportComponent } from './sync-dialog-export.component';

describe('SyncDialogExportComponent', () => {
  let component: SyncDialogExportComponent;
  let fixture: ComponentFixture<SyncDialogExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncDialogExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncDialogExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
