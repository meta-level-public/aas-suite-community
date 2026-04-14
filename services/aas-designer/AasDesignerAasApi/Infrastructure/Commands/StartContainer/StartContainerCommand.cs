using AasDesignerApi.Model;
using AasDesignerModel;
using AasShared.Configuration;
using Docker.DotNet;
using Docker.DotNet.Models;
using MediatR;

namespace AasDesignerAasApi.Infrastructure.Commands.StartContainer;

public class StartContainerCommand : IRequest<bool>
{
    public AppUser AppUser { get; set; } = null!;
    public string ContainerName { get; set; } = string.Empty;
}

public class StartContainerHandler : IRequestHandler<StartContainerCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly AppSettings _settings;

    public StartContainerHandler(IApplicationDbContext context, AppSettings settings)
    {
        _context = context;
        _settings = settings;
    }

    public async Task<bool> Handle(
        StartContainerCommand request,
        CancellationToken cancellationToken
    )
    {
        var dockerClient = new DockerClientConfiguration(
            new Uri(_settings.DockerHostConnection)
        ).CreateClient();

        await dockerClient.Containers.StartContainerAsync(
            request.ContainerName,
            new ContainerStartParameters(),
            cancellationToken
        );

        return true;
    }
}
