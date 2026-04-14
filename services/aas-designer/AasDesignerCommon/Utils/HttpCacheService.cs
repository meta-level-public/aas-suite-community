using System.Collections.Concurrent;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace AasDesignerCommon.Utils;

/// <summary>
/// Service for caching HTTP responses and file downloads to avoid duplicate calls to the same URLs.
/// </summary>
public class HttpCacheService
{
    private readonly IMemoryCache _cache;
    private readonly ILogger<HttpCacheService>? _logger;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _lockMap = new();
    private readonly TimeSpan _defaultCacheDuration = TimeSpan.FromMinutes(30);

    public HttpCacheService(IMemoryCache cache, ILogger<HttpCacheService>? logger = null)
    {
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        _logger = logger;
    }

    /// <summary>
    /// Cached HTTP response data
    /// </summary>
    public class CachedHttpResponse
    {
        public string Content { get; set; } = string.Empty;
        public string ContentType { get; set; } = "text/plain";
        public bool IsSuccessful { get; set; } = true;
        public DateTime CachedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Cached file data
    /// </summary>
    public class CachedFileData
    {
        public MemoryStream Stream { get; set; } = new();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = "application/octet-stream";
        public DateTime CachedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Gets or caches an HTTP GET response
    /// </summary>
    public async Task<CachedHttpResponse> GetOrCacheHttpGetAsync(
        string url,
        HttpClient httpClient,
        TimeSpan? cacheDuration = null
    )
    {
        var cacheKey = GenerateCacheKey("http_get", url);
        var duration = cacheDuration ?? _defaultCacheDuration;

        return await GetOrSetAsync(
            cacheKey,
            async () =>
            {
                _logger?.LogInformation("Making HTTP GET request to: {Url}", url);

                try
                {
                    var response = await httpClient.GetAsync(url);
                    var content = await response.Content.ReadAsStringAsync();
                    var contentType =
                        response.Content.Headers.ContentType?.MediaType ?? "text/plain";

                    return new CachedHttpResponse
                    {
                        Content = content,
                        ContentType = contentType,
                        IsSuccessful = response.IsSuccessStatusCode,
                    };
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "HTTP GET request failed for URL: {Url}", url);
                    return new CachedHttpResponse
                    {
                        Content = string.Empty,
                        ContentType = "text/plain",
                        IsSuccessful = false,
                    };
                }
            },
            duration
        );
    }

    /// <summary>
    /// Gets or caches an HTTP POST response
    /// </summary>
    public async Task<CachedHttpResponse> GetOrCacheHttpPostAsync(
        string url,
        HttpContent content,
        HttpClient httpClient,
        TimeSpan? cacheDuration = null
    )
    {
        var contentString = await content.ReadAsStringAsync();
        var cacheKey = GenerateCacheKey("http_post", url, contentString);
        var duration = cacheDuration ?? _defaultCacheDuration;

        return await GetOrSetAsync(
            cacheKey,
            async () =>
            {
                _logger?.LogInformation("Making HTTP POST request to: {Url}", url);

                try
                {
                    // Reset content position for the actual request
                    if (content is StringContent)
                    {
                        content = new StringContent(contentString);
                    }

                    var response = await httpClient.PostAsync(url, content);
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseContentType =
                        response.Content.Headers.ContentType?.MediaType ?? "text/plain";

                    return new CachedHttpResponse
                    {
                        Content = responseContent,
                        ContentType = responseContentType,
                        IsSuccessful = response.IsSuccessStatusCode,
                    };
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "HTTP POST request failed for URL: {Url}", url);
                    return new CachedHttpResponse
                    {
                        Content = string.Empty,
                        ContentType = "text/plain",
                        IsSuccessful = false,
                    };
                }
            },
            duration
        );
    }

