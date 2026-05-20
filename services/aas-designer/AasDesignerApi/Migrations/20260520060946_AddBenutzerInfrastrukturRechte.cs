using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddBenutzerInfrastrukturRechte : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BenutzerInfrastrukturRechte",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BenutzerId = table.Column<long>(type: "bigint", nullable: false),
                    OrganisationId = table.Column<long>(type: "bigint", nullable: false),
                    InfrastrukturId = table.Column<long>(type: "bigint", nullable: false),
                    DarfLesen = table.Column<bool>(type: "boolean", nullable: false),
                    DarfSchreiben = table.Column<bool>(type: "boolean", nullable: false),
                    DarfMarktPublizieren = table.Column<bool>(type: "boolean", nullable: false),
                    AnlageDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnlageBenutzer = table.Column<string>(type: "text", nullable: false),
                    AenderungsDatum = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AenderungsBenutzer = table.Column<string>(type: "text", nullable: false),
                    Geloescht = table.Column<bool>(type: "boolean", nullable: false),
                    AenderungsZaehler = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BenutzerInfrastrukturRechte", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BenutzerInfrastrukturRechte_AasInfrastructureSettings_Infra~",
                        column: x => x.InfrastrukturId,
                        principalTable: "AasInfrastructureSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BenutzerInfrastrukturRechte_Benutzers_BenutzerId",
                        column: x => x.BenutzerId,
                        principalTable: "Benutzers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BenutzerInfrastrukturRechte_Organisations_OrganisationId",
                        column: x => x.OrganisationId,
                        principalTable: "Organisations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BenutzerInfrastrukturRechte_BenutzerId_OrganisationId_Infra~",
                table: "BenutzerInfrastrukturRechte",
                columns: new[] { "BenutzerId", "OrganisationId", "InfrastrukturId" });

            migrationBuilder.CreateIndex(
                name: "IX_BenutzerInfrastrukturRechte_InfrastrukturId",
                table: "BenutzerInfrastrukturRechte",
                column: "InfrastrukturId");

            migrationBuilder.CreateIndex(
                name: "IX_BenutzerInfrastrukturRechte_OrganisationId",
                table: "BenutzerInfrastrukturRechte",
                column: "OrganisationId");

            // Data migration: all active users get all permissions for all infras in their org
            migrationBuilder.Sql("""
                INSERT INTO "BenutzerInfrastrukturRechte" (
                    "BenutzerId", "OrganisationId", "InfrastrukturId",
                    "DarfLesen", "DarfSchreiben", "DarfMarktPublizieren",
                    "AnlageDatum", "AnlageBenutzer",
                    "AenderungsDatum", "AenderungsBenutzer",
                    "Geloescht", "AenderungsZaehler"
                )
                SELECT
                    bo."BenutzerId",
                    bo."OrganisationId",
                    ai."Id",
                    true, true, true,
                    NOW(), 'migration',
                    NOW(), 'migration',
                    false, 0
                FROM "BenutzerOrganisations" bo
                INNER JOIN "AasInfrastructureSettings" ai ON ai."OrganisationId" = bo."OrganisationId"
                WHERE bo."Geloescht" = false
                  AND ai."Geloescht" = false;
                """);

            // SHELLS_READER, SHELLS_EDITOR, MARKT_PUBLISHER aus BenutzerOrganisation.BenutzerRollen entfernen
            migrationBuilder.Sql("""
                UPDATE "BenutzerOrganisations"
                SET "BenutzerRollen" = (
                    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)::text
                    FROM jsonb_array_elements_text("BenutzerRollen"::jsonb) AS t(elem)
                    WHERE elem NOT IN ('SHELLS_READER', 'SHELLS_EDITOR', 'MARKT_PUBLISHER')
                )
                WHERE "BenutzerRollen"::jsonb @> '["SHELLS_READER"]'
                   OR "BenutzerRollen"::jsonb @> '["SHELLS_EDITOR"]'
                   OR "BenutzerRollen"::jsonb @> '["MARKT_PUBLISHER"]';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BenutzerInfrastrukturRechte");
        }
    }
}
