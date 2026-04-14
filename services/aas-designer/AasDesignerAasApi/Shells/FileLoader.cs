using AasDesignerApi.Model;
using AasDesignerCommon.Model;
using AasDesignerCommon.Utils;

namespace AasDesignerAasApi.Shells
{
    public static class FileLoader
    {
        public static Stream LoadFile(AasFileContent file, AppUser appUser)
        {
            return LoadFile(file.Endpoint, appUser);
        }

        public static Stream LoadFile(string endpoint, AppUser appUser)
        {
            using var client = HttpClientCreator.CreateHttpClient(appUser);
            var response = client.GetAsync(endpoint).Result;

            var stream = response.Content.ReadAsStreamAsync().Result;
            return stream;
        }
    }
}
