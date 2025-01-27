import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncSnackbarComponent } from './sync-snackbar.component';

describe('SyncSnackbarComponent', () => {
  let component: SyncSnackbarComponent;
  let fixture: ComponentFixture<SyncSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyncSnackbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyncSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
