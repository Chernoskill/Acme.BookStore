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

// As suggested in https://github.com/abpframework/abp/issues/18793#issuecomment-1897958325, implementing the IUnitOfWorkEnabled interface could be a solution
// Effectively, implementing the interface does not work, the database operations are not applied.
public class BookHub : AbpHub<IBookHub>, IUnitOfWorkEnabled
{
    [HubMethodName("CreateOrUpdateBook")]
    public virtual async Task CreateOrUpdateBookAsync(CreateUpdateBookDto createDto, Guid? id)
    {
        IBookAppService bookAppService = LazyServiceProvider.LazyGetRequiredService<IBookAppService>();
        BookDto bookDto = id.HasValue ? await bookAppService.UpdateAsync((Guid)id!, createDto) : await bookAppService.CreateAsync(createDto);
        await Clients.All.BookUpdated(bookDto);
    }
}