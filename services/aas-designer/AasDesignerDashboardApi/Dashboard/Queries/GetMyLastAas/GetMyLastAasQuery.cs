using AasDesignerApi.Model;
using AasDesignerApi.Statistics;
using AasDesignerCommon.Shells;
using AasDesignerCommon.Statistics;
using AasDesignerModel;
using AasDesignerModel.Model;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AasDesignerDashboardApi.Dashboard.Queries.GetMyLastAasQuery;

public class GetMyLastAasQuery : IRequest<List<AdditionalDataSaveShell>>
{
    public AppUser AppUser { get; set; } = null!;
}

public class GetMyLastAasQueryHandler
    : IRequestHandler<GetMyLastAasQuery, List<AdditionalDataSaveShell>>
{
    private readonly IApplicationDbContext _context;

    public GetMyLastAasQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AdditionalDataSaveShell>> Handle(
        GetMyLastAasQuery request,
        CancellationToken cancellationToken
    )
    {
        var result = new List<AdditionalDataSaveShell>();
        var seenEntries = new HashSet<string>(StringComparer.Ordinal);
        var infrastructures = new Dictionary<long, AasInfrastructureSettings?>();

        var lastActions = await _context
            .StatisticActions.Where(a =>
                a.BenutzerId == request.AppUser.BenutzerId
                && a.OrgaId == request.AppUser.OrganisationId
                && (
                    a.Typ == StatisticActionType.CREATE_SHELL
                    || a.Typ == StatisticActionType.SAVE_SHELL
                )
                && a.AdditionalData != ""
            )
            .OrderByDescending(a => a.ActionDate)
            .ThenByDescending(a => a.Id)
            .Take(50)
            .ToListAsync(cancellationToken: cancellationToken);

        foreach (var action in lastActions)
        {
            try
            {
                var recentEntry = JsonConvert.DeserializeObject<AdditionalDataSaveShell?>(
                    action.AdditionalData ?? ""
                );
                if (recentEntry == null || string.IsNullOrWhiteSpace(recentEntry.AasId))
                    continue;

                var dedupeKey = $"{recentEntry.InfrastructureId}:{recentEntry.AasId}";
                if (!seenEntries.Add(dedupeKey))
                    continue;

                recentEntry.LastEditedAt = action.ActionDate;
                recentEntry.IsAvailable = false;
                recentEntry.EventType = RecentAasDataFactory.ToEventType(action.Typ);

                var infrastructure = await GetInfrastructureAsync(
                    recentEntry.InfrastructureId,
                    infrastructures,
                    cancellationToken
                );
                if (infrastructure != null)
                {
                    recentEntry.IsAvailable = await TryCheckAvailabilityAsync(
                        infrastructure,
                        recentEntry.AasId,
                        request.AppUser,
                        cancellationToken
                    );

                    if (
                        recentEntry.IsAvailable == true
                        && string.IsNullOrWhiteSpace(recentEntry.IdShort)
                    )
                    {
                        recentEntry.IdShort = await TryLoadIdShortAsync(
                            infrastructure,
                            recentEntry.AasId,
                            request.AppUser,
                            cancellationToken
                        );
                    }
                }

                result.Add(recentEntry);
                if (result.Count >= 5)
                {
                    break;
                }
            }
            catch
            {
                // egal
            }
        }

        return result;
    }

    private async Task<AasInfrastructureSettings?> GetInfrastructureAsync(
        long infrastructureId,
        Dictionary<long, AasInfrastructureSettings?> cache,
        CancellationToken cancellationToken
    )
    {
        if (cache.TryGetValue(infrastructureId, out var infrastructure))
        {
            return infrastructure;
        }

        infrastructure = await _context
            .AasInfrastructureSettings.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == infrastructureId, cancellationToken);
        cache[infrastructureId] = infrastructure;
        return infrastructure;
    }

    private static async Task<bool> TryCheckAvailabilityAsync(
        AasInfrastructureSettings infrastructure,
        string aasId,
        AppUser appUser,
        CancellationToken cancellationToken
    )
    {
        try
        {
            return await ShellLoader.CheckIfExists(
                infrastructure,
                aasId,
                cancellationToken,
                appUser
            );
        }
        catch
        {
            return false;
        }
    }

    private static async Task<string> TryLoadIdShortAsync(
        AasInfrastructureSettings infrastructure,
        string aasId,
        AppUser appUser,
        CancellationToken cancellationToken
    )
    {
        try
        {
            var shell = await ShellLoader.LoadShellOnly(
                infrastructure,
                aasId,
                cancellationToken,
                appUser
            );
            return shell?.IdShort ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }
}
