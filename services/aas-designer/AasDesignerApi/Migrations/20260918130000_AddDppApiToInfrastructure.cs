using AasDesignerApi.Model;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AasDesignerApi.Migrations
{
    [DbContext(typeof(AasSuiteContext))]
    [Migration("20260918130000_AddDppApiToInfrastructure")]
    public partial class AddDppApiToInfrastructure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "DppApiUrl", table: "AasInfrastructureSettings", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "DppApiVersion", table: "AasInfrastructureSettings", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<string>(name: "DppApiHcUrl", table: "AasInfrastructureSettings", type: "text", nullable: false, defaultValue: "");
            migrationBuilder.AddColumn<bool>(name: "DppApiHcEnabled", table: "AasInfrastructureSettings", type: "boolean", nullable: false, defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DppApiUrl", table: "AasInfrastructureSettings");
            migrationBuilder.DropColumn(name: "DppApiVersion", table: "AasInfrastructureSettings");
            migrationBuilder.DropColumn(name: "DppApiHcUrl", table: "AasInfrastructureSettings");
            migrationBuilder.DropColumn(name: "DppApiHcEnabled", table: "AasInfrastructureSettings");
        }
    }
}
