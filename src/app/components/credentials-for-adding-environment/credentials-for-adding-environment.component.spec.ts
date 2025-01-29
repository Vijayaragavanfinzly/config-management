import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialsForAddingEnvironmentComponent } from './credentials-for-adding-environment.component';

describe('CredentialsForAddingEnvironmentComponent', () => {
  let component: CredentialsForAddingEnvironmentComponent;
  let fixture: ComponentFixture<CredentialsForAddingEnvironmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialsForAddingEnvironmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialsForAddingEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
