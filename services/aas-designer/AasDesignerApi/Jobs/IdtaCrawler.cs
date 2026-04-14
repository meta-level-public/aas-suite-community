using AasDesignerApi.Service;

namespace AasDesignerApi.Jobs
{
    public class IdtaCrawler : IHostedService, IDisposable
    {
        private readonly ILogger<IdtaCrawler> _logger;
        private readonly IServiceProvider _provider;
        private Timer? _timer = null;

        public IdtaCrawler(ILogger<IdtaCrawler> logger, IServiceProvider provider)
        {
            _logger = logger;
            _provider = provider;
        }

        public Task StartAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("IdtaCrawler running.");

            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(60));

            return Task.CompletedTask;
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

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
