using AasDesignerApi.Model;
using AasDesignerApi.Service;
using AasDesignerAuthorization;
using AasDesignerCommon.Utils;
using AasShared.Controllers;
using AasShared.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace AasDesignerApi.Controllers.Internal
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [ApiExplorerSettings(GroupName = "internal")]
    public class NewsController : InternalApiBaseController
    {
        private readonly NewsService _newsService;

        public NewsController(NewsService newsService)
        {
            _newsService = newsService;
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<News>> GetById(long id)
        {
            News? news = _newsService.GetById(id);

            if (news != null)
            {
                return await Task.FromResult(news);
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<bool> CheckForNews()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();

            return await Task.FromResult(_newsService.HasNews(benutzer));
        }

        /**
        * Gets all visible NewsItems.
        */
        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<List<News>>> GetAllVisible()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_newsService.GetAllVisible(benutzer.Benutzer));
        }

        /**
        * Gets all NewsItems.
        */
        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<List<News>>> GetAll()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_newsService.GetAll(benutzer.Benutzer));
        }

        [HttpGet]
        public async Task<ActionResult<List<News>>> GetAllPublic()
        {
            return await Task.FromResult(_newsService.GetAllPublic());
        }

        /**
        * Gets all invisible NewsItems.
        */
        [HttpGet]
        [AasDesignerAuthorize(
            RequiredRoles = [AuthRoles.ORGA_ADMIN, AuthRoles.BENUTZER, AuthRoles.SYSTEM_ADMIN]
        )]
        public async Task<ActionResult<List<News>>> GetInvisible()
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_newsService.GetInvisible(benutzer.Benutzer));
        }

        /**
        * Adds new News Item.
        */
        [HttpPut]
        [AasDesignerAuthorize]
        public async Task<ActionResult<News>> Add(News news)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_newsService.Add(benutzer.Benutzer, news));
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<bool>> AdminUpdate(long newsId, News news)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(
                _newsService.AdminUpdate(benutzer.Benutzer, news.Id, news)
            );
        }

        [HttpPatch]
        [AasDesignerAuthorize(RequiredRoles = [AuthRoles.SYSTEM_ADMIN])]
        public async Task<ActionResult<bool>> Remove(long newsId)
        {
            if (HttpContext.Items[AasDesignerConstants.APP_USER] is not AppUser benutzer)
                throw new UserNotFoundException();
            return await Task.FromResult(_newsService.Remove(benutzer.Benutzer, newsId));
        }
    }
}
