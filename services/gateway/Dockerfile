# Build Stage
# Runs natively on the build host and cross-compiles for the target architecture (no QEMU)
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG TARGETARCH
WORKDIR /src

# Copy directory-wide props first for central package management and shared build settings
COPY ["services/Directory.Build.props", "services/"]
COPY ["services/Directory.Packages.props", "services/"]

# Copy project files for restore
COPY ["services/shared/AasShared/AasShared.csproj", "services/shared/AasShared/"]
COPY ["services/gateway/gateway.csproj", "services/gateway/"]

# Restore dependencies
RUN dotnet restore "services/gateway/gateway.csproj" --os linux-musl -a $TARGETARCH

# Copy source code
COPY services/shared/ services/shared/
COPY services/gateway/ services/gateway/

# Build
WORKDIR /src/services/gateway
RUN dotnet build "gateway.csproj" -c Release -o /app/build -a $TARGETARCH

# Publish
FROM build AS publish
ARG TARGETARCH
RUN dotnet publish "gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false --os linux-musl -a $TARGETARCH

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
# Alpine instead of Ubuntu: current OpenSSL and fewer open CVEs in the base image.
# icu-libs/tzdata: cultures (e.g. "de") and time zones; the Alpine image defaults to invariant globalization.
RUN apk upgrade --no-cache \
    && apk add --no-cache icu-libs tzdata curl
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
EXPOSE 8080
EXPOSE 8081

RUN mkdir -p /var/lib/vws-gateway/keys

COPY --from=publish /app/publish .
ENV DataProtection__KeysPath=/var/lib/vws-gateway/keys
VOLUME ["/var/lib/vws-gateway/keys"]
ENTRYPOINT ["dotnet", "gateway.dll"]
