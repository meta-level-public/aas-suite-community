using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AasDesignerApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveInternalAasInfrastructureGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InternalAasInfrastructureGuid",
                table: "Organisations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InternalAasInfrastructureGuid",
                table: "Organisations",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
