import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideComparisonComponent } from './guide-comparison.component';

describe('GuideComparisonComponent', () => {
  let component: GuideComparisonComponent;
  let fixture: ComponentFixture<GuideComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideComparisonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
