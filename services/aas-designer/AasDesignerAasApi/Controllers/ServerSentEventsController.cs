using System.Text.Json;
using AasDesignerAasApi.ServerSentEvent;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerAasApi.Controllers
{
    [ApiController]
    [Route("aas-api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal-aas")]
    public class ServerSentEventsController : ControllerBase
    {
        private readonly SubmodelUpdateMessageStore _submodelUpdateMessageStore;
        private readonly ShellUpdateMessageStore _shellUpdateMessageStore;
        private readonly SseClientStore _sseClientStore;
        private readonly PcnUpdateMessageStore _pcnUpdateMessageStore;
        private readonly ImportProgressMessageStore _importProgressMessageStore;

        public ServerSentEventsController(
            SubmodelUpdateMessageStore submodelUpdateMessageStore,
            ShellUpdateMessageStore shellUpdateMessageStore,
            PcnUpdateMessageStore pcnUpdateMessageStore,
            ImportProgressMessageStore importProgressMessageStore,
            SseClientStore sseClientStore
        )
        {
            _submodelUpdateMessageStore = submodelUpdateMessageStore;
            _shellUpdateMessageStore = shellUpdateMessageStore;
            _sseClientStore = sseClientStore;
            _pcnUpdateMessageStore = pcnUpdateMessageStore;
            _importProgressMessageStore = importProgressMessageStore;
        }

        [HttpGet]
        [Route("{guid}")]
        [RequestTimeout(milliseconds: 3600000)]
        public async Task WaitForUpdates(CancellationToken ct, string guid)
        {
            HttpContext.Response.Headers.ContentType = "text/event-stream";

            while (!ct.IsCancellationRequested)
            {
                await GetUpdateItemAndNotify(
                    HttpContext,
                    _shellUpdateMessageStore,
                    guid,
                    "ShellUpdated"
                );
                await GetUpdateItemAndNotify(
                    HttpContext,
                    _submodelUpdateMessageStore,
                    guid,
                    "SubmodelUpdated"
                );
                await GetUpdateItemAndNotify(
                    HttpContext,
                    _pcnUpdateMessageStore,
                    guid,
                    "ProductChangeNotificationReceived"
                );
                await GetUpdateItemAndNotify(
                    HttpContext,
                    _importProgressMessageStore,
                    guid,
                    "ImportProgressUpdated"
                );
            }
        }

        public async Task<Guid> RegisterClient()
        {
            var clientId = Guid.NewGuid();
            _sseClientStore.Clients.Add(
                new SseClient() { ClientGuid = clientId, LastActivity = DateTimeOffset.Now }
            );

            return await Task.FromResult(clientId);
        }

        private async Task GetUpdateItemAndNotify(
            HttpContext ctx,
            IBaseStore store,
            string guid,
            string message
        )
        {
            if (!_sseClientStore.Clients.Any(c => c.ClientGuid == Guid.Parse(guid)))
            {
                _sseClientStore.Clients.Add(
                    new SseClient()
                    {
                        ClientGuid = Guid.Parse(guid),
                        LastActivity = DateTimeOffset.Now,
                    }
                );
            }
            await Task.Run(async () =>
            {
                store.UpdateMessages.TryGetValue(Guid.Parse(guid), out var item);

                if (item is not null)
                {
                    await Notify(ctx, message, item);

                    store.UpdateMessages.TryRemove(Guid.Parse(guid), out _);
                }
                await Task.Delay(TimeSpan.FromSeconds(1));
            });
        }

        private async Task Notify(HttpContext ctx, string eventName, object data)
        {
            await ctx.Response.WriteAsync($"rety: 1000\n");
            await ctx.Response.WriteAsync($"event: {eventName}\n");
            await ctx.Response.WriteAsync($"data: ");
            await JsonSerializer.SerializeAsync(ctx.Response.Body, data);
            await ctx.Response.WriteAsync($"\n\n");
            await ctx.Response.Body.FlushAsync();
        }
    }
}
