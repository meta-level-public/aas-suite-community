using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using Docker.DotNet;
using Docker.DotNet.Models;
using MediatR;

namespace AasDesignerAasApi.Infrastructure.Commands.StopContainer;

public class StopContainerCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public string ContainerName { get; set; } = string.Empty;
}

public class StopContainerHandler : IRequestHandler<StopContainerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public StopContainerHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        StopContainerCommand request,
        CancellationToken cancellationToken
    )
    {
        var dockerClient = new DockerClientConfiguration(
            new Uri(_settings.DockerHostConnection)
        ).CreateClient();

        await dockerClient.Containers.StopContainerAsync(
            request.ContainerName,
            new ContainerStopParameters(),
            cancellationToken
        );

        return true;
    }
}
