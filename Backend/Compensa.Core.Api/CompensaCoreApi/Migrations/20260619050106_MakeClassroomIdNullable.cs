using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompensaCoreApi.Migrations
{
    /// <inheritdoc />
    public partial class MakeClassroomIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_class_groups_curricular_units_CurricularUnitId",
                table: "class_groups");

            migrationBuilder.DropForeignKey(
                name: "FK_class_schedules_classrooms_ClassroomId",
                table: "class_schedules");

            migrationBuilder.DropForeignKey(
                name: "FK_compensation_requests_class_groups_ClassGroupId",
                table: "compensation_requests");

            migrationBuilder.DropForeignKey(
                name: "FK_compensation_requests_class_schedules_OriginalClassSchedule~",
                table: "compensation_requests");

            migrationBuilder.DropIndex(
                name: "IX_class_groups_CourseId",
                table: "class_groups");

            migrationBuilder.DropIndex(
                name: "IX_class_groups_CurricularUnitId_Name",
                table: "class_groups");

            migrationBuilder.DropColumn(
                name: "ResponsibleTeacherEmail",
                table: "curricular_units");

            migrationBuilder.DropColumn(
                name: "ResponsibleTeacherId",
                table: "curricular_units");

            migrationBuilder.DropColumn(
                name: "CoordinatorUserId",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "courses");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "courses");

            migrationBuilder.RenameColumn(
                name: "CurricularUnitId",
                table: "class_groups",
                newName: "AcademicYearId");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClassroomId",
                table: "class_schedules",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "class_groups",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "course_offerings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    AcademicYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    CoordinatorUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_offerings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_course_offerings_academic_years_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "academic_years",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_course_offerings_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "curricular_unit_offerings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CurricularUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    AcademicYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResponsibleTeacherId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ResponsibleTeacherEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Semester = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_curricular_unit_offerings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_curricular_unit_offerings_academic_years_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "academic_years",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_curricular_unit_offerings_curricular_units_CurricularUnitId",
                        column: x => x.CurricularUnitId,
                        principalTable: "curricular_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_class_groups_AcademicYearId",
                table: "class_groups",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_class_groups_CourseId_AcademicYearId_Year_Name",
                table: "class_groups",
                columns: new[] { "CourseId", "AcademicYearId", "Year", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_course_offerings_AcademicYearId",
                table: "course_offerings",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_course_offerings_CourseId_AcademicYearId",
                table: "course_offerings",
                columns: new[] { "CourseId", "AcademicYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_curricular_unit_offerings_AcademicYearId",
                table: "curricular_unit_offerings",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_curricular_unit_offerings_CurricularUnitId_AcademicYearId",
                table: "curricular_unit_offerings",
                columns: new[] { "CurricularUnitId", "AcademicYearId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_class_groups_academic_years_AcademicYearId",
                table: "class_groups",
                column: "AcademicYearId",
                principalTable: "academic_years",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_class_schedules_classrooms_ClassroomId",
                table: "class_schedules",
                column: "ClassroomId",
                principalTable: "classrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_compensation_requests_class_groups_ClassGroupId",
                table: "compensation_requests",
                column: "ClassGroupId",
                principalTable: "class_groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_compensation_requests_class_schedules_OriginalClassSchedule~",
                table: "compensation_requests",
                column: "OriginalClassScheduleId",
                principalTable: "class_schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_class_groups_academic_years_AcademicYearId",
                table: "class_groups");

            migrationBuilder.DropForeignKey(
                name: "FK_class_schedules_classrooms_ClassroomId",
                table: "class_schedules");

            migrationBuilder.DropForeignKey(
                name: "FK_compensation_requests_class_groups_ClassGroupId",
                table: "compensation_requests");

            migrationBuilder.DropForeignKey(
                name: "FK_compensation_requests_class_schedules_OriginalClassSchedule~",
                table: "compensation_requests");

            migrationBuilder.DropTable(
                name: "course_offerings");

            migrationBuilder.DropTable(
                name: "curricular_unit_offerings");

            migrationBuilder.DropIndex(
                name: "IX_class_groups_AcademicYearId",
                table: "class_groups");

            migrationBuilder.DropIndex(
                name: "IX_class_groups_CourseId_AcademicYearId_Year_Name",
                table: "class_groups");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "class_groups");

            migrationBuilder.RenameColumn(
                name: "AcademicYearId",
                table: "class_groups",
                newName: "CurricularUnitId");

            migrationBuilder.AddColumn<string>(
                name: "ResponsibleTeacherEmail",
                table: "curricular_units",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResponsibleTeacherId",
                table: "curricular_units",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CoordinatorUserId",
                table: "courses",
                type: "character varying(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "courses",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "courses",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<Guid>(
                name: "ClassroomId",
                table: "class_schedules",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_class_groups_CourseId",
                table: "class_groups",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_class_groups_CurricularUnitId_Name",
                table: "class_groups",
                columns: new[] { "CurricularUnitId", "Name" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_class_groups_curricular_units_CurricularUnitId",
                table: "class_groups",
                column: "CurricularUnitId",
                principalTable: "curricular_units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_class_schedules_classrooms_ClassroomId",
                table: "class_schedules",
                column: "ClassroomId",
                principalTable: "classrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_compensation_requests_class_groups_ClassGroupId",
                table: "compensation_requests",
                column: "ClassGroupId",
                principalTable: "class_groups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_compensation_requests_class_schedules_OriginalClassSchedule~",
                table: "compensation_requests",
                column: "OriginalClassScheduleId",
                principalTable: "class_schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
