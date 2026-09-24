FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["services/Directory.Packages.props", "services/"]
COPY ["services/dpp-gateway/dpp-gateway.csproj", "services/dpp-gateway/"]
RUN dotnet restore "services/dpp-gateway/dpp-gateway.csproj"

COPY services/dpp-gateway/ services/dpp-gateway/
WORKDIR /src/services/dpp-gateway
RUN dotnet publish "dpp-gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false /p:TF_BUILD=true

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "dpp-gateway.dll"]
