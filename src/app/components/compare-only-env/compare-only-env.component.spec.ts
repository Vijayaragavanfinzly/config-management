import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareOnlyEnvComponent } from './compare-only-env.component';

describe('CompareOnlyEnvComponent', () => {
  let component: CompareOnlyEnvComponent;
  let fixture: ComponentFixture<CompareOnlyEnvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareOnlyEnvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareOnlyEnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
