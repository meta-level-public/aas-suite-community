using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddShellsReaderEditorRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Alle bestehenden Org-Mitgliedschaften mit BENUTZER-Rolle bekommen
            // SHELLS_EDITOR und SHELLS_READER, da SHELLS_EDITOR SHELLS_READER impliziert.
            // BenutzerRollen ist text (JSON-Array), daher jsonb-Operatoren verwenden.
            migrationBuilder.Sql("""
                UPDATE "BenutzerOrganisations"
                SET "BenutzerRollen" = ("BenutzerRollen"::jsonb || '["SHELLS_EDITOR","SHELLS_READER"]'::jsonb)::text
                WHERE "BenutzerRollen"::jsonb @> '["BENUTZER"]'
                  AND NOT ("BenutzerRollen"::jsonb @> '["SHELLS_EDITOR"]')
                  AND NOT "Geloescht";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE "BenutzerOrganisations"
                SET "BenutzerRollen" = (
                    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)::text
                    FROM jsonb_array_elements_text("BenutzerRollen"::jsonb) AS t(elem)
                    WHERE elem NOT IN ('SHELLS_EDITOR', 'SHELLS_READER')
                )
                WHERE "BenutzerRollen"::jsonb @> '["SHELLS_EDITOR"]'
                   OR "BenutzerRollen"::jsonb @> '["SHELLS_READER"]';
                """);
        }
    }
}
