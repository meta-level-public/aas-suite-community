using AasDesignerApi.Model;
using AasDesignerModel;

namespace VwsPortalApi.Cors
{
    public class CorsService
    {
        private readonly IApplicationDbContext _context;

        public CorsService(IApplicationDbContext context)
        {
            _context = context;
        }

        public List<CorsConfig> GetAll()
        {
            return _context.CorsConfigs.Where(c => c.Geloescht != true).ToList();
        }

        public bool CreateConfig(CorsConfig config)
        {
            _context.CorsConfigs.Add(config);
            _context.SaveChanges();

            return true;
        }

        public bool DeleteConfig(long id)
        {
            var config = _context.CorsConfigs.FirstOrDefault(c => c.Id == id);
            if (config != null)
            {
                _context.CorsConfigs.Remove(config);
                _context.SaveChanges();
            }

            return true;
        }

        public bool UpdateConfig(CorsConfig config)
        {
            var existingConfig = _context.CorsConfigs.FirstOrDefault(c => c.Id == config.Id);
            if (existingConfig == null)
                return false;

            existingConfig.CorsString = config.CorsString;
            existingConfig.Notice = config.Notice;

            _context.SaveChanges();

            return true;
        }

        public bool HasCorsConfig(string? origin)
        {
            return _context.CorsConfigs.Any(c => c.CorsString == origin || c.CorsString == "*");
        }
    }
}
