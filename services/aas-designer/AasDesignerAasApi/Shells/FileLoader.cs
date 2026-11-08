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
            return LoadFile(endpoint, client);
        }

        /// <summary>
        /// Loads a file from the repository. Returns an empty stream when the repository answers
        /// with an error, so its error body is never copied or exported as file content.
        /// </summary>
        public static Stream LoadFile(string endpoint, HttpClient client)
        {
            var response = client.GetAsync(endpoint).Result;
            if (!response.IsSuccessStatusCode)
            {
                return new MemoryStream();
            }

            var stream = response.Content.ReadAsStreamAsync().Result;
            return stream;
        }
    }
}
