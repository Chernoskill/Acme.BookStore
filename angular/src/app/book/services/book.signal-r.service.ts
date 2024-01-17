import { Injectable, OnDestroy, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder, IRetryPolicy, RetryContext } from '@microsoft/signalr';
import { BookDto, CreateUpdateBookDto } from '@proxy/books';

@Injectable( {
  providedIn: 'root'
})
export class BookSignalRService implements OnDestroy, IRetryPolicy{
  hubUrl: string;
  public bookUpdated$ = signal<BookDto | undefined>(undefined);

  #hubConnection!: HubConnection;
  public connected = signal<boolean>(true);

  constructor() {
    this.hubUrl = 'https://localhost:44374/signalrbook';
    this.#startConnection();
  }

  ngOnDestroy(): void {
    if (this.#hubConnection) {
      this.#hubConnection.stop().then();
    }
  }

  #startConnection() {
    this.#hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect(this)
      .build();
    const startPromise = this.#hubConnection
      .start()
      .then(() => {
        this.connected.set(true);
      })
      .catch(err => console.log('Error while starting connection: ' + err));

    this.#hubConnection.on('BookUpdated', (dto: BookDto) => {
      this.bookUpdated$.set(dto);
    });

    this.#hubConnection.onclose(() => {
      this.connected.set(false);
      console.log('Poll Connection closed');
    });

    this.#hubConnection.onreconnecting(() => {
      this.connected.set(false);
      console.log('trying to reconnect to SignalR');
    });

    this.#hubConnection.onreconnected(() => {
      this.connected.set(true);
      console.log('successfully reconnected to SignalR');
    });

    return startPromise;
  }

  nextRetryDelayInMilliseconds(retryContext: RetryContext): number | null {
    return 3000;
  }

  public createOrUpdateBook(input: CreateUpdateBookDto, id?: string) {
    return this.#hubConnection.invoke<void>('CreateOrUpdateBook', input, id);
  }
}
