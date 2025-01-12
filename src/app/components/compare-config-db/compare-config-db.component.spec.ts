import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareConfigDbComponent } from './compare-config-db.component';

describe('CompareConfigDbComponent', () => {
  let component: CompareConfigDbComponent;
  let fixture: ComponentFixture<CompareConfigDbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareConfigDbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareConfigDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
