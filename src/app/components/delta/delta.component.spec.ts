import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeltaComponent } from './delta.component';

describe('DeltaComponent', () => {
  let component: DeltaComponent;
  let fixture: ComponentFixture<DeltaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeltaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeltaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
