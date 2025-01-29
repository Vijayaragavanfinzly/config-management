import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamStoreEnvironmentsComponent } from './param-store-environments.component';

describe('ParamStoreEnvironmentsComponent', () => {
  let component: ParamStoreEnvironmentsComponent;
  let fixture: ComponentFixture<ParamStoreEnvironmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParamStoreEnvironmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParamStoreEnvironmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
