using AasDesignerApi.Exceptions;
using AasDesignerApi.Model;
using AasDesignerApi.Service;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class DashboardController : InternalApiBaseController
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetStats()
        {
            if (HttpContext.Items["CurrentOrganisation"] is not Organisation orga)
                throw new OrgaNotFoundException();

            return await Task.FromResult(_dashboardService.GetStatistics(orga.Id));
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<Dictionary<int, int>>> GetLoginChartData()
        {
            if (HttpContext.Items["CurrentOrganisation"] is not Organisation orga)
                throw new OrgaNotFoundException();
            return await Task.FromResult(_dashboardService.GetLoginChartData(orga.Id));
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<Dictionary<int, int>>> GetSystemLoginChartData()
        {
            return await Task.FromResult(_dashboardService.GetSystemLoginChartData());
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<Dictionary<int, int>>> GetSystemLoginChartDataLast7Days()
        {
            return await Task.FromResult(_dashboardService.GetSystemLoginChartDataLast7Days());
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<Dictionary<int, int>>> GetSystemLoginChartDataMonth(
            int month,
            int year
        )
        {
            return await Task.FromResult(
                _dashboardService.GetSystemLoginChartDataMonth(month, year)
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<List<StatisticTableResult>>> GetSystemLoginTableData()
        {
            return await Task.FromResult(_dashboardService.GetSystemLoginTableData());
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<
            ActionResult<List<StatisticTableResult>>
        > GetSystemLoginTableDataLast7Days()
        {
            return await Task.FromResult(_dashboardService.GetSystemLoginTableDataLast7Days());
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<List<StatisticTableResult>>> GetSystemLoginTableDataMonth(
            int month,
            int year
        )
        {
            return await Task.FromResult(
                _dashboardService.GetSystemLoginTableDataMonth(month, year)
            );
        }

        [HttpGet]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<Dictionary<string, decimal>>> GetSystemStats()
        {
            return await Task.FromResult(_dashboardService.GetSystemStatistics());
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = new[]
            {
                AuthRoles.SYSTEM_ADMIN,
                AuthRoles.ORGA_ADMIN,
                AuthRoles.BENUTZER,
            }
        )]
        public async Task<ActionResult<int>> GetIntegratedSubmodels()
        {
            return await Task.FromResult(_dashboardService.GetIntegratedSubmodels());
        }
    }
}
