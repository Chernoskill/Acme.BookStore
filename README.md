ABP.io's BookStore tutorial web application with SignalR implementation showing how database operations are not applied when the corresponding REST API method is called from a SignalR Hub.

When creating or updating a book, CreateOrUpdateBookAsync on the BookHub is called which in turn calls BookAppService's CreateAsync or UpdateAsync methods to conduct database operations.

In BookHub's OnConnectedAsync override, it is necessary to use a UnitOfWorkManager instance to query the database. If this is not done, the database operations above are not applied.
