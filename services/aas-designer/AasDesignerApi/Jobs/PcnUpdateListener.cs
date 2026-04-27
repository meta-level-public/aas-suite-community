using System.Text.Json.Nodes;
using AasDesignerAasApi.ServerSentEvent;
using AasDesignerApi.Model;
using AasDesignerModel;
using AasDesignerModel.Model;
using AasShared.Configuration;
using MQTTnet;
using MQTTnet.Extensions.TopicTemplate;

namespace AasDesignerApi.Jobs
{
    public class PcnUpdateListener : IHostedService
    {
        public PcnUpdateListener(
            PcnUpdateMessageStore pcnUpdateMessageStore,
            ILogger<PcnUpdateListener> logger,
            IServiceProvider provider
        )
        {
            _logger = logger;
            _provider = provider;
            _pcnUpdateMessageStore = pcnUpdateMessageStore;
        }

        private readonly ILogger<PcnUpdateListener> _logger;
        private readonly IServiceProvider _provider;
        private readonly PcnUpdateMessageStore _pcnUpdateMessageStore;
        private Timer? _timer = null;
        private CancellationTokenSource? _settingsCts;

        private Dictionary<string, IMqttClient> mqttClients = [];

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("PcnUpdateListener is starting.");
            _settingsCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            _ = Task.Run(() => RunSettingsLoopAsync(_settingsCts.Token), _settingsCts.Token);
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
            return Task.CompletedTask;
        }

        private async Task RunSettingsLoopAsync(CancellationToken cancellationToken)
        {
            using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
            while (await timer.WaitForNextTickAsync(cancellationToken))
            {
                PcnUpdateListenerSettingsDto settings;
                try
                {
                    using var scope = _provider.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                    settings = await PcnUpdateListenerSettingsStore.LoadAsync(
                        db,
                        cancellationToken
                    );
                }
                catch
                {
                    continue;
                }

                var newInterval = TimeSpan.FromMinutes(settings.IntervalMinutes);
                if (!settings.IsEnabled)
                    _timer?.Change(Timeout.Infinite, 0);
                else
                    _timer?.Change(newInterval, newInterval);
            }
        }

