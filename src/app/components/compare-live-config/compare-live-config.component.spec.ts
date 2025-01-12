import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareLiveConfigComponent } from './compare-live-config.component';

describe('CompareLiveConfigComponent', () => {
  let component: CompareLiveConfigComponent;
  let fixture: ComponentFixture<CompareLiveConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareLiveConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareLiveConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
