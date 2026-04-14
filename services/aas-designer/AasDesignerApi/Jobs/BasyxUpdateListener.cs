using System.Text.Json.Nodes;
using AasDesignerAasApi.ServerSentEvent;
using AasDesignerModel;
using AasShared.Configuration;
using MQTTnet;
using MQTTnet.Extensions.TopicTemplate;

namespace AasDesignerApi.Jobs
{
    public class BasyxUpdateListener : IHostedService
    {
        public BasyxUpdateListener(
            SubmodelUpdateMessageStore submodelUpdateMessageStore,
            ShellUpdateMessageStore shellUpdateMessageStore,
            ILogger<BasyxUpdateListener> logger,
            IServiceProvider provider
        )
        {
            _logger = logger;
            _provider = provider;
            _submodelUpdateMessageStore = submodelUpdateMessageStore;
            _shellUpdateMessageStore = shellUpdateMessageStore;
        }

        static readonly MqttTopicTemplate submodelTemplate = new(
            "sm-repository/sm-repo/submodels/updated"
        );
        static readonly MqttTopicTemplate shellTemplate = new(
            "aas-repository/aas-repo/shells/updated"
        );

        private readonly SubmodelUpdateMessageStore _submodelUpdateMessageStore;
        private readonly ShellUpdateMessageStore _shellUpdateMessageStore;
        private readonly ILogger<BasyxUpdateListener> _logger;
        private readonly IServiceProvider _provider;
        private Timer? _timer = null;

        private Dictionary<string, IMqttClient> mqttClients = [];

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("BasyxUpdateListener is starting.");
            _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromMinutes(1));
            return Task.CompletedTask;
        }

        private void DoWork(object? state)
        {
            try
            {
                var mqttFactory = new MqttClientFactory();

                using (var scope = _provider.CreateScope()) // this will use `IServiceScopeFactory` internally
                {
                    var context = scope.ServiceProvider.GetService<IApplicationDbContext>();
                    var appSettings =
                        scope.ServiceProvider.GetService<AppSettings>()
                        ?? throw new InvalidOperationException("AppSettings not registered.");
                    if (context != null)
                    {
                        var infrastructures = context
                            .AasInfrastructureSettings.Where(i => i.IsInternal == true)
                            .ToList();
                        infrastructures.ForEach(
                            async (infrastructure) =>
                            {
                                if (mqttClients.ContainsKey(infrastructure.Id.ToString()))
                                {
                                    // prüfen ob der noch "lebt" oder eigentlich "tot" sein muss
                                    if (infrastructure.Geloescht)
                                    {
                                        var client = mqttClients[infrastructure.Id.ToString()];
                                        await client.DisconnectAsync();
                                        mqttClients.Remove(infrastructure.Id.ToString());
                                    }
                                    else if (!infrastructure.IsActive)
                                    {
                                        var client = mqttClients[infrastructure.Id.ToString()];
                                        await client.DisconnectAsync();
                                        mqttClients.Remove(infrastructure.Id.ToString());
                                    }
                                    else
                                    {
                                        // sollte leben
                                        var client = mqttClients[infrastructure.Id.ToString()];
                                        if (!client.IsConnected)
                                        {
                                            // löschen und neu erzeugen
                                            mqttClients.Remove(infrastructure.Id.ToString());
                                            await CreateClientIfNotEmpty(
                                                mqttFactory,
                                                infrastructure,
                                                appSettings
                                            );
                                        }
                                    }
                                }
                                else
                                {
                                    await CreateClientIfNotEmpty(
                                        mqttFactory,
                                        infrastructure,
                                        appSettings
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
            AasDesignerModel.Model.AasInfrastructureSettings infrastructure,
            AppSettings appSettings
        )
        {
            if (!string.IsNullOrWhiteSpace(infrastructure.MqttContainer))
            {
                try
                {
                    var mqttClient = await CreateClient(
                        mqttFactory,
                        infrastructure.MqttContainer,
                        1833,
                        infrastructure.Id
                    );
                    if (mqttClient != null)
                    {
                        mqttClients.Add(infrastructure.Id.ToString(), mqttClient);
                    }
                }
                catch
                {
                    try
                    {
                        var mqttClient = await CreateClient(
                            mqttFactory,
                            appSettings.ContainerHost.Replace("http://", ""),
                            infrastructure.HostPortMqtt,
                            infrastructure.Id
                        );
                        if (mqttClient != null)
                        {
                            mqttClients.Add(infrastructure.Id.ToString(), mqttClient);
                        }
                    }
                    catch (Exception e)
                    {
                        _logger.LogError(
                            e,
                            "Error while creating MQTT client for infrastructure: "
                                + infrastructure.Id
                        );
                    }
                }
            }
        }

        private async Task<IMqttClient> CreateClient(
            MqttClientFactory mqttFactory,
            string containerAddress,
            int port,
            long idInfrastructure
        )
        {
            var mqttClient = mqttFactory.CreateMqttClient();
            var mqttClientOptions = new MqttClientOptionsBuilder()
                .WithClientId("SubmodelUpdateMessageStoreClient" + Guid.NewGuid().ToString())
                .WithTcpServer(containerAddress, port)
                .Build();

            // Setup message handling before connecting so that queued messages
            // are also handled properly. When there is no event handler attached all
            // received messages get lost.
            mqttClient.ApplicationMessageReceivedAsync += e =>
            {
                Console.WriteLine("Received application message.");

                var message = e.ApplicationMessage.ConvertPayloadToString();
                if (e.ApplicationMessage.Topic == shellTemplate.Template)
                {
                    var jsonNode =
                        JsonNode.Parse(message) ?? throw new Exception("Could not parse JSON");
                    var aas = AasCore.Aas3_1.Jsonization.Deserialize.AssetAdministrationShellFrom(
                        jsonNode
                    );

                    _shellUpdateMessageStore.AddNewUpdateMessage(aas.Id, idInfrastructure);
                }
                if (e.ApplicationMessage.Topic == submodelTemplate.Template)
                {
                    var jsonNode =
                        JsonNode.Parse(message) ?? throw new Exception("Could not parse JSON");
                    var sm = AasCore.Aas3_1.Jsonization.Deserialize.SubmodelFrom(jsonNode);

                    _submodelUpdateMessageStore.AddNewUpdateMessage(sm.Id, idInfrastructure);
                }

                return Task.CompletedTask;
            };

            await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);

            var mqttSubscribeOptions = mqttFactory
                .CreateSubscribeOptionsBuilder()
                .WithTopicTemplate(submodelTemplate)
                .Build();

            await mqttClient.SubscribeAsync(mqttSubscribeOptions, CancellationToken.None);

            Console.WriteLine("Subscribed to topic: " + submodelTemplate);

            mqttClient.DisconnectedAsync += async e =>
            {
                Console.WriteLine($" {submodelTemplate} Disconnected from MQTT broker.");
                int count = 0;
                while (!mqttClient.IsConnected)
                {
                    await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);
                    await Task.Delay(1000);
                    count++;

                    if (count > 10)
                    {
                        mqttClient = mqttFactory.CreateMqttClient();
                    }
                }
                // return Task.CompletedTask;
            };

            mqttClient.ConnectedAsync += e =>
            {
                Console.WriteLine("Connected to MQTT broker.");
                return Task.CompletedTask;
            };

            return mqttClient;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("BasyxUpdateListener is stopping.");
            return Task.CompletedTask;
        }
    }
}
