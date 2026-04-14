using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Benutzers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Vorname = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Telefon = table.Column<string>(type: "text", nullable: false),
                    LetzerLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EmailBestaetigt = table.Column<bool>(type: "boolean", nullable: false),
                    AccountAktiv = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBySso = table.Column<bool>(type: "boolean", nullable: false),
                    ExternalIdentityProvider = table.Column<string>(type: "text", nullable: false),
                    ExternalIdentitySubject = table.Column<string>(type: "text", nullable: false),
                    ExternalIdentityUsername = table.Column<string>(type: "text", nullable: false),
                    Einstellungen = table.Column<string>(type: "text", nullable: true),
                    BenutzerRollen = table.Column<string>(type: "text", nullable: false),
                    ProfilbildBase64 = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false),
                    TokenConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    IsSystemUser = table.Column<bool>(type: "boolean", nullable: false),
                    DatenschutzAccepted = table.Column<bool>(type: "boolean", nullable: false),
                    DatenschutzAcceptedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Benutzers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConceptDescriptions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConceptDescriptionPlain = table.Column<string>(type: "text", nullable: false),
                    IdShort = table.Column<string>(type: "text", nullable: false),
                    CdId = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConceptDescriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CorsConfigs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Notice = table.Column<string>(type: "text", nullable: false),
                    CorsString = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorsConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DeleteProtocols",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DeleteType = table.Column<int>(type: "integer", nullable: false),
                    AdditionalData = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeleteProtocols", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EClassDomain",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Unit = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<string>(type: "text", nullable: false),
                    ReferredType = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassDomain", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EClassImportQueueItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    ImportFile = table.Column<byte[]>(type: "bytea", nullable: true),
                    DateImport = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Started = table.Column<bool>(type: "boolean", nullable: false),
                    DateStarted = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Error = table.Column<bool>(type: "boolean", nullable: false),
                    DateError = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: false),
                    CountFilesProcessed = table.Column<int>(type: "integer", nullable: false),
                    CountFiles = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassImportQueueItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EClassMetadatas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SchemaVersion = table.Column<string>(type: "text", nullable: false),
                    GeneratorVersion = table.Column<string>(type: "text", nullable: false),
                    GenerationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Creator = table.Column<string>(type: "text", nullable: false),
                    Authorisation = table.Column<string>(type: "text", nullable: false),
                    ContentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ContentIdentification = table.Column<string>(type: "text", nullable: false),
                    ContentDescription = table.Column<string>(type: "text", nullable: false),
                    ContentLanguage = table.Column<string>(type: "text", nullable: false),
                    OriginatingSystem = table.Column<string>(type: "text", nullable: false),
                    Languages = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassMetadatas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EClassTypeDefinitions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassTypeDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GlobalHelpTexts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Tag = table.Column<string>(type: "text", nullable: false),
                    TextDe = table.Column<string>(type: "text", nullable: false),
                    TextEn = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalHelpTexts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invitations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Vorname = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    BenutzerRollen = table.Column<List<string>>(type: "text[]", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    ValidUntil = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    InvitationGuid = table.Column<Guid>(type: "uuid", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invitations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "News",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Version = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Text = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Visible = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_News", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Organisations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Strasse = table.Column<string>(type: "text", nullable: true),
                    Plz = table.Column<string>(type: "text", nullable: true),
                    Ort = table.Column<string>(type: "text", nullable: true),
                    Bundesland = table.Column<string>(type: "text", nullable: true),
                    LaenderCode = table.Column<string>(type: "text", nullable: true),
                    LogoBase64 = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Telefon = table.Column<string>(type: "text", nullable: false),
                    Fax = table.Column<string>(type: "text", nullable: false),
                    AccountAktiv = table.Column<bool>(type: "boolean", nullable: false),
                    EclassCertificateId = table.Column<long>(type: "bigint", nullable: true),
                    IriPrefix = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false),
                    ThemeUrl = table.Column<string>(type: "text", nullable: true),
                    RegistryUrl = table.Column<string>(type: "text", nullable: true),
                    AasServerUrl = table.Column<string>(type: "text", nullable: true),
                    MaintenanceActive = table.Column<bool>(type: "boolean", nullable: false),
                    SystemUserId = table.Column<long>(type: "bigint", nullable: false),
                    MaxHostPort = table.Column<int>(type: "integer", nullable: false),
                    InternalAasInfrastructureGuid = table.Column<string>(type: "text", nullable: false),
                    ExpirationState = table.Column<int>(type: "integer", nullable: true),
                    ExpirationStateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organisations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PaymentModels",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NameLabel = table.Column<string>(type: "text", nullable: false),
                    BeschreibungInternal = table.Column<string>(type: "text", nullable: false),
                    BeschreibungLabel = table.Column<string>(type: "text", nullable: false),
                    AnzahlNutzer = table.Column<int>(type: "integer", nullable: false),
                    Preis = table.Column<double>(type: "double precision", nullable: false),
                    MehrfachBuchbar = table.Column<bool>(type: "boolean", nullable: false),
                    ExklusivBuchbar = table.Column<bool>(type: "boolean", nullable: false),
                    UserSelectable = table.Column<bool>(type: "boolean", nullable: false),
                    Period = table.Column<int>(type: "integer", nullable: false),
                    IsSystemModel = table.Column<bool>(type: "boolean", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentModels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PcnListeners",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AasIdentifier = table.Column<string>(type: "text", nullable: false),
                    BrokerUrl = table.Column<string>(type: "text", nullable: false),
                    Topic = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    OrganizationId = table.Column<long>(type: "bigint", nullable: false),
                    InfrastructureId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PcnListeners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PersistentSettings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersistentSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProtokollEintraege",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AendererId = table.Column<long>(type: "bigint", nullable: true),
                    AendererName = table.Column<string>(type: "text", nullable: false),
                    Tabellenname = table.Column<string>(type: "text", nullable: false),
                    KeyValues = table.Column<string>(type: "text", nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: false),
                    NewValues = table.Column<string>(type: "text", nullable: false),
                    ChangedColumns = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsTyp = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProtokollEintraege", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Rechnungsmonate",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RechnungsmonatJahr = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rechnungsmonate", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StatisticActions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Typ = table.Column<int>(type: "integer", nullable: false),
                    ActionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OrgaId = table.Column<long>(type: "bigint", nullable: false),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: false),
                    AdditionalData = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatisticActions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StatisticDatas",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Typ = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<decimal>(type: "numeric", nullable: false),
                    OrgaId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StatisticDatas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Token = table.Column<string>(type: "text", nullable: false),
                    Expires = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByIp = table.Column<string>(type: "text", nullable: false),
                    Revoked = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedByIp = table.Column<string>(type: "text", nullable: true),
                    ReplacedByToken = table.Column<string>(type: "text", nullable: true),
                    ReasonRevoked = table.Column<string>(type: "text", nullable: true),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshToken_Benutzers_BenutzerId",
                        column: x => x.BenutzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassClasses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Irdi = table.Column<string>(type: "text", nullable: false),
                    SourceLanguage = table.Column<string>(type: "text", nullable: false),
                    PreferredName = table.Column<string>(type: "text", nullable: false),
                    Definition = table.Column<string>(type: "text", nullable: false),
                    ShortName = table.Column<string>(type: "text", nullable: false),
                    Keywords = table.Column<string>(type: "text", nullable: false),
                    CreatedView = table.Column<string>(type: "text", nullable: false),
                    DateOfOriginalDefinition = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateOfCurrentVersion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateOfCurrentRevision = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Superclass = table.Column<string>(type: "text", nullable: false),
                    HierarchicalPosition = table.Column<string>(type: "text", nullable: false),
                    IsCaseOf = table.Column<string>(type: "text", nullable: false),
                    ObjectType = table.Column<string>(type: "text", nullable: false),
                    ImportFilename = table.Column<string>(type: "text", nullable: false),
                    EClassMetadataId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassClasses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassClasses_EClassMetadatas_EClassMetadataId",
                        column: x => x.EClassMetadataId,
                        principalTable: "EClassMetadatas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassProperties",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Irdi = table.Column<string>(type: "text", nullable: false),
                    PreferredName = table.Column<string>(type: "text", nullable: false),
                    Definition = table.Column<string>(type: "text", nullable: false),
                    ShortName = table.Column<string>(type: "text", nullable: false),
                    DateOfOriginalDefinition = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateOfCurrentVersion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateOfCurrentRevision = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DomainId = table.Column<long>(type: "bigint", nullable: true),
                    DependsOn = table.Column<string>(type: "text", nullable: false),
                    NameScope = table.Column<string>(type: "text", nullable: false),
                    IsMultivalent = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeprecated = table.Column<bool>(type: "boolean", nullable: false),
                    ObjectType = table.Column<string>(type: "text", nullable: false),
                    ImportFilename = table.Column<string>(type: "text", nullable: false),
                    EClassMetadataId = table.Column<long>(type: "bigint", nullable: false),
                    SuggestedValueList = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassProperties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassProperties_EClassDomain_DomainId",
                        column: x => x.DomainId,
                        principalTable: "EClassDomain",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EClassProperties_EClassMetadatas_EClassMetadataId",
                        column: x => x.EClassMetadataId,
                        principalTable: "EClassMetadatas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassUnits",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Irdi = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    PreferredName = table.Column<string>(type: "text", nullable: false),
                    ShortName = table.Column<string>(type: "text", nullable: false),
                    Definition = table.Column<string>(type: "text", nullable: false),
                    CodeListValue = table.Column<string>(type: "text", nullable: false),
                    EClassMetadataId = table.Column<long>(type: "bigint", nullable: false),
                    Symbol = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassUnits_EClassMetadatas_EClassMetadataId",
                        column: x => x.EClassMetadataId,
                        principalTable: "EClassMetadatas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassConstraints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Subset = table.Column<string>(type: "text", nullable: false),
                    TypeDefinitionId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassConstraints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassConstraints_EClassTypeDefinitions_TypeDefinitionId",
                        column: x => x.TypeDefinitionId,
                        principalTable: "EClassTypeDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassDatatypes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Irdi = table.Column<string>(type: "text", nullable: false),
                    PreferredName = table.Column<string>(type: "text", nullable: false),
                    Definition = table.Column<string>(type: "text", nullable: false),
                    DateOfOriginalDefinition = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateOfCurrentVersion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DateOfCurrentRevision = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TypeDefinitionId = table.Column<long>(type: "bigint", nullable: false),
                    NameScope = table.Column<string>(type: "text", nullable: false),
                    ImportFilename = table.Column<string>(type: "text", nullable: false),
                    EClassMetadataId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassDatatypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassDatatypes_EClassMetadatas_EClassMetadataId",
                        column: x => x.EClassMetadataId,
                        principalTable: "EClassMetadatas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EClassDatatypes_EClassTypeDefinitions_TypeDefinitionId",
                        column: x => x.TypeDefinitionId,
                        principalTable: "EClassTypeDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AasInfrastructureSettings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AasDiscoveryUrl = table.Column<string>(type: "text", nullable: false),
                    AasDiscoveryVersion = table.Column<string>(type: "text", nullable: false),
                    AasDiscoveryHcUrl = table.Column<string>(type: "text", nullable: false),
                    AasDiscoveryHcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AasRegistryUrl = table.Column<string>(type: "text", nullable: false),
                    AasRegistryVersion = table.Column<string>(type: "text", nullable: false),
                    AasRegistryHcUrl = table.Column<string>(type: "text", nullable: false),
                    AasRegistryHcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AasRepositoryUrl = table.Column<string>(type: "text", nullable: false),
                    AasRepositoryVersion = table.Column<string>(type: "text", nullable: false),
                    AasRepositoryHcUrl = table.Column<string>(type: "text", nullable: false),
                    AasRepositoryHcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SubmodelRegistryUrl = table.Column<string>(type: "text", nullable: false),
                    SubmodelRegistryVersion = table.Column<string>(type: "text", nullable: false),
                    SubmodelRegistryHcUrl = table.Column<string>(type: "text", nullable: false),
                    SubmodelRegistryHcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SubmodelRepositoryUrl = table.Column<string>(type: "text", nullable: false),
                    SubmodelRepositoryVersion = table.Column<string>(type: "text", nullable: false),
                    SubmodelRepositoryHcUrl = table.Column<string>(type: "text", nullable: false),
                    SubmodelRepositoryHcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ConceptDescriptionRepositoryUrl = table.Column<string>(type: "text", nullable: false),
                    ConceptDescriptionRepositoryVersion = table.Column<string>(type: "text", nullable: false),
                    ConceptDescriptionRepositoryHcUrl = table.Column<string>(type: "text", nullable: false),
                    ConceptDescriptionRepositoryHcEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    HeaderParameters = table.Column<string>(type: "text", nullable: false),
                    Certificate = table.Column<byte[]>(type: "bytea", nullable: true),
                    CertificatePassword = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    HandleAsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    IsReadonly = table.Column<bool>(type: "boolean", nullable: false),
                    AasEnvContainer = table.Column<string>(type: "text", nullable: false),
                    HostPortAasEnv = table.Column<int>(type: "integer", nullable: false),
                    AasEnvMemory = table.Column<long>(type: "bigint", nullable: false),
                    AasEnvMemSwap = table.Column<long>(type: "bigint", nullable: false),
                    AasDiscoveryContainer = table.Column<string>(type: "text", nullable: false),
                    HostPortAasDiscovery = table.Column<int>(type: "integer", nullable: false),
                    DiscoveryMemory = table.Column<long>(type: "bigint", nullable: false),
                    DiscoveryMemSwap = table.Column<long>(type: "bigint", nullable: false),
                    AasRegistryContainer = table.Column<string>(type: "text", nullable: false),
                    HostPortAasRegistry = table.Column<int>(type: "integer", nullable: false),
                    AasRegistryMemory = table.Column<long>(type: "bigint", nullable: false),
                    AasRegistryMemSwap = table.Column<long>(type: "bigint", nullable: false),
                    SmRegistryContainer = table.Column<string>(type: "text", nullable: false),
                    HostPortSmRegistry = table.Column<int>(type: "integer", nullable: false),
                    SmRegistryMemory = table.Column<long>(type: "bigint", nullable: false),
                    SmRegistryMemSwap = table.Column<long>(type: "bigint", nullable: false),
                    MqttContainer = table.Column<string>(type: "text", nullable: false),
                    HostPortMqtt = table.Column<int>(type: "integer", nullable: false),
                    MqttMemory = table.Column<long>(type: "bigint", nullable: false),
                    MqttMemSwap = table.Column<long>(type: "bigint", nullable: false),
                    MongoContainer = table.Column<string>(type: "text", nullable: false),
                    MongoMemory = table.Column<long>(type: "bigint", nullable: false),
                    MongoMemSwap = table.Column<long>(type: "bigint", nullable: false),
                    ContainerGuid = table.Column<string>(type: "text", nullable: false),
                    InternalPortAasEnv = table.Column<int>(type: "integer", nullable: false),
                    InternalPortAasRegistry = table.Column<int>(type: "integer", nullable: false),
                    InternalPortAasDiscovery = table.Column<int>(type: "integer", nullable: false),
                    InternalPortMqtt = table.Column<int>(type: "integer", nullable: false),
                    InternalPortSmRegistry = table.Column<int>(type: "integer", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AasInfrastructureSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AasInfrastructureSettings_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Adresses",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NameMlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    Strasse = table.Column<string>(type: "text", nullable: true),
                    StrasseMlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    Plz = table.Column<string>(type: "text", nullable: true),
                    Ort = table.Column<string>(type: "text", nullable: true),
                    OrtMlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    Bundesland = table.Column<string>(type: "text", nullable: true),
                    BundeslandMlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    LaenderCode = table.Column<string>(type: "text", nullable: true),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    BesitzerOrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Adresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Adresses_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Adresses_Organisations_BesitzerOrganisationId",
                        column: x => x.BesitzerOrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "BenutzerOrganisations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedBySso = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false),
                    BenutzerRollen = table.Column<string>(type: "text", nullable: false),
                    AccountAktiv = table.Column<bool>(type: "boolean", nullable: false),
                    IsStammOrga = table.Column<bool>(type: "boolean", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PersonalAccessToken = table.Column<string>(type: "text", nullable: false),
                    PersonalAccessTokenValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BenutzerOrganisations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BenutzerOrganisations_Benutzers_BenutzerId",
                        column: x => x.BenutzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BenutzerOrganisations_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DashboardLayouts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DashboardLayouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DashboardLayouts_Benutzers_BenutzerId",
                        column: x => x.BenutzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DashboardLayouts_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EclassCertificats",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    ValidTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ValidFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SerialNumber = table.Column<string>(type: "text", nullable: false),
                    IssuingCertificate = table.Column<string>(type: "text", nullable: false),
                    IssuedBy = table.Column<string>(type: "text", nullable: false),
                    Signature = table.Column<string>(type: "text", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EclassCertificats", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EclassCertificats_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassMetadataOrganisation",
                columns: table => new
                {
                    OrganisationsId = table.Column<long>(type: "bigint", nullable: false),
                    OwnedEclassDataId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassMetadataOrganisation", x => new { x.OrganisationsId, x.OwnedEclassDataId });
                    table.ForeignKey(
                        name: "FK_EClassMetadataOrganisation_EClassMetadatas_OwnedEclassDataId",
                        column: x => x.OwnedEclassDataId,
                        principalTable: "EClassMetadatas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EClassMetadataOrganisation_Organisations_OrganisationsId",
                        column: x => x.OrganisationsId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrgaHelpTexts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    Tag = table.Column<string>(type: "text", nullable: false),
                    TextDe = table.Column<string>(type: "text", nullable: false),
                    TextEn = table.Column<string>(type: "text", nullable: false),
                    GlobalHelpTextId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgaHelpTexts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrgaHelpTexts_GlobalHelpTexts_GlobalHelpTextId",
                        column: x => x.GlobalHelpTextId,
                        principalTable: "GlobalHelpTexts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrgaHelpTexts_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductDesignations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    BesitzerOrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductDesignations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductDesignations_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductDesignations_Organisations_BesitzerOrganisationId",
                        column: x => x.BesitzerOrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProductFamilys",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    BesitzerOrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductFamilys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductFamilys_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductFamilys_Organisations_BesitzerOrganisationId",
                        column: x => x.BesitzerOrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProductRoots",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    MlpKeyValues = table.Column<string>(type: "text", nullable: false),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    BesitzerOrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductRoots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductRoots_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ProductRoots_Organisations_BesitzerOrganisationId",
                        column: x => x.BesitzerOrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RequestForOffers",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Vorname = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    PaymentPeriod = table.Column<string>(type: "text", nullable: true),
                    NumberOfLicences = table.Column<string>(type: "text", nullable: true),
                    Price = table.Column<string>(type: "text", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestForOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RequestForOffers_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RequestForOffers_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SharedLinks",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Guid = table.Column<Guid>(type: "uuid", nullable: true),
                    Ablaufdatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Passwort = table.Column<string>(type: "text", nullable: false),
                    GeneratedLink = table.Column<string>(type: "text", nullable: false),
                    Notiz = table.Column<string>(type: "text", nullable: false),
                    AasIdentifier = table.Column<string>(type: "text", nullable: false),
                    AasInfrastrukturId = table.Column<long>(type: "bigint", nullable: false),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    BesitzerOrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    CountViews = table.Column<int>(type: "integer", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedLinks_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SharedLinks_Organisations_BesitzerOrganisationId",
                        column: x => x.BesitzerOrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Snippets",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Typ = table.Column<string>(type: "text", nullable: false),
                    Template = table.Column<string>(type: "text", nullable: false),
                    BesitzerId = table.Column<long>(type: "bigint", nullable: true),
                    BesitzerOrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    FreigabeLevel = table.Column<int>(type: "integer", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Snippets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Snippets_Benutzers_BesitzerId",
                        column: x => x.BesitzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Snippets_Organisations_BesitzerOrganisationId",
                        column: x => x.BesitzerOrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SubmodelTemplates",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    Filename = table.Column<string>(type: "text", nullable: false),
                    SemanticIds = table.Column<string>(type: "text", nullable: false),
                    SubmodelVersion = table.Column<string>(type: "text", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    DefaultInNew = table.Column<bool>(type: "boolean", nullable: false),
                    UsedAsCollection = table.Column<bool>(type: "boolean", nullable: false),
                    Deprecated = table.Column<bool>(type: "boolean", nullable: false),
                    Notiz = table.Column<string>(type: "text", nullable: false),
                    IdtaGitFolderPath = table.Column<string>(type: "text", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    Group = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmodelTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmodelTemplates_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "OrganisationPaymentModels",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    PaymentModelId = table.Column<long>(type: "bigint", nullable: false),
                    LoeschDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LoeschBenutzer = table.Column<string>(type: "text", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrganisationPaymentModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrganisationPaymentModels_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrganisationPaymentModels_PaymentModels_PaymentModelId",
                        column: x => x.PaymentModelId,
                        principalTable: "PaymentModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PcnNotifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PcnListenerId = table.Column<long>(type: "bigint", nullable: false),
                    PcnSubmodelUrl = table.Column<string>(type: "text", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PcnNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PcnNotifications_PcnListeners_PcnListenerId",
                        column: x => x.PcnListenerId,
                        principalTable: "PcnListeners",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrgaRechnungen",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Daten = table.Column<string>(type: "text", nullable: false),
                    Summe = table.Column<double>(type: "double precision", nullable: false),
                    Rechnungsdatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RechnungsmonatId = table.Column<long>(type: "bigint", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrgaRechnungen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrgaRechnungen_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrgaRechnungen_Rechnungsmonate_RechnungsmonatId",
                        column: x => x.RechnungsmonatId,
                        principalTable: "Rechnungsmonate",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EClassDescribedBy",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PreferredNameBlockAspect = table.Column<string>(type: "text", nullable: false),
                    Irdi = table.Column<string>(type: "text", nullable: false),
                    IsDeprecated = table.Column<bool>(type: "boolean", nullable: false),
                    OrderNumber = table.Column<int>(type: "integer", nullable: false),
                    EClassClassId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassDescribedBy", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassDescribedBy_EClassClasses_EClassClassId",
                        column: x => x.EClassClassId,
                        principalTable: "EClassClasses",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EClassValueMeanings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Irdi = table.Column<string>(type: "text", nullable: false),
                    OrderNumber = table.Column<int>(type: "integer", nullable: false),
                    PreferredName = table.Column<string>(type: "text", nullable: false),
                    ShortName = table.Column<string>(type: "text", nullable: false),
                    Definition = table.Column<string>(type: "text", nullable: false),
                    ValueCode = table.Column<string>(type: "text", nullable: false),
                    ConstraintId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EClassValueMeanings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EClassValueMeanings_EClassConstraints_ConstraintId",
                        column: x => x.ConstraintId,
                        principalTable: "EClassConstraints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Apikeys",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidUntil = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Notice = table.Column<string>(type: "text", nullable: false),
                    Scopes = table.Column<string>(type: "text", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: true),
                    AasInfrastructureSettingsId = table.Column<long>(type: "bigint", nullable: true),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apikeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Apikeys_AasInfrastructureSettings_AasInfrastructureSettings~",
                        column: x => x.AasInfrastructureSettingsId,
                        principalTable: "AasInfrastructureSettings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Apikeys_Benutzers_BenutzerId",
                        column: x => x.BenutzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Apikeys_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Mappings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AasInfrastructureSettingsId = table.Column<long>(type: "bigint", nullable: true),
                    MappingJson = table.Column<string>(type: "text", nullable: false),
                    AasIdentifier = table.Column<string>(type: "text", nullable: false),
                    IdShort = table.Column<string>(type: "text", nullable: false),
                    AssetType = table.Column<string>(type: "text", nullable: false),
                    BesitzerOrgaId = table.Column<long>(type: "bigint", nullable: true),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mappings_AasInfrastructureSettings_AasInfrastructureSetting~",
                        column: x => x.AasInfrastructureSettingsId,
                        principalTable: "AasInfrastructureSettings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Mappings_Organisations_BesitzerOrgaId",
                        column: x => x.BesitzerOrgaId,
                        principalTable: "Organisations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "LayoutPages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    RefreshInterval = table.Column<int>(type: "integer", nullable: false),
                    Index = table.Column<int>(type: "integer", nullable: false),
                    DashboardLayoutId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LayoutPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LayoutPages_DashboardLayouts_DashboardLayoutId",
                        column: x => x.DashboardLayoutId,
                        principalTable: "DashboardLayouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EclassCertificateBlobs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Datei = table.Column<byte[]>(type: "bytea", nullable: false),
                    CertificateId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EclassCertificateBlobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EclassCertificateBlobs_EclassCertificats_CertificateId",
                        column: x => x.CertificateId,
                        principalTable: "EclassCertificats",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LayoutRows",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Index = table.Column<int>(type: "integer", nullable: false),
                    LayoutPageId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LayoutRows", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LayoutRows_LayoutPages_LayoutPageId",
                        column: x => x.LayoutPageId,
                        principalTable: "LayoutPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LayoutColumns",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ContentUrl = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Width = table.Column<int>(type: "integer", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    FontColor = table.Column<string>(type: "text", nullable: false),
                    RefreshInterval = table.Column<int>(type: "integer", nullable: false),
                    Index = table.Column<int>(type: "integer", nullable: false),
                    InfrastructureId = table.Column<long>(type: "bigint", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ContentJson = table.Column<string>(type: "text", nullable: false),
                    LayoutRowId = table.Column<long>(type: "bigint", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LayoutColumns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LayoutColumns_LayoutRows_LayoutRowId",
                        column: x => x.LayoutRowId,
                        principalTable: "LayoutRows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AasInfrastructureSettings_OrganisationId",
                table: "AasInfrastructureSettings",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_Adresses_BesitzerId",
                table: "Adresses",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_Adresses_BesitzerOrganisationId",
                table: "Adresses",
                column: "BesitzerOrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_Apikeys_AasInfrastructureSettingsId",
                table: "Apikeys",
                column: "AasInfrastructureSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_Apikeys_BenutzerId",
                table: "Apikeys",
                column: "BenutzerId");

            migrationBuilder.CreateIndex(
                name: "IX_Apikeys_OrganisationId",
                table: "Apikeys",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_BenutzerOrganisations_BenutzerId",
                table: "BenutzerOrganisations",
                column: "BenutzerId");

            migrationBuilder.CreateIndex(
                name: "IX_BenutzerOrganisations_OrganisationId",
                table: "BenutzerOrganisations",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_Benutzers_ExternalIdentityProvider_ExternalIdentitySubject",
                table: "Benutzers",
                columns: new[] { "ExternalIdentityProvider", "ExternalIdentitySubject" });

            migrationBuilder.CreateIndex(
                name: "IX_DashboardLayouts_BenutzerId",
                table: "DashboardLayouts",
                column: "BenutzerId");

            migrationBuilder.CreateIndex(
                name: "IX_DashboardLayouts_OrganisationId",
                table: "DashboardLayouts",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_EclassCertificateBlobs_CertificateId",
                table: "EclassCertificateBlobs",
                column: "CertificateId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EclassCertificats_OrganisationId",
                table: "EclassCertificats",
                column: "OrganisationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EClassClasses_EClassMetadataId",
                table: "EClassClasses",
                column: "EClassMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassConstraints_TypeDefinitionId",
                table: "EClassConstraints",
                column: "TypeDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassDatatypes_EClassMetadataId",
                table: "EClassDatatypes",
                column: "EClassMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassDatatypes_TypeDefinitionId",
                table: "EClassDatatypes",
                column: "TypeDefinitionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EClassDescribedBy_EClassClassId",
                table: "EClassDescribedBy",
                column: "EClassClassId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassMetadataOrganisation_OwnedEclassDataId",
                table: "EClassMetadataOrganisation",
                column: "OwnedEclassDataId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassProperties_DomainId",
                table: "EClassProperties",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassProperties_EClassMetadataId",
                table: "EClassProperties",
                column: "EClassMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassUnits_EClassMetadataId",
                table: "EClassUnits",
                column: "EClassMetadataId");

            migrationBuilder.CreateIndex(
                name: "IX_EClassValueMeanings_ConstraintId",
                table: "EClassValueMeanings",
                column: "ConstraintId");

            migrationBuilder.CreateIndex(
                name: "IX_LayoutColumns_LayoutRowId",
                table: "LayoutColumns",
                column: "LayoutRowId");

            migrationBuilder.CreateIndex(
                name: "IX_LayoutPages_DashboardLayoutId",
                table: "LayoutPages",
                column: "DashboardLayoutId");

            migrationBuilder.CreateIndex(
                name: "IX_LayoutRows_LayoutPageId",
                table: "LayoutRows",
                column: "LayoutPageId");

            migrationBuilder.CreateIndex(
                name: "IX_Mappings_AasInfrastructureSettingsId",
                table: "Mappings",
                column: "AasInfrastructureSettingsId");

            migrationBuilder.CreateIndex(
                name: "IX_Mappings_BesitzerOrgaId",
                table: "Mappings",
                column: "BesitzerOrgaId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgaHelpTexts_GlobalHelpTextId",
                table: "OrgaHelpTexts",
                column: "GlobalHelpTextId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgaHelpTexts_OrganisationId",
                table: "OrgaHelpTexts",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganisationPaymentModels_OrganisationId",
                table: "OrganisationPaymentModels",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrganisationPaymentModels_PaymentModelId",
                table: "OrganisationPaymentModels",
                column: "PaymentModelId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgaRechnungen_OrganisationId",
                table: "OrgaRechnungen",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrgaRechnungen_RechnungsmonatId",
                table: "OrgaRechnungen",
                column: "RechnungsmonatId");

            migrationBuilder.CreateIndex(
                name: "IX_PcnNotifications_PcnListenerId",
                table: "PcnNotifications",
                column: "PcnListenerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductDesignations_BesitzerId",
                table: "ProductDesignations",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductDesignations_BesitzerOrganisationId",
                table: "ProductDesignations",
                column: "BesitzerOrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductFamilys_BesitzerId",
                table: "ProductFamilys",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductFamilys_BesitzerOrganisationId",
                table: "ProductFamilys",
                column: "BesitzerOrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductRoots_BesitzerId",
                table: "ProductRoots",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductRoots_BesitzerOrganisationId",
                table: "ProductRoots",
                column: "BesitzerOrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_BenutzerId",
                table: "RefreshToken",
                column: "BenutzerId");

            migrationBuilder.CreateIndex(
                name: "IX_RequestForOffers_BesitzerId",
                table: "RequestForOffers",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_RequestForOffers_OrganisationId",
                table: "RequestForOffers",
                column: "OrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedLinks_BesitzerId",
                table: "SharedLinks",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedLinks_BesitzerOrganisationId",
                table: "SharedLinks",
                column: "BesitzerOrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_Snippets_BesitzerId",
                table: "Snippets",
                column: "BesitzerId");

            migrationBuilder.CreateIndex(
                name: "IX_Snippets_BesitzerOrganisationId",
                table: "Snippets",
                column: "BesitzerOrganisationId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmodelTemplates_OrganisationId",
                table: "SubmodelTemplates",
                column: "OrganisationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Adresses");

            migrationBuilder.DropTable(
                name: "Apikeys");

            migrationBuilder.DropTable(
                name: "BenutzerOrganisations");

            migrationBuilder.DropTable(
                name: "ConceptDescriptions");

            migrationBuilder.DropTable(
                name: "CorsConfigs");

            migrationBuilder.DropTable(
                name: "DeleteProtocols");

            migrationBuilder.DropTable(
                name: "EclassCertificateBlobs");

            migrationBuilder.DropTable(
                name: "EClassDatatypes");

            migrationBuilder.DropTable(
                name: "EClassDescribedBy");

            migrationBuilder.DropTable(
                name: "EClassImportQueueItems");

            migrationBuilder.DropTable(
                name: "EClassMetadataOrganisation");

            migrationBuilder.DropTable(
                name: "EClassProperties");

            migrationBuilder.DropTable(
                name: "EClassUnits");

            migrationBuilder.DropTable(
                name: "EClassValueMeanings");

            migrationBuilder.DropTable(
                name: "Invitations");

            migrationBuilder.DropTable(
                name: "LayoutColumns");

            migrationBuilder.DropTable(
                name: "Mappings");

            migrationBuilder.DropTable(
                name: "News");

            migrationBuilder.DropTable(
                name: "OrgaHelpTexts");

            migrationBuilder.DropTable(
                name: "OrganisationPaymentModels");

            migrationBuilder.DropTable(
                name: "OrgaRechnungen");

            migrationBuilder.DropTable(
                name: "PcnNotifications");

            migrationBuilder.DropTable(
                name: "PersistentSettings");

            migrationBuilder.DropTable(
                name: "ProductDesignations");

            migrationBuilder.DropTable(
                name: "ProductFamilys");

            migrationBuilder.DropTable(
                name: "ProductRoots");

            migrationBuilder.DropTable(
                name: "ProtokollEintraege");

            migrationBuilder.DropTable(
                name: "RefreshToken");

            migrationBuilder.DropTable(
                name: "RequestForOffers");

            migrationBuilder.DropTable(
                name: "SharedLinks");

            migrationBuilder.DropTable(
                name: "Snippets");

            migrationBuilder.DropTable(
                name: "StatisticActions");

            migrationBuilder.DropTable(
                name: "StatisticDatas");

            migrationBuilder.DropTable(
                name: "SubmodelTemplates");

            migrationBuilder.DropTable(
                name: "EclassCertificats");

            migrationBuilder.DropTable(
                name: "EClassClasses");

            migrationBuilder.DropTable(
                name: "EClassDomain");

            migrationBuilder.DropTable(
                name: "EClassConstraints");

            migrationBuilder.DropTable(
                name: "LayoutRows");

            migrationBuilder.DropTable(
                name: "AasInfrastructureSettings");

            migrationBuilder.DropTable(
                name: "GlobalHelpTexts");

            migrationBuilder.DropTable(
                name: "PaymentModels");

            migrationBuilder.DropTable(
                name: "Rechnungsmonate");

            migrationBuilder.DropTable(
                name: "PcnListeners");

            migrationBuilder.DropTable(
                name: "EClassMetadatas");

            migrationBuilder.DropTable(
                name: "EClassTypeDefinitions");

            migrationBuilder.DropTable(
                name: "LayoutPages");

            migrationBuilder.DropTable(
                name: "DashboardLayouts");

            migrationBuilder.DropTable(
                name: "Benutzers");

            migrationBuilder.DropTable(
                name: "Organisations");
        }
    }
}
