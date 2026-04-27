# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy directory-wide props first for better Docker layer caching.
COPY services/Directory.Build.props ./services/
COPY services/Directory.Packages.props ./services/
COPY services/aas-designer/global.json ./services/aas-designer/
# Override NSwag only inside the Docker build context.
COPY services/aas-designer/Docker.Directory.Build.targets ./services/aas-designer/Directory.Build.targets

# Copy project files for restore.
COPY services/shared/AasShared/AasShared.csproj ./services/shared/AasShared/
COPY services/xsd/AasSchema/AasSchema.csproj ./services/xsd/AasSchema/
COPY services/aas-designer/AasDesignerApi.Host/AasDesignerApi.Host.csproj ./services/aas-designer/AasDesignerApi.Host/
COPY services/aas-designer/AasDesignerApi.Enterprise/AasDesignerApi.Enterprise.csproj ./services/aas-designer/AasDesignerApi.Enterprise/
COPY services/aas-designer/AasDesignerAasApi/AasDesignerAasApi.csproj ./services/aas-designer/AasDesignerAasApi/
COPY services/aas-designer/AasDesignerAuthorization/AasDesignerAuthorization.csproj ./services/aas-designer/AasDesignerAuthorization/
COPY services/aas-designer/AasDesignerCommon/AasDesignerCommon.csproj ./services/aas-designer/AasDesignerCommon/
COPY services/aas-designer/AasDesignerDashboardApi/AasDesignerDashboardApi.csproj ./services/aas-designer/AasDesignerDashboardApi/
COPY services/aas-designer/AasDesignerEnterpriseLicensing/AasDesignerEnterpriseLicensing.csproj ./services/aas-designer/AasDesignerEnterpriseLicensing/
COPY services/aas-designer/AasDesignerEnterpriseLicenseCore/AasDesignerEnterpriseLicenseCore.csproj ./services/aas-designer/AasDesignerEnterpriseLicenseCore/
COPY services/aas-designer/AasDesignerEnterpriseSystemManagementApi/AasDesignerEnterpriseSystemManagementApi.csproj ./services/aas-designer/AasDesignerEnterpriseSystemManagementApi/
COPY services/aas-designer/AasDesignerHelpApi/AasDesignerHelpApi.csproj ./services/aas-designer/AasDesignerHelpApi/
COPY services/aas-designer/AasDesignerModel/AasDesignerModel.csproj ./services/aas-designer/AasDesignerModel/
COPY services/aas-designer/AasDesignerSharedLinksApi/AasDesignerSharedLinksApi.csproj ./services/aas-designer/AasDesignerSharedLinksApi/
COPY services/aas-designer/AasDesignerSystemManagementApi/AasDesignerSystemManagementApi.csproj ./services/aas-designer/AasDesignerSystemManagementApi/

# Restore dependencies.
WORKDIR /src/services/aas-designer/AasDesignerApi.Enterprise
RUN dotnet restore

# Copy remaining source files.
WORKDIR /src
COPY services/shared/ ./services/shared/
COPY services/demo-licenses/ ./services/demo-licenses/
COPY services/xsd/ ./services/xsd/
COPY services/aas-designer/ ./services/aas-designer/

# Allow preview SDKs inside the container build image.
RUN echo '{"sdk":{"version":"10.0.100","rollForward":"latestPreview","allowPrerelease":true}}' > /src/services/aas-designer/global.json

# Publish directly to avoid NSwag-related Docker build failures.
FROM build AS publish
WORKDIR /src/services/aas-designer/AasDesignerApi.Enterprise
RUN dotnet publish -c Release -o /app/publish /p:RunNSwag=false /p:GenerateDocumentationFile=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN rm -rf /var/lib/apt/lists/* \
    && apt-get update -o Acquire::Retries=3 \
    && apt-get install -y --no-install-recommends curl libgssapi-krb5-2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "AasDesignerApi.dll"]
