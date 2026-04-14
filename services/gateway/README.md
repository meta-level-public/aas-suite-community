# API Gateway

Zentraler API-Gateway für das VWS Portal, basierend auf **Yarp (Yet Another Reverse Proxy)** von Microsoft.

## Übersicht

Der API Gateway dient als zentraler Einstiegspunkt für alle Client-Requests und leitet diese an die entsprechenden Backend-Services weiter.

### Funktionen

- ✅ **Reverse Proxy** - Request-Routing zu Backend-Services
- ✅ **Load Balancing** - Automatische Last-Verteilung
- ✅ **Health Checks** - Überwachung der Service-Verfügbarkeit
- ✅ **CORS** - Cross-Origin Resource Sharing
- ✅ **Zentrale Konfiguration** - Einfache Service-Verwaltung
- 🚧 **Authentication** - JWT-Token-Validierung (geplant)
- 🚧 **Rate Limiting** - Request-Throttling (geplant)
- 🚧 **Circuit Breaker** - Resilience-Pattern (geplant)

## Routing-Konfiguration

### Routes

| Route Pattern | Ziel-Service | Backend URL | Port |
|--------------|--------------|-------------|------|
| `/designer-api/**` | AAS Designer | http://localhost:5102 | 5102 |
| `/feed-mapping/**` | Feed Mapping | http://localhost:5104 | 5104 |
| `/health-dashboard/**` | Health Dashboard | http://localhost:5198 | 5198 |
| `/{**catch-all}` | Frontend | http://localhost:4211 | 4211 |

### Health Checks

- **Gateway Health:** `GET /health`
- **Service Health:** Automatische Checks alle 30 Sekunden

## Entwicklung

### Prerequisites

- .NET 8.0 SDK
- Laufende Backend-Services (oder Docker-Compose)

### Lokales Starten

```bash
cd services/gateway
dotnet run
```

Gateway läuft auf: `http://localhost:5000`

### Mit Docker

```bash
docker build -t vws-gateway .
docker run -p 5000:8080 vws-gateway
```

### Konfiguration

Die Routing-Konfiguration erfolgt in `appsettings.json`:

```json
{
  "ReverseProxy": {
    "Routes": {
      "designer-route": {
        "ClusterId": "aas-designer-cluster",
        "Match": {
          "Path": "/designer-api/{**catch-all}"
        },
        "Transforms": [
          { "PathRemovePrefix": "/designer-api" }
        ]
      }
    }
  }
}
```

Für BFF-Sessions verwendet das Gateway standardmäßig einen lokalen In-Memory-Store. Für mehrere Gateway-Instanzen oder zur Absicherung gegen Prozess-Restarts kann optional PostgreSQL als verteilter Session-Store aktiviert werden:

```bash
Session__Postgres__ConnectionString=Host=postgres;Port=5432;Database=aas_designer;Username=aas_user;Password=changeme
Session__Postgres__SchemaName=public
Session__Postgres__TableName=gateway_session_cache
Session__Postgres__CreateIfNotExists=true
Session__Postgres__ExpiredItemsDeletionInterval=00:30:00
Session__Postgres__DefaultSlidingExpiration=08:00:00
```

Ohne `Session__Postgres__ConnectionString` bleibt das bisherige Verhalten mit lokalem In-Memory-Store unverändert.

Bei Auth-/Refresh-Problemen loggt das Gateway zusätzlich Trace-ID, Request-Pfad und den Backend-Status des Refresh-Aufrufs. Damit lassen sich Session-Verlust im Gateway und vom Designer abgelehnte Refresh-Tokens sauber unterscheiden.

## Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Routing testen

```bash
# Via Gateway zum AAS Designer
curl http://localhost:5000/designer-api/system-management-api/SystemManagement/GetConfiguration

# Via Gateway zum Feed Mapping Service
curl http://localhost:5000/feed-mapping/health
```

## Deployment

### Docker

Dockerfile ist bereits erstellt. Build mit:

```bash
docker build -t vws-gateway -f Dockerfile .
```

### Kubernetes


## Monitoring

### Logs

```bash
# Docker Logs
docker logs -f vws-gateway

# Kubernetes Logs
kubectl logs -f deployment/gateway
```

### Metrics

Yarp exportiert automatisch Metrics für:
- Request-Anzahl
- Latency
- Fehlerquoten
- Destination Health

## Erweiterungen

### JWT-Authentication

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // JWT Configuration
    });
```

### Rate Limiting

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter("global", _ => 
            new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});
```

### Circuit Breaker (Polly)

```bash
dotnet add package Microsoft.Extensions.Http.Polly
```

```csharp
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddTransforms(builderContext =>
    {
        // Add Polly policies
    });
```

## Technische Details

- **Framework:** ASP.NET Core 8.0
- **Reverse Proxy:** Yarp 2.3.0
- **Port:** 5000 (Development), 8080 (Production)
- **Protocol:** HTTP/HTTPS

## Troubleshooting

### Service nicht erreichbar

1. Prüfe ob Backend-Service läuft
2. Prüfe Health-Check: `curl http://localhost:5000/health`
3. Prüfe Gateway-Logs auf Fehler

### CORS-Fehler

CORS ist standardmäßig für alle Origins aktiviert. Für Production sollte dies eingeschränkt werden:

```csharp
options.AddDefaultPolicy(policy =>
{
    policy.WithOrigins("https://frontend-domain.com")
          .AllowAnyMethod()
          .AllowAnyHeader();
});
```

## Dokumentation

- [Yarp Documentation](https://microsoft.github.io/reverse-proxy/)
- [ASP.NET Core Middleware](https://docs.microsoft.com/aspnet/core/fundamentals/middleware/)
