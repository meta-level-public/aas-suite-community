using AasDesignerApi.Model;
using AasDesignerModel;

namespace AasDesignerApi.Service
{
    public class NewsService
    {
        private readonly IApplicationDbContext _context;
        private readonly ILogger<OrganisationService> _logger;

        public NewsService(
            IApplicationDbContext context,
            ILogger<OrganisationService> logger,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _context = context;
            _logger = logger;
        }

        /*
        * Insert new NewsItem.
        * Just Admins are allowed to -> How to check if User is Admin?
        */
        public News Add(Model.Benutzer user, News givenItem)
        {
            News newItem = new News()
            {
                Version = givenItem.Version,
                Description = givenItem.Description,
                Text = givenItem.Text,
                Date = givenItem.Date,
                Visible = givenItem.Visible,
                IsPublic = givenItem.IsPublic,
            };
            // adds object to db
            _context.News.Add(newItem);
            // saves changes in db
            _context.SaveChanges();
            return newItem;
        }

        /*
        * Change everything except for the Id in NewsItem.
        * Admins allowed.
        */
        public bool AdminUpdate(Model.Benutzer user, long NewsId, News news)
        {
            bool result = false;
            var foundNews = _context.News.FirstOrDefault(n => n.Id == NewsId);
            if (foundNews != null)
            {
                foundNews = UpdateNews(foundNews, news);
                _context.SaveChanges();
                result = true;
            }
            else
            {
                _logger.LogError($"News with ID {NewsId} not found.");
            }
            return result;
        }

        private static News UpdateNews(News input, News news)
        {
            input.Id = news.Id;
            input.Version = news.Version;
            input.Description = news.Description;
            input.Date = news.Date;
            input.Visible = news.Visible;
            input.Text = news.Text;
            input.IsPublic = news.IsPublic;

            return input;
        }

        /**
        * Set Visible = false.
        */
        public bool Remove(Model.Benutzer user, long NewsId)
        {
            bool result = false;
            var foundNews = _context.News.FirstOrDefault(n => n.Id == NewsId);
            if (foundNews != null)
            {
                foundNews.Visible = false;

                _context.SaveChanges();
                result = true;
            }
            else
            {
                _logger.LogWarning($"News with ID {NewsId} not found in DbNews.");
            }
            return result;
        }

        /*
        * Retrieve News by ID.
        * If ID not there, error.
        */
        public News GetById(long NewsId)
        {
            return _context.News.First(n => n.Id == NewsId);
        }

        public List<News> GetAllVisible(Model.Benutzer user)
        {
            return _context.News.Where(p => p.Visible).ToList();
        }

        public List<News> GetAll(Model.Benutzer user)
        {
            return _context.News.ToList();
        }

        public List<News> GetInvisible(Model.Benutzer user)
        {
            return _context.News.Where(p => !p.Visible).ToList();
        }

        public bool HasNews(Model.AppUser user)
        {
            return _context.News.Any(n =>
                n.Visible
                && (
                    user.Benutzer.Einstellungen == null
                    || !user.Benutzer.Einstellungen.ViewedNewsIds.Contains(n.Id)
                )
            );
        }

        public List<News> GetAllPublic()
        {
            return _context.News.Where(p => p.IsPublic).OrderByDescending(p => p.Date).ToList();
        }
    }
}
