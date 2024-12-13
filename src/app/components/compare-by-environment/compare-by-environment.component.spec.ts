import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareByEnvironmentComponent } from './compare-by-environment.component';

describe('CompareByEnvironmentComponent', () => {
  let component: CompareByEnvironmentComponent;
  let fixture: ComponentFixture<CompareByEnvironmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareByEnvironmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareByEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
