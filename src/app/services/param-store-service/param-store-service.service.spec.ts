import { TestBed } from '@angular/core/testing';

import { ParamStoreServiceService } from './param-store-service.service';

describe('ParamStoreServiceService', () => {
  let service: ParamStoreServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParamStoreServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