        private void DoWork(object? state)
        {
            try
            {
                var mqttFactory = new MqttClientFactory();

                using (var scope = _provider.CreateScope())
                {
                    using var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                    if (context != null)
                    {
                        var inactiveListeners = context
                            .PcnListeners.Where(i => i.IsActive == false)
                            .ToList();
                        inactiveListeners.ForEach(
                            async (listener) =>
                            {
                                if (mqttClients.ContainsKey(listener.Id.ToString()))
                                {
                                    var client = mqttClients[listener.Id.ToString()];
                                    await client.DisconnectAsync();
                                    mqttClients.Remove(listener.Id.ToString());
                                    client.Dispose();
                                    _logger.LogInformation(
                                        "Removed inactive MQTT client for listener ID: {ListenerId}",
                                        listener.Id
                                    );
                                }
                            }
                        );

                        var activeListeners = context
                            .PcnListeners.Where(i => i.IsActive == true)
                            .ToList();
                        activeListeners.ForEach(
                            async (listener) =>
                            {
                                if (mqttClients.ContainsKey(listener.Id.ToString()))
                                {
                                    if (!listener.IsActive)
                                    {
                                        var client = mqttClients[listener.Id.ToString()];
                                        await client.DisconnectAsync();
                                        mqttClients.Remove(listener.Id.ToString());
                                        client.Dispose();
                                        _logger.LogInformation(
                                            "Removed inactive MQTT client for listener ID: {ListenerId}",
                                            listener.Id
                                        );
                                    }
                                    else
                                    {
                                        var client = mqttClients[listener.Id.ToString()];
                                        if (!client.IsConnected)
                                        {
                                            mqttClients.Remove(listener.Id.ToString());
                                            await CreateClientIfNotEmpty(mqttFactory, listener);
                                            _logger.LogInformation(
                                                "Recreated MQTT client for listener ID: {ListenerId}",
                                                listener.Id
                                            );
                                        }
                                    }
                                }
                                else
                                {
                                    await CreateClientIfNotEmpty(mqttFactory, listener);
                                    _logger.LogInformation(
                                        "Created new MQTT client for listener ID: {ListenerId}",
                                        listener.Id
                                    );
                                }
                            }
                        );
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error while checking MQTT clients.");
            }
        }

        private async Task CreateClientIfNotEmpty(
            MqttClientFactory mqttFactory,
            PcnListener listener
        )
        {
            if (!string.IsNullOrWhiteSpace(listener.BrokerUrl))
            {
                try
                {
                    var mqttClient = await CreateClient(
                        mqttFactory,
                        listener.BrokerUrl,
                        listener.Topic,
                        listener.Id,
                        listener.AasIdentifier,
                        listener.Username,
                        listener.Password
                    );
                    if (mqttClient != null)
                    {
                        mqttClients.Add(listener.Id.ToString(), mqttClient);
                        _logger.LogInformation(
                            "Successfully created MQTT client for listener ID: {ListenerId}",
                            listener.Id
                        );
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(
                        e,
                        "Error while creating MQTT client for listener ID: {ListenerId}",
                        listener.Id
                    );
                }
            }
        }

        private async Task<IMqttClient> CreateClient(
            MqttClientFactory mqttFactory,
            string address,
            string topic,
            long listenerId,
            string aasIdentifier,
            string username,
            string password
        )
        {
            IMqttClient? mqttClient = null;
            try
            {
                mqttClient = mqttFactory.CreateMqttClient();
                var mqttClientOptions = new MqttClientOptionsBuilder()
                    .WithClientId("AasSuiteUpdateListener_" + Guid.NewGuid().ToString())
                    .WithTlsOptions(options =>
                    {
                        options.UseTls();
                        options.WithIgnoreCertificateChainErrors(); // Nur für Tests
                        options.WithIgnoreCertificateRevocationErrors(); // Nur für Tests
                    })
                    .WithTimeout(TimeSpan.FromSeconds(10))
                    .WithWebSocketServer(options =>
                    {
                        options.WithUri(address); // Setze die WebSocket-URL
                    })
                    .WithCredentials(username, password)
                    .Build();

                mqttClient.ApplicationMessageReceivedAsync += e =>
                {
                    _logger.LogInformation(
                        "Received application message for listener ID: {ListenerId}",
                        listenerId
                    );

                    var message = e.ApplicationMessage.ConvertPayloadToString();
                    var jsonNode =
                        JsonNode.Parse(message) ?? throw new Exception("Could not parse JSON");

                    var updateEntry = new PcnNotification
                    {
                        PcnListenerId = listenerId,
                        PcnSubmodelUrl = message,
                    };
                    using (var scope = _provider.CreateScope())
                    {
                        using var context =
                            scope.ServiceProvider.GetService<IApplicationDbContext>();
                        var listener = context?.PcnListeners.FirstOrDefault(i =>
                            i.Id == listenerId
                        );
                        if (listener == null)
                        {
                            throw new Exception("Listener not found");
                        }
                        context?.Add(updateEntry);
                        context?.SaveChanges();
                        _pcnUpdateMessageStore.AddNewUpdateMessage(
                            aasIdentifier,
                            listener.InfrastructureId,
                            message
                        );
                    }

                    return Task.CompletedTask;
                };

                await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);

                if (mqttClient.IsConnected)
                {
                    _logger.LogInformation(
                        "Connected to MQTT broker for listener ID: {ListenerId}",
                        listenerId
                    );
                    var mqttSubscribeOptions = mqttFactory
                        .CreateSubscribeOptionsBuilder()
                        .WithTopicTemplate(new MqttTopicTemplate(topic))
                        .Build();
                    await mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);
                    _logger.LogInformation(
                        "Subscribed to topic: {Topic} for listener ID: {ListenerId}",
                        topic,
                        listenerId
                    );
                }
                else
                {
                    _logger.LogError(
                        "Failed to connect to MQTT broker for listener ID: {ListenerId}",
                        listenerId
                    );
                    if (mqttClient != null)
                    {
                        mqttClient.Dispose();
                    }
                    throw new Exception("Failed to connect to MQTT broker");
                }

                mqttClient.DisconnectedAsync += async e =>
                {
                    _logger.LogWarning(
                        "Listener ID: {ListenerId} disconnected from MQTT broker.",
                        listenerId
                    );
                    try
                    {
                        await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);
                    }
                    catch
                    {
                        _logger.LogError(
                            "Reconnection failed for listener ID: {ListenerId}",
                            listenerId
                        );
                        mqttClients.Remove(listenerId.ToString());
                    }
                };

                mqttClient.ConnectedAsync += e =>
                {
                    _logger.LogInformation(
                        "Listener ID: {ListenerId} connected to MQTT broker.",
                        listenerId
                    );
                    return Task.CompletedTask;
                };

                return mqttClient;
            }
            catch (Exception e)
            {
                _logger.LogError(
                    e,
                    "Error while creating MQTT client for listener ID: {ListenerId}",
                    listenerId
                );
                if (mqttClient != null)
                {
                    mqttClient.Dispose();
                }
                throw;
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("PcnUpdateListener is stopping.");
            _settingsCts?.Cancel();
            _timer?.Change(Timeout.Infinite, 0);
            _timer?.Dispose();
            return Task.CompletedTask;
        }
    }
}
