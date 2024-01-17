using System;
using System.Threading.Tasks;

namespace Acme.BookStore.Books.Hubs;
public interface IBookHub
{
    public Task BookUpdated(BookDto bookDto);
}
