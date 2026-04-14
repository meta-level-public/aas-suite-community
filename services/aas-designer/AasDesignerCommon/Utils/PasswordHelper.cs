using System.Text;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace AasDesignerCommon.Utils;

public static class PasswordHelper
{
    public static string GenerateHash(string password, string salt)
    {
        return Convert.ToBase64String(
            KeyDerivation.Pbkdf2(
                password: password,
                salt: Encoding.UTF8.GetBytes(salt),
                prf: KeyDerivationPrf.HMACSHA256,
                iterationCount: 100000,
                numBytesRequested: 256 / 8
            )
        );
    }

    public static string GenerateNewRandomPassword()
    {
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnobqrstuvwxyz1234567890".ToCharArray();

        var result = new StringBuilder();

        Enumerable
            .Range(0, 12)
            .ToList()
            .ForEach(_ =>
            {
                var randomPos = Random.Shared.Next(0, characters.Length);
                result.Append(characters[randomPos]);
            });

        return result.ToString();
    }
}
