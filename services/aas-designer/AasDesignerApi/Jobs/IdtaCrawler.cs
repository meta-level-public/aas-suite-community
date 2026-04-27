using AasDesignerApi.Model;
using AasDesignerApi.Service;
using AasDesignerModel;

namespace AasDesignerApi.Jobs
{
    public class IdtaCrawler : IHostedService, IDisposable
    {
        private readonly ILogger<IdtaCrawler> _logger;
        private readonly IServiceProvider _provider;
        private CancellationTokenSource? _cts;

        public IdtaCrawler(ILogger<IdtaCrawler> logger, IServiceProvider provider)
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("IdtaCrawler running.");
            _cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
            _ = Task.Run(() => RunLoopAsync(_cts.Token), _cts.Token);
            return Task.CompletedTask;
        }

        private async Task RunLoopAsync(CancellationToken cancellationToken)
        {
            var lastRun = DateTimeOffset.MinValue;
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

            while (await timer.WaitForNextTickAsync(cancellationToken))
            {
                IdtaCrawlerSettingsDto settings;
                try
                {
                    using var scope = _provider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    settings = await IdtaCrawlerSettingsStore.LoadAsync(db, cancellationToken);
                }
                catch
                {
                    settings = new IdtaCrawlerSettingsDto(
                        IdtaCrawlerSettingsStore.DefaultIntervalMinutes,
                        true
                    );
                }

                if (!settings.IsEnabled)
                    continue;

                if (
                    DateTimeOffset.UtcNow - lastRun
                    < TimeSpan.FromMinutes(settings.IntervalMinutes)
                )
                    continue;

                lastRun = DateTimeOffset.UtcNow;
                try
                {
                    DoWork(null);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "IdtaCrawler: Fehler im Lauf.");
                }
            }
        }

        private void DoWork(object? state)
        {
            var service = _provider.GetService<IdtaService>();
            service?.PullRepo();

            _logger.LogInformation("IdtaCrawler ready");
        }

        public Task StopAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("IdtaCrawler is stopping.");
            _cts?.Cancel();
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _cts?.Dispose();
        }
    }
}
