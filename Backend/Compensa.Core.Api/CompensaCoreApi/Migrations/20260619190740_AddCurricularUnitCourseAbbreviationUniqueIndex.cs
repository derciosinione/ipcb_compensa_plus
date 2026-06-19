using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompensaCoreApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCurricularUnitCourseAbbreviationUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Abbreviation",
                table: "curricular_units",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_curricular_units_CourseId_Abbreviation",
                table: "curricular_units",
                columns: new[] { "CourseId", "Abbreviation" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_curricular_units_CourseId_Abbreviation",
                table: "curricular_units");

            migrationBuilder.AlterColumn<string>(
                name: "Abbreviation",
                table: "curricular_units",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
