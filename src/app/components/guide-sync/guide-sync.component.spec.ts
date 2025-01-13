import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideSyncComponent } from './guide-sync.component';

describe('GuideSyncComponent', () => {
  let component: GuideSyncComponent;
  let fixture: ComponentFixture<GuideSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideSyncComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
