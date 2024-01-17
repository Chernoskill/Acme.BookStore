import { ListService, PagedResultDto } from '@abp/ng.core';
import { ChangeDetectorRef, Component, effect, Injector, OnInit } from '@angular/core';
import { BookService, BookDto, bookTypeOptions } from '@proxy/books';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbDateNativeAdapter, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService, Confirmation } from '@abp/ng.theme.shared';
import { BookSignalRService } from './services/book.signal-r.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss'],
  providers: [ListService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}, BookSignalRService],
})
export class BookComponent implements OnInit {
  book = { items: [], totalCount: 0 } as PagedResultDto<BookDto>;

  form: FormGroup;

  selectedBook = {} as BookDto;

  bookTypes = bookTypeOptions;

  isModalOpen = false;

  constructor(
    public readonly list: ListService,
    private bookService: BookService,
    private fb: FormBuilder,
    private confirmation: ConfirmationService, // inject the ConfirmationService
    public readonly _bookSignalRService: BookSignalRService,
    private readonly _injector: Injector,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.#subscribeSignalREvents();
    const bookStreamCreator = (query) => this.bookService.getList(query);

    this.list.hookToQuery(bookStreamCreator).subscribe((response) => {
      this.book = response;
    });
  }

  delete(id: string) {
    this.confirmation.warn('::AreYouSureToDelete', '::AreYouSure').subscribe((status) => {
      if (status === Confirmation.Status.confirm) {
        this.bookService.delete(id).subscribe(() => this.list.get());
      }
    });
  }

  createBook() {
    this.selectedBook = {} as BookDto; // reset the selected book
    this.buildForm();
    this.isModalOpen = true;
  }

  editBook(id: string) {
    this.bookService.get(id).subscribe((book) => {
      this.selectedBook = book;
      this.buildForm();
      this.isModalOpen = true;
    });
  }

  buildForm() {
    this.form = this.fb.group({
      name: [this.selectedBook.name || '', Validators.required],
      type: [this.selectedBook.type || null, Validators.required],
      publishDate: [
        this.selectedBook.publishDate ? new Date(this.selectedBook.publishDate) : null,
        Validators.required,
      ],
      price: [this.selectedBook.price || null, Validators.required],
    });
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this._bookSignalRService
      .createOrUpdateBook(this.form.value, this.selectedBook.id ? this.selectedBook.id : undefined)
      .then();
  }

  #subscribeSignalREvents() {
    effect(
      () => {
        const bookDto = this._bookSignalRService.bookUpdated$();
        if (!bookDto) {
          return;
        }
        this.isModalOpen = false;
        this.form.reset();
        this.list.get();
        this._cdr.markForCheck();
      },
      { injector: this._injector, allowSignalWrites: true },
    );
  }
}
