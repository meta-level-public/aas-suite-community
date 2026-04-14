using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using AasDesignerApi.Model;
using AasDesignerCommon.Utils;
using AasDesignerModel.Model;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AasDesignerCommon.Shells
{
    public class ShellDeleter
    {
        private static ILogger<ShellDeleter>? _logger;

        static ShellDeleter()
        {
            // Dienstanbieter für Dependency Injection abrufen
            var serviceProvider = new ServiceCollection()
                .AddLogging(configure =>
                {
                    configure.AddConsole();
                    configure.AddDebug();
                    configure.AddLog4Net("log4net.config", true);
                })
                .BuildServiceProvider();

            // Logger initialisieren
            _logger = serviceProvider.GetService<ILogger<ShellDeleter>>();
        }

        public static async Task DeleteShell(
            EditorDescriptor editorDescriptor,
            AasInfrastructureSettings infrastructureSettings,
            CancellationToken cancellationToken,
            AppUser appUser
        )
        {
            using var client = HttpClientCreator.CreateHttpClient(appUser);
            await DeleteShell(editorDescriptor, infrastructureSettings, cancellationToken, client);
        }

        public static async Task DeleteShell(
            EditorDescriptor editorDescriptor,
            AasInfrastructureSettings infrastructureSettings,
            CancellationToken cancellationToken,
            HttpClient client
        )
        {
            var url = editorDescriptor.AasDescriptorEntry.Endpoint;
            var response = await client.DeleteAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                LogDeleteFailure("AAS", response.StatusCode);
            }

            foreach (var submodelDescriptorEntry in editorDescriptor.SubmodelDescriptorEntries)
            {
                try
                {
                    url = submodelDescriptorEntry.Endpoint;
                    response = await client.DeleteAsync(url, cancellationToken);
                    if (!response.IsSuccessStatusCode)
                    {
                        LogDeleteFailure("Submodel", response.StatusCode);
                    }
                }
                catch (Exception e)
                {
                    _logger?.LogError(e, "Error deleting Submodel: {Message}", e.Message);
                }
            }

            // jetzt noch aus der Discovery entfernen
            try
            {
                await DiscoveryUpdater.RemoveFromDiscovery(
                    infrastructureSettings.AasDiscoveryUrl,
                    editorDescriptor.AasDescriptorEntry.OldId,
                    cancellationToken,
                    client
                );
            }
            catch (Exception e)
            {
                _logger?.LogError(e, "Error removing from Discovery: {Message}", e.Message);
            }

            // und registry aufräumen
            try
            {
                await RegistryUpdater.RemoveFromAasRegistryAsync(
                    infrastructureSettings.AasRegistryUrl,
                    editorDescriptor.AasDescriptorEntry.OldId,
                    cancellationToken,
                    client
                );
                foreach (var submodelDescriptorEntry in editorDescriptor.SubmodelDescriptorEntries)
                {
                    try
                    {
                        await RegistryUpdater.RemoveFromSmRegistryAsync(
                            infrastructureSettings.SubmodelRegistryUrl,
                            submodelDescriptorEntry.OldId,
                            cancellationToken,
                            client
                        );
                    }
                    catch (Exception e)
                    {
                        _logger?.LogError(
                            e,
                            "Error removing from Submodel Registry: {Message}",
                            e.Message
                        );
                    }
                }
            }
            catch (Exception e)
            {
                _logger?.LogError(e, "Error removing from Registry: {Message}", e.Message);
            }
        }

        private static void LogDeleteFailure(string resourceName, HttpStatusCode statusCode)
        {
            if (statusCode == HttpStatusCode.NotFound)
            {
                _logger?.LogDebug(
                    "{ResourceName} already deleted: {StatusCode}",
                    resourceName,
                    statusCode
                );
                return;
            }

            _logger?.LogError(
                "Error deleting {ResourceName}: {StatusCode}",
                resourceName,
                statusCode
            );
        }
    }
}
