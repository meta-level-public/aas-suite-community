using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class AddGoInfrastructureFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoPostgresDbName",
                table: "AasInfrastructureSettings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoPostgresUser",
                table: "AasInfrastructureSettings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGoInfrastructure",
                table: "AasInfrastructureSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoPostgresDbName",
                table: "AasInfrastructureSettings");

            migrationBuilder.DropColumn(
                name: "GoPostgresUser",
                table: "AasInfrastructureSettings");

            migrationBuilder.DropColumn(
                name: "IsGoInfrastructure",
                table: "AasInfrastructureSettings");
        }
    }
}
