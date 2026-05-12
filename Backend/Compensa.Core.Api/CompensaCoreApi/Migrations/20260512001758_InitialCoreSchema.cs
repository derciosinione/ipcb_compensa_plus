using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CompensaCoreApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCoreSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "academic_years",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartsOn = table.Column<DateOnly>(type: "date", nullable: false),
                    EndsOn = table.Column<DateOnly>(type: "date", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_academic_years", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "classrooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Capacity = table.Column<int>(type: "integer", nullable: false),
                    Features = table.Column<string[]>(type: "text[]", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_classrooms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Abbreviation = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    DurationYears = table.Column<int>(type: "integer", nullable: false),
                    TotalCredits = table.Column<int>(type: "integer", nullable: false),
                    CoordinatorUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_courses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "course_teacher_assignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsCoordinator = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_teacher_assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_course_teacher_assignments_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "curricular_units",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Semester = table.Column<int>(type: "integer", nullable: false),
                    Ects = table.Column<int>(type: "integer", nullable: false),
                    ResponsibleTeacherId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ResponsibleTeacherEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_curricular_units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_curricular_units_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "class_groups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurricularUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    TeacherId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_class_groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_class_groups_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_class_groups_curricular_units_CurricularUnitId",
                        column: x => x.CurricularUnitId,
                        principalTable: "curricular_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "curricular_unit_components",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurricularUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ResponsibleTeacherId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    ResponsibleTeacherEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_curricular_unit_components", x => x.Id);
                    table.ForeignKey(
                        name: "FK_curricular_unit_components_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_curricular_unit_components_curricular_units_CurricularUnitId",
                        column: x => x.CurricularUnitId,
                        principalTable: "curricular_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_unit_assignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    UserEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurricularUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsResponsible = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_unit_assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_user_unit_assignments_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_unit_assignments_curricular_units_CurricularUnitId",
                        column: x => x.CurricularUnitId,
                        principalTable: "curricular_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "class_schedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurricularUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClassGroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    AcademicYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    Semester = table.Column<int>(type: "integer", nullable: false),
                    ComponentType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    DayOfWeek = table.Column<int>(type: "integer", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    ClassroomId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_class_schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_class_schedules_academic_years_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "academic_years",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_class_schedules_class_groups_ClassGroupId",
                        column: x => x.ClassGroupId,
                        principalTable: "class_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_class_schedules_classrooms_ClassroomId",
                        column: x => x.ClassroomId,
                        principalTable: "classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_class_schedules_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_class_schedules_curricular_units_CurricularUnitId",
                        column: x => x.CurricularUnitId,
                        principalTable: "curricular_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "compensation_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TeacherUserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    TeacherName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AcademicYearId = table.Column<Guid>(type: "uuid", nullable: true),
                    Semester = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CourseId = table.Column<Guid>(type: "uuid", nullable: true),
                    CurricularUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    ClassGroupId = table.Column<Guid>(type: "uuid", nullable: true),
                    OriginalClassScheduleId = table.Column<Guid>(type: "uuid", nullable: true),
                    OriginalClassroomId = table.Column<Guid>(type: "uuid", nullable: true),
                    NewClassroomId = table.Column<Guid>(type: "uuid", nullable: true),
                    Course = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CurricularUnit = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    YearGroups = table.Column<string[]>(type: "text[]", nullable: false),
                    ComponentType = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    OriginalDate = table.Column<DateOnly>(type: "date", nullable: false),
                    OriginalStartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    OriginalEndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    OriginalRoom = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    NewDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NewStartTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    NewEndTime = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    NewRoom = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Justification = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    DecisionComment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    HasConflict = table.Column<bool>(type: "boolean", nullable: false),
                    SubmittedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compensation_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_compensation_requests_academic_years_AcademicYearId",
                        column: x => x.AcademicYearId,
                        principalTable: "academic_years",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compensation_requests_class_groups_ClassGroupId",
                        column: x => x.ClassGroupId,
                        principalTable: "class_groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compensation_requests_class_schedules_OriginalClassSchedule~",
                        column: x => x.OriginalClassScheduleId,
                        principalTable: "class_schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compensation_requests_classrooms_NewClassroomId",
                        column: x => x.NewClassroomId,
                        principalTable: "classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compensation_requests_classrooms_OriginalClassroomId",
                        column: x => x.OriginalClassroomId,
                        principalTable: "classrooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compensation_requests_courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compensation_requests_curricular_units_CurricularUnitId",
                        column: x => x.CurricularUnitId,
                        principalTable: "curricular_units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_academic_years_Name",
                table: "academic_years",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_class_groups_CourseId",
                table: "class_groups",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_class_groups_CurricularUnitId_Name",
                table: "class_groups",
                columns: new[] { "CurricularUnitId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_class_schedules_AcademicYearId",
                table: "class_schedules",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_class_schedules_AcademicYearId_Semester_ClassroomId_DayOfWe~",
                table: "class_schedules",
                columns: new[] { "AcademicYearId", "Semester", "ClassroomId", "DayOfWeek", "StartTime", "EndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_class_schedules_ClassGroupId",
                table: "class_schedules",
                column: "ClassGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_class_schedules_ClassroomId",
                table: "class_schedules",
                column: "ClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_class_schedules_CourseId",
                table: "class_schedules",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_class_schedules_CurricularUnitId",
                table: "class_schedules",
                column: "CurricularUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_classrooms_Name",
                table: "classrooms",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_AcademicYearId",
                table: "compensation_requests",
                column: "AcademicYearId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_ClassGroupId",
                table: "compensation_requests",
                column: "ClassGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_CourseId",
                table: "compensation_requests",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_CurricularUnitId",
                table: "compensation_requests",
                column: "CurricularUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_NewClassroomId",
                table: "compensation_requests",
                column: "NewClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_NewDate",
                table: "compensation_requests",
                column: "NewDate");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_OriginalClassroomId",
                table: "compensation_requests",
                column: "OriginalClassroomId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_OriginalClassScheduleId",
                table: "compensation_requests",
                column: "OriginalClassScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_Status",
                table: "compensation_requests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_compensation_requests_TeacherUserId",
                table: "compensation_requests",
                column: "TeacherUserId");

            migrationBuilder.CreateIndex(
                name: "IX_course_teacher_assignments_CourseId",
                table: "course_teacher_assignments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_course_teacher_assignments_UserId",
                table: "course_teacher_assignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_course_teacher_assignments_UserId_CourseId",
                table: "course_teacher_assignments",
                columns: new[] { "UserId", "CourseId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_courses_Abbreviation",
                table: "courses",
                column: "Abbreviation",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_curricular_unit_components_CourseId",
                table: "curricular_unit_components",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_curricular_unit_components_CurricularUnitId_Type_Name",
                table: "curricular_unit_components",
                columns: new[] { "CurricularUnitId", "Type", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_curricular_units_CourseId_Name",
                table: "curricular_units",
                columns: new[] { "CourseId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_unit_assignments_CourseId",
                table: "user_unit_assignments",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_user_unit_assignments_CurricularUnitId",
                table: "user_unit_assignments",
                column: "CurricularUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_user_unit_assignments_UserId",
                table: "user_unit_assignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_user_unit_assignments_UserId_CurricularUnitId",
                table: "user_unit_assignments",
                columns: new[] { "UserId", "CurricularUnitId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "compensation_requests");

            migrationBuilder.DropTable(
                name: "course_teacher_assignments");

            migrationBuilder.DropTable(
                name: "curricular_unit_components");

            migrationBuilder.DropTable(
                name: "user_unit_assignments");

            migrationBuilder.DropTable(
                name: "class_schedules");

            migrationBuilder.DropTable(
                name: "academic_years");

            migrationBuilder.DropTable(
                name: "class_groups");

            migrationBuilder.DropTable(
                name: "classrooms");

            migrationBuilder.DropTable(
                name: "curricular_units");

            migrationBuilder.DropTable(
                name: "courses");
        }
    }
}
