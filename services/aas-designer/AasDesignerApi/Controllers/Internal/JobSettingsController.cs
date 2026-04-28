using AasDesignerApi.Jobs;
using AasDesignerApi.Model;
using AasDesignerAuthorization;
using AasDesignerModel;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AasDesignerApi.Controllers.Internal;

[ApiController]
[Route("api/job-settings")]
[ApiExplorerSettings(GroupName = "internal-system-management")]
public sealed class JobSettingsController(IApplicationDbContext db) : InternalApiBaseController
{
    // GET api/job-settings/statistic-calculator
    [HttpGet("statistic-calculator")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetStatisticCalculatorSettings(
        CancellationToken cancellationToken
    )
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == StatisticCalculatorSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(StatisticCalculatorSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/statistic-calculator
    [HttpPut("statistic-calculator")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdateStatisticCalculatorSettings(
        [FromBody] StatisticCalculatorSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 1440)
            return BadRequest("IntervalMinutes muss zwischen 1 und 1440 liegen.");

        await StatisticCalculatorSettingsStore.SaveAsync(db, request, cancellationToken);
        return Ok(request);
    }

    // GET api/job-settings/daily-statistic-calculator
    [HttpGet("daily-statistic-calculator")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetDailyStatisticCalculatorSettings(
        CancellationToken cancellationToken
    )
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == DailyStatisticCalculatorSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(DailyStatisticCalculatorSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/daily-statistic-calculator
    [HttpPut("daily-statistic-calculator")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdateDailyStatisticCalculatorSettings(
        [FromBody] DailyStatisticCalculatorSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 10080)
            return BadRequest("IntervalMinutes muss zwischen 1 und 10080 liegen.");

        await DailyStatisticCalculatorSettingsStore.SaveAsync(db, request, cancellationToken);
        return Ok(request);
    }

    // GET api/job-settings/daily-expired-organisations-checker
    [HttpGet("daily-expired-organisations-checker")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetDailyExpiredOrganisationsCheckerSettings(
        CancellationToken cancellationToken
    )
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == DailyExpiredOrganisationsCheckerSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(DailyExpiredOrganisationsCheckerSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/daily-expired-organisations-checker
    [HttpPut("daily-expired-organisations-checker")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdateDailyExpiredOrganisationsCheckerSettings(
        [FromBody] DailyExpiredOrganisationsCheckerSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 10080)
            return BadRequest("IntervalMinutes muss zwischen 1 und 10080 liegen.");

        await DailyExpiredOrganisationsCheckerSettingsStore.SaveAsync(
            db,
            request,
            cancellationToken
        );
        return Ok(request);
    }

    // GET api/job-settings/periodic-organisation-deleter
    [HttpGet("periodic-organisation-deleter")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetPeriodicOrganisationDeleterSettings(
        CancellationToken cancellationToken
    )
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == PeriodicOrganisationDeleterSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(PeriodicOrganisationDeleterSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/periodic-organisation-deleter
    [HttpPut("periodic-organisation-deleter")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdatePeriodicOrganisationDeleterSettings(
        [FromBody] PeriodicOrganisationDeleterSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 10080)
            return BadRequest("IntervalMinutes muss zwischen 1 und 10080 liegen.");

        await PeriodicOrganisationDeleterSettingsStore.SaveAsync(db, request, cancellationToken);
        return Ok(request);
    }

    // GET api/job-settings/periodic-infrastructure-deleter
    [HttpGet("periodic-infrastructure-deleter")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetPeriodicInfrastructureDeleterSettings(
        CancellationToken cancellationToken
    )
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == PeriodicInfrastructureDeleterSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(PeriodicInfrastructureDeleterSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/periodic-infrastructure-deleter
    [HttpPut("periodic-infrastructure-deleter")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdatePeriodicInfrastructureDeleterSettings(
        [FromBody] PeriodicInfrastructureDeleterSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 10080)
            return BadRequest("IntervalMinutes muss zwischen 1 und 10080 liegen.");

        await PeriodicInfrastructureDeleterSettingsStore.SaveAsync(db, request, cancellationToken);
        return Ok(request);
    }

    // GET api/job-settings/idta-crawler
    [HttpGet("idta-crawler")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetIdtaCrawlerSettings(CancellationToken cancellationToken)
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == IdtaCrawlerSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(IdtaCrawlerSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/idta-crawler
    [HttpPut("idta-crawler")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdateIdtaCrawlerSettings(
        [FromBody] IdtaCrawlerSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 10080)
            return BadRequest("IntervalMinutes muss zwischen 1 und 10080 liegen.");

        await IdtaCrawlerSettingsStore.SaveAsync(db, request, cancellationToken);
        return Ok(request);
    }

    // GET api/job-settings/pcn-update-listener
    [HttpGet("pcn-update-listener")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> GetPcnUpdateListenerSettings(
        CancellationToken cancellationToken
    )
    {
        var stored = await db
            .PersistentSettings.AsNoTracking()
            .Where(s => s.Name == PcnUpdateListenerSettingsStore.SettingName)
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        return Ok(PcnUpdateListenerSettingsStore.Deserialize(stored));
    }

    // PUT api/job-settings/pcn-update-listener
    [HttpPut("pcn-update-listener")]
    [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
    public async Task<IActionResult> UpdatePcnUpdateListenerSettings(
        [FromBody] PcnUpdateListenerSettingsDto request,
        CancellationToken cancellationToken
    )
    {
        if (request.IntervalMinutes < 1 || request.IntervalMinutes > 1440)
            return BadRequest("IntervalMinutes muss zwischen 1 und 1440 liegen.");

        await PcnUpdateListenerSettingsStore.SaveAsync(db, request, cancellationToken);
        return Ok(request);
    }
}
