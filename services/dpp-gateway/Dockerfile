# Runs natively on the build host and cross-compiles for the target architecture (no QEMU)
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG TARGETARCH
WORKDIR /src

COPY ["services/Directory.Packages.props", "services/"]
COPY ["services/dpp-gateway/dpp-gateway.csproj", "services/dpp-gateway/"]
RUN dotnet restore "services/dpp-gateway/dpp-gateway.csproj" --os linux-musl -a $TARGETARCH

COPY services/dpp-gateway/ services/dpp-gateway/
WORKDIR /src/services/dpp-gateway
RUN dotnet publish "dpp-gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false /p:TF_BUILD=true --os linux-musl -a $TARGETARCH

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
# Alpine instead of Ubuntu: current OpenSSL and fewer open CVEs in the base image.
# icu-libs/tzdata: cultures (e.g. "de") and time zones; the Alpine image defaults to invariant globalization.
RUN apk upgrade --no-cache \
    && apk add --no-cache icu-libs tzdata curl
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "dpp-gateway.dll"]
