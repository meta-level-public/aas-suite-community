using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace AasDesignerApi.Utils;

public class EmailUtilService
{
    private readonly HttpClient HttpClient = new HttpClient();
    private HashSet<string> FreeEmailProviders = [];

    public EmailUtilService()
    {
        LoadFreeEmailProviders().Wait();
    }

    private async Task LoadFreeEmailProviders()
    {
        var url = "https://raw.githubusercontent.com/willwhite/freemail/master/data/free.txt";
        var response = await HttpClient.GetStringAsync(url);
        var providers = response.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        FreeEmailProviders = new HashSet<string>(providers, StringComparer.OrdinalIgnoreCase);
    }

    public bool IsPublicEmailProvider(string email)
    {
        var emailDomain = email.Split('@')[1];
        return FreeEmailProviders.Contains(emailDomain);
    }

    public static string AnonymizeEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2)
            throw new ArgumentException("Invalid email format");

        var localPart = parts[0];
        var domainPart = parts[1];

        // Anonymize the local part, nut leave first and last chacter in plain text
        var anonymizedLocalPart =
            localPart.Length > 2
                ? $"{localPart[0]}{new string('*', localPart.Length - 2)}{localPart[^1]}"
                : new string('*', localPart.Length);

        return $"{anonymizedLocalPart}@{domainPart}";
    }
}