    /// <summary>
    /// Gets or caches a file download
    /// </summary>
    public async Task<CachedFileData> GetOrCacheFileAsync(
        string url,
        HttpClient httpClient,
        string prefix = "",
        TimeSpan? cacheDuration = null
    )
    {
        var cacheKey = GenerateCacheKey("file", url, prefix);
        var duration = cacheDuration ?? _defaultCacheDuration;

        return await GetOrSetAsync(
            cacheKey,
            async () =>
            {
                _logger?.LogInformation("Downloading file from: {Url}", url);

                try
                {
                    // Extract file info
                    var fileInfo = await FileFromUrlExtractor.ExtractFileInfoAsync(url, httpClient);
                    var filename = string.IsNullOrEmpty(prefix)
                        ? fileInfo.FileName
                        : $"{prefix}_{fileInfo.FileName}";

                    // Download file
                    using var stream = await httpClient.GetStreamAsync(url);
                    var memoryStream = new MemoryStream();
                    await stream.CopyToAsync(memoryStream);
                    memoryStream.Position = 0;

                    return new CachedFileData
                    {
                        Stream = memoryStream,
                        FileName = filename,
                        ContentType = fileInfo.ContentType,
                    };
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "File download failed for URL: {Url}", url);
                    return new CachedFileData
                    {
                        Stream = new MemoryStream(),
                        FileName = "error_file.bin",
                        ContentType = "application/octet-stream",
                    };
                }
            },
            duration
        );
    }

    /// <summary>
    /// Clears all cached data
    /// </summary>
    public void ClearCache()
    {
        if (_cache is MemoryCache memoryCache)
        {
            memoryCache.Clear();
        }
        _logger?.LogInformation("Cache cleared");
    }

    /// <summary>
    /// Gets cache statistics
    /// </summary>
    public int GetCacheCount()
    {
        // Note: MemoryCache doesn't expose count directly, this is an approximation
        // In a real implementation, you might want to track this separately
        return _lockMap.Count;
    }

    /// <summary>
    /// Generic method to get or set cached items with locking to prevent duplicate requests
    /// </summary>
    private async Task<T> GetOrSetAsync<T>(
        string cacheKey,
        Func<Task<T>> factory,
        TimeSpan duration
    )
    {
        // Check if item is already in cache
        if (_cache.TryGetValue(cacheKey, out T? cachedItem))
        {
            _logger?.LogDebug("Cache hit for key: {CacheKey}", cacheKey);
            return cachedItem!;
        }

        // Get or create a semaphore for this cache key to prevent duplicate requests
        var semaphore = _lockMap.GetOrAdd(cacheKey, _ => new SemaphoreSlim(1, 1));

        await semaphore.WaitAsync();
        try
        {
            // Double-check pattern: another thread might have populated the cache while we were waiting
            if (_cache.TryGetValue(cacheKey, out cachedItem))
            {
                _logger?.LogDebug("Cache hit after lock for key: {CacheKey}", cacheKey);
                return cachedItem!;
            }

            _logger?.LogDebug("Cache miss for key: {CacheKey}, fetching data", cacheKey);

            // Fetch the data
            var result = await factory();

            // Cache the result
            var cacheEntryOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = duration,
                SlidingExpiration = TimeSpan.FromMinutes(10), // Remove if not accessed for 10 minutes
                Size = 1,
                PostEvictionCallbacks =
                {
                    new PostEvictionCallbackRegistration { EvictionCallback = OnCacheEntryEvicted },
                },
            };

            _cache.Set(cacheKey, result, cacheEntryOptions);
            _logger?.LogDebug("Cached result for key: {CacheKey}", cacheKey);

            return result;
        }
        finally
        {
            semaphore.Release();
        }
    }

    /// <summary>
    /// Callback when cache entry is evicted
    /// </summary>
    private void OnCacheEntryEvicted(
        object key,
        object? value,
        EvictionReason reason,
        object? state
    )
    {
        _logger?.LogDebug("Cache entry evicted: {Key}, Reason: {Reason}", key, reason);

        // Clean up the semaphore for this key
        if (key is string keyString && _lockMap.TryRemove(keyString, out var semaphore))
        {
            semaphore.Dispose();
        }

        // Clean up resources in cached objects
        if (value is CachedFileData fileData)
        {
            fileData.Stream?.Dispose();
        }
    }

    /// <summary>
    /// Generates a cache key based on operation type, URL and optional additional data
    /// </summary>
    private static string GenerateCacheKey(
        string operation,
        string url,
        string? additionalData = null
    )
    {
        var keyBuilder = new StringBuilder($"http_cache:{operation}:{url}");

        if (!string.IsNullOrEmpty(additionalData))
        {
            keyBuilder.Append($":{GetHashCode(additionalData)}");
        }

        return keyBuilder.ToString();
    }

    /// <summary>
    /// Gets a simple hash code for cache key generation
    /// </summary>
    private static int GetHashCode(string input)
    {
        return input?.GetHashCode() ?? 0;
    }
}
