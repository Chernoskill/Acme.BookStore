import { TestBed } from '@angular/core/testing';

import { BookSignalRService } from './book.signal-r.service';

describe('BookSignalRService', () => {
  let service: BookSignalRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookSignalRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
