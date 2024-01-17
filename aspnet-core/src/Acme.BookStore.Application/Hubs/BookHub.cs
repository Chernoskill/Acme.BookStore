using System.Threading.Tasks;
using Acme.BookStore.Books;
using Acme.BookStore.Books.Hubs;
using Volo.Abp.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR;
using System;
using Volo.Abp.Uow;
using Volo.Abp.Domain.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Domain.Entities;

namespace Acme.BookStore.Hubs;

public class BookHub : AbpHub<IBookHub>
{
    public async override Task OnConnectedAsync()
    {
        IUnitOfWorkManager uowm = LazyServiceProvider.LazyGetRequiredService<IUnitOfWorkManager>();

        using (IUnitOfWork uow = uowm.Begin())
        {
            IRepository<Book, Guid> bookRepository = uow.ServiceProvider.GetRequiredService<IRepository<Book, Guid>>();
            if (await bookRepository.AnyAsync() == false)
            {
                throw new EntityNotFoundException(typeof(Book));
            }
        }
        await base.OnConnectedAsync();
    }

    [HubMethodName("CreateOrUpdateBook")]
    public async Task CreateOrUpdateBookAsync(CreateUpdateBookDto createDto, Guid? id)
    {
        IBookAppService bookAppService = LazyServiceProvider.LazyGetRequiredService<IBookAppService>();
        BookDto bookDto = id.HasValue ? await bookAppService.UpdateAsync((Guid)id!, createDto) : await bookAppService.CreateAsync(createDto);
        await Clients.All.BookUpdated(bookDto);
    }
}
