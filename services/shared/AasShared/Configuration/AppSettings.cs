namespace AasShared.Configuration;

public class AppSettings
{
    public string Salt { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;

    // refresh token time to live (in days), inactive tokens are
    // automatically deleted from the database after this time
    public int RefreshTokenTTL { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string ReaderUrl { get; set; } = string.Empty;
    public string PublicBaseApiUrl { get; set; } = string.Empty;

#if DEBUG
    public string BaseApiUrlDev { get; set; } = string.Empty;
    public string BaseApiUrl
    {
        get => $"{BaseApiUrlDev}";
    }
    public string BaseAasxApiUrl
    {
        get => $"{BaseApiUrlDev}";
    }
#else
    public string BaseApiUrl
    {
        get => !string.IsNullOrWhiteSpace(PublicBaseApiUrl) ? PublicBaseApiUrl : $"{BaseUrl}/api";
    }
    public string BaseAasxApiUrl
    {
        get => $"{BaseApiUrl}";
    }
#endif

    public string InitialOrganisationName { get; set; } = "Demo Organisation";
    public string InitialOrganisationStrasse { get; set; } = "Demostrasse";
    public string InitialOrganisationPlz { get; set; } = "12345";
    public string InitialOrganisationOrt { get; set; } = "Demoort";
    public string InitialOrganisationEmail { get; set; } = "noreply@initial.orga";
    public string InitialOrganisationAdminEmail { get; set; } = "admin@initial.orga";
    public string InitialOrganisationAdminName { get; set; } = "Admin";
    public string InitialOrganisationAdminVorname { get; set; } = "Demo";
    public string InitialOrganisationAdminPassword { get; set; } = "secret-pass";
    public string LicenseFilePath { get; set; } = string.Empty;
    public string LicenseName { get; set; } = string.Empty;
    public string LicensePublicKeyPath { get; set; } = string.Empty;
    public string LicensePublicKeyPem { get; set; } = string.Empty;
    public bool AllowLicensePublicKeyOverride { get; set; } = false;

    public string ContainerManagerInboxDirectory { get; set; } = string.Empty;
    public int StartContainerPort { get; set; } = 10000;
    public string ContainerHost { get; set; } = "http://localhost";
    public string DockerHostConnection { get; set; } = "tcp://172.17.0.1:2375";
    public bool SingleTenantMode { get; set; }
    public bool KeycloakEnabled { get; set; } = false;
    public string KeycloakSsoSourceName { get; set; } = "keycloak";
    public string KeycloakIssuer { get; set; } = string.Empty;
    public string KeycloakWellKnownUrl { get; set; } = string.Empty;
    public string KeycloakPublicIssuer { get; set; } = string.Empty;
    public string KeycloakPublicWellKnownUrl { get; set; } = string.Empty;
    public string KeycloakClientId { get; set; } = string.Empty;
    public string KeycloakAudience { get; set; } = string.Empty;
    public string KeycloakScopes { get; set; } = string.Empty;
    public string KeycloakResourceAccessName { get; set; } = "account";
    public string KeycloakEmailClaimName { get; set; } = "email";
    public string KeycloakFirstNameClaimName { get; set; } = "given_name";
    public string KeycloakLastNameClaimName { get; set; } = "family_name";
    public string KeycloakAdminRealm { get; set; } = "master";
    public string KeycloakAdminClientId { get; set; } = "admin-cli";
    public string KeycloakAdminClientSecret { get; set; } = string.Empty;
    public string KeycloakAdminUsername { get; set; } = string.Empty;
    public string KeycloakAdminPassword { get; set; } = string.Empty;
    public List<string> MigrationForceProvisionEmails { get; set; } = ["info@meta-level.de"];

    public string InitialAasDiscoveryUrl { get; set; } = string.Empty;
    public string InitialAasDiscoveryVersion { get; set; } = "-";
    public string InitialAasDiscoveryContainer { get; set; } = string.Empty;
    public int InitialAasDiscoveryContainerPort { get; set; }
    public string InitialAasDiscoveryHcUrl { get; set; } = string.Empty;

    public string InitialAasRegistryUrl { get; set; } = string.Empty;
    public string InitialAasRegistryVersion { get; set; } = "-";
    public string InitialAasRegistryContainer { get; set; } = string.Empty;
    public int InitialAasRegistryContainerPort { get; set; }
    public string InitialAasRegistryHcUrl { get; set; } = string.Empty;

    public string InitialAasRepositoryUrl { get; set; } = string.Empty;
    public string InitialAasRepositoryVersion { get; set; } = "-";
    public string InitialAasRepositoryContainer { get; set; } = string.Empty;
    public int InitialAasRepositoryContainerPort { get; set; }
    public string InitialAasRepositoryHcUrl { get; set; } = string.Empty;

    public string InitialSubmodelRegistryUrl { get; set; } = string.Empty;
    public string InitialSubmodelRegistryVersion { get; set; } = "-";
    public string InitialSubmodelRegistryContainer { get; set; } = string.Empty;
    public int InitialSubmodelRegistryContainerPort { get; set; }
    public string InitialSubmodelRegistryHcUrl { get; set; } = string.Empty;

    public string InitialSubmodelRepositoryUrl { get; set; } = string.Empty;
    public string InitialSubmodelRepositoryVersion { get; set; } = "-";
    public string InitialSubmodelRepositoryContainer { get; set; } = string.Empty;
    public int InitialSubmodelRepositoryContainerPort { get; set; }
    public string InitialSubmodelRepositoryHcUrl { get; set; } = string.Empty;

    public string InitialConceptDescriptionRepositoryUrl { get; set; } = string.Empty;
    public string InitialConceptDescriptionRepositoryVersion { get; set; } = "-";
    public string InitialConceptDescriptionRepositoryContainer { get; set; } = string.Empty;
    public int InitialConceptDescriptionRepositoryContainerPort { get; set; }
    public string InitialConceptDescriptionRepositoryHcUrl { get; set; } = string.Empty;

    public bool HandleInitialInfrastructureAsInternal { get; set; } = false;

    public string ViewerAppUrl { get; set; } = "https://viewer.aas-suite.de";
}
