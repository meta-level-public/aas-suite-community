using AasDesignerApi.Idta;
using AasDesignerApi.Model.Configuration;
using LibGit2Sharp;

namespace AasDesignerApi.Service
{
    public class IdtaService
    {
        private readonly FileStorageConfiguration _fileStorageConfiguration;
        private readonly ILogger<IdtaService> _logger;

        public IdtaService(
            FileStorageConfiguration fileStorageConfiguration,
            ILogger<IdtaService> logger
        )
        {
            _fileStorageConfiguration = fileStorageConfiguration;
            _logger = logger;
        }

        public string GetRepoPath()
        {
            if (!Directory.Exists(_fileStorageConfiguration.GitPath))
            {
                Directory.CreateDirectory(_fileStorageConfiguration.GitPath);
            }
            return Path.Combine(_fileStorageConfiguration.GitPath, "idtaGit");
        }

        public void PullRepo()
        {
            try
            {
                var repoPath = GetRepoPath();

                if (!Directory.Exists(repoPath))
                {
                    Repository.Clone(
                        "https://github.com/admin-shell-io/submodel-templates.git",
                        repoPath
                    );
                }
                using var repo = new Repository(repoPath);

                var signature = new Signature("name", "email@meine.hier", DateTimeOffset.Now);
                var pullOptions = new PullOptions()
                {
                    MergeOptions = new MergeOptions()
                    {
                        FastForwardStrategy = FastForwardStrategy.Default,
                        FailOnConflict = false,
                        FileConflictStrategy = CheckoutFileConflictStrategy.Theirs,
                    },
                };

                Commands.Pull(repo, signature, pullOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError($"error pulling idta github {ex.Message}", ex);
            }
        }

        public byte[] GetFile(string filename)
        {
            return File.ReadAllBytes(Path.Combine(GetRepoPath(), filename));
        }

        public List<IdtaItem> GetTree()
        {
            var repoPath = GetRepoPath();
            var idtaTree = new List<IdtaItem>();

            var idtaPub = new IdtaItem() { Label = "Published" };
            var devPub = Path.Combine(repoPath, "published");
            TraverseDir(devPub, idtaPub);
            idtaTree.AddRange(idtaPub.Children);

            // var idtaDev = new IdtaItem()
            // {
            //     Label = "Development",
            // };
            // var devPath = Path.Combine(repoPath, "development");
            // TraverseDir(devPath, idtaDev);

            // idtaTree.Add(idtaDev);

            return idtaTree;
        }

        static void TraverseDir(string sDir, IdtaItem item)
        {
            // Zuerst alle Dateien im aktuellen Verzeichnis verarbeiten
            foreach (string f in Directory.GetFiles(sDir))
            {
                var fi = new FileInfo(f);
                var extension = fi.Extension.ToLower();
                if (extension == ".md" || extension == ".pdf" || extension == ".json")
                {
                    item.Children.Add(new IdtaItem() { Label = fi.Name, FullPath = fi.FullName });
                }
            }

            // Dann rekursiv alle Unterverzeichnisse durchlaufen
            foreach (string d in Directory.GetDirectories(sDir))
            {
                var di = new DirectoryInfo(d);
                var child = new IdtaItem() { Label = di.Name, FullPath = di.FullName };
                item.Children.Add(child);
                TraverseDir(d, child);
            }
        }
    }
}
