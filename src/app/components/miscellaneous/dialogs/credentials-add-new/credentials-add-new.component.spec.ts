import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentialsAddNewComponent } from './credentials-add-new.component';

describe('CredentialsAddNewComponent', () => {
  let component: CredentialsAddNewComponent;
  let fixture: ComponentFixture<CredentialsAddNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CredentialsAddNewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CredentialsAddNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
