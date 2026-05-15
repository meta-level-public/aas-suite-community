using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddSendCurrentJwtToInfrastructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE "AasInfrastructureSettings"
                ADD COLUMN IF NOT EXISTS "SendCurrentJwt" boolean NOT NULL DEFAULT true;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "SendCurrentJwt", table: "AasInfrastructureSettings");
        }
    }
}
