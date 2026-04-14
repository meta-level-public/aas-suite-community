# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy directory-wide props first for central package management and shared build settings
COPY ["services/Directory.Build.props", "services/"]
COPY ["services/Directory.Packages.props", "services/"]

# Copy project files for restore
COPY ["services/shared/AasShared/AasShared.csproj", "services/shared/AasShared/"]
COPY ["services/gateway/gateway.csproj", "services/gateway/"]

# Restore dependencies
RUN dotnet restore "services/gateway/gateway.csproj"

# Copy source code
COPY services/shared/ services/shared/
COPY services/gateway/ services/gateway/

# Build
WORKDIR /src/services/gateway
RUN dotnet build "gateway.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && mkdir -p /var/lib/vws-gateway/keys \
    && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
ENV DataProtection__KeysPath=/var/lib/vws-gateway/keys
VOLUME ["/var/lib/vws-gateway/keys"]
ENTRYPOINT ["dotnet", "gateway.dll"]
