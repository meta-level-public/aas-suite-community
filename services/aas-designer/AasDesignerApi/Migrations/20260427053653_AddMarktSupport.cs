using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMarktSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Neue Tabelle – wird hier erstmalig angelegt.
            migrationBuilder.CreateTable(
                name: "markt_regex_freigaben",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    AasInfrastrukturId = table.Column<long>(type: "bigint", nullable: false),
                    Label = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TargetAttribute = table.Column<int>(type: "integer", nullable: false),
                    SpecificAssetIdName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    RegexPattern = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    LastRunAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastRunResult = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_markt_regex_freigaben", x => x.Id);
                });

            // markt_listings wurde bereits durch den Markt-Service angelegt – IF NOT EXISTS-Guard.
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS markt_listings (
                    "Id"                    uuid                     NOT NULL,
                    "SourceShellId"         character varying(512)   NOT NULL,
                    "Title"                 character varying(256)   NOT NULL,
                    "OrganizationName"      character varying(256)   NOT NULL,
                    "Summary"               character varying(2048)  NOT NULL,
                    "ViewerUrl"             character varying(2048),
                    "AasInfrastrukturId"    bigint,
                    "SourceType"            character varying(64)    NOT NULL,
                    "IsExternal"            boolean                  NOT NULL,
                    "OrganisationId"        bigint,
                    "PublisherId"           bigint,
                    "PublishedAt"           timestamp with time zone NOT NULL,
                    "LastModifiedBy"        character varying(256),
                    "LastModifiedAt"        timestamp with time zone NOT NULL,
                    "IsFeatured"            boolean                  NOT NULL,
                    "ThumbnailData"         bytea,
                    "ThumbnailContentType"  character varying(100),
                    "AssetKind"             character varying(64),
                    "GlobalAssetId"         character varying(2048),
                    "AutoManagedByRuleId"   uuid,
                    CONSTRAINT "PK_markt_listings" PRIMARY KEY ("Id")
                );
                """);

            // Neue Spalte für bestehende Deployments hinzufügen (idempotent).
            migrationBuilder.Sql("""
                ALTER TABLE markt_listings
                    ADD COLUMN IF NOT EXISTS "AutoManagedByRuleId" uuid;
                """);

            // FK von markt_listings → markt_regex_freigaben (idempotent via DO-Block).
            migrationBuilder.Sql("""
                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'FK_markt_listings_markt_regex_freigaben_AutoManagedByRuleId'
                    ) THEN
                        ALTER TABLE markt_listings
                            ADD CONSTRAINT "FK_markt_listings_markt_regex_freigaben_AutoManagedByRuleId"
                            FOREIGN KEY ("AutoManagedByRuleId")
                            REFERENCES markt_regex_freigaben ("Id")
                            ON DELETE SET NULL;
                    END IF;
                END $$;
                """);

            // markt_listing_submodels – IF NOT EXISTS-Guard.
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS markt_listing_submodels (
                    "Id"        uuid                   NOT NULL,
                    "ListingId" uuid                   NOT NULL,
                    "SemanticId" character varying(512) NOT NULL,
                    CONSTRAINT "PK_markt_listing_submodels" PRIMARY KEY ("Id"),
                    CONSTRAINT "FK_markt_listing_submodels_markt_listings_ListingId"
                        FOREIGN KEY ("ListingId") REFERENCES markt_listings ("Id") ON DELETE CASCADE
                );
                """);

            // markt_listing_specific_asset_ids – IF NOT EXISTS-Guard.
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS markt_listing_specific_asset_ids (
                    "Id"        uuid                     NOT NULL,
                    "ListingId" uuid                     NOT NULL,
                    "Name"      character varying(256)   NOT NULL,
                    "Value"     character varying(2048)  NOT NULL,
                    CONSTRAINT "PK_markt_listing_specific_asset_ids" PRIMARY KEY ("Id"),
                    CONSTRAINT "FK_markt_listing_specific_asset_ids_markt_listings_ListingId"
                        FOREIGN KEY ("ListingId") REFERENCES markt_listings ("Id") ON DELETE CASCADE
                );
                """);

            // Neue Tabelle – wird hier erstmalig angelegt.
            migrationBuilder.CreateTable(
                name: "markt_listing_rule_matches",
                columns: table => new
                {
                    ListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    RuleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_markt_listing_rule_matches", x => new { x.ListingId, x.RuleId });
                    table.ForeignKey(
                        name: "FK_markt_listing_rule_matches_markt_listings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "markt_listings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_markt_listing_rule_matches_markt_regex_freigaben_RuleId",
                        column: x => x.RuleId,
                        principalTable: "markt_regex_freigaben",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_markt_listing_rule_matches_RuleId",
                table: "markt_listing_rule_matches",
                column: "RuleId");

            // Indizes für bestehende Tabellen idempotent anlegen.
            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_markt_listing_specific_asset_ids_ListingId"
                    ON markt_listing_specific_asset_ids ("ListingId");
                CREATE INDEX IF NOT EXISTS "IX_markt_listing_submodels_ListingId"
                    ON markt_listing_submodels ("ListingId");
                CREATE INDEX IF NOT EXISTS "IX_markt_listings_AutoManagedByRuleId"
                    ON markt_listings ("AutoManagedByRuleId");
                CREATE UNIQUE INDEX IF NOT EXISTS "IX_markt_listings_SourceShellId"
                    ON markt_listings ("SourceShellId");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Nur neue Objekte entfernen – bestehende Markt-Tabellen bleiben.
            migrationBuilder.DropTable(name: "markt_listing_rule_matches");

            migrationBuilder.Sql("""
                ALTER TABLE markt_listings DROP COLUMN IF EXISTS "AutoManagedByRuleId";
                """);

            migrationBuilder.DropTable(name: "markt_regex_freigaben");
        }
    }
}
