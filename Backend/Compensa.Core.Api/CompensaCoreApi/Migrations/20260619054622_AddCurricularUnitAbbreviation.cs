using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompensaCoreApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCurricularUnitAbbreviation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Abbreviation",
                table: "curricular_units",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Abbreviation",
                table: "curricular_units");
        }
    }
}
