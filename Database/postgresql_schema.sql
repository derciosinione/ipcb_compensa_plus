CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE DATABASE CompensaDB;

-- Tabelas independentes
CREATE TABLE AcademicYears (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Description VARCHAR NOT NULL,
    CreatedAt TIMESTAMP
);

CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR,
    Email VARCHAR,
    Password VARCHAR,
    Phone VARCHAR,
    Address VARCHAR,
    BirthDate DATE,
    UpdatedAt TIMESTAMP,
    IsActive BOOLEAN,
    IsDeleted BOOLEAN,
    IsEmailVerified BOOLEAN,
    IsPhoneVerified BOOLEAN,
    CreatedAt TIMESTAMP
);

CREATE TABLE Roles (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR,
    CreatedAt TIMESTAMP
);

CREATE TABLE Semesters (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Description VARCHAR,
    CreatedAt TIMESTAMP
);

CREATE TABLE UnitComponents (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR,
    Sigla VARCHAR,
    CreatedAt TIMESTAMP
);

-- Dependentes
CREATE TABLE UserRoles (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId INTEGER NOT NULL,
    RoleId INTEGER NOT NULL,
    CreatedAt TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

CREATE TABLE Teachers (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId INTEGER,
    CreatedAt TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE Courses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR,
    Sigla VARCHAR,
    CreatedAt TIMESTAMP
);

CREATE TABLE CourseCoordinators (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId INTEGER NOT NULL,
    CourseId INTEGER NOT NULL,
    CreatedAt TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (CourseId) REFERENCES Courses(Id)
);

CREATE TABLE CourseYears (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Number INTEGER,
    AcademicYearId INTEGER NOT NULL,
    CourseId INTEGER NOT NULL,
    CreatedAt TIMESTAMP,
    FOREIGN KEY (AcademicYearId) REFERENCES AcademicYears(Id),
    FOREIGN KEY (CourseId) REFERENCES Courses(Id)
);

CREATE TABLE CurricularUnits (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR,
    Sigla VARCHAR,
    Credits DOUBLE PRECISION,
    StudyHours INTEGER,
    ResponsibleTeacherId INTEGER NOT NULL,
    CourseYearId INTEGER NOT NULL,
    SemesterId INTEGER NOT NULL,
    CreatedAt TIMESTAMP,
    FOREIGN KEY (ResponsibleTeacherId) REFERENCES Teachers(Id),
    FOREIGN KEY (CourseYearId) REFERENCES CourseYears(Id),
    FOREIGN KEY (SemesterId) REFERENCES Semesters(Id)
);

CREATE TABLE CurricularUnitComponents (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    CurricularUnitId INTEGER NOT NULL,
    UnitComponentId INTEGER NOT NULL,
    EvaluationPercentage DOUBLE PRECISION,
    FOREIGN KEY (CurricularUnitId) REFERENCES CurricularUnits(Id),
    FOREIGN KEY (UnitComponentId) REFERENCES UnitComponents(Id)
);

CREATE TABLE CurricularUnitComponentTeachers (
    CurricularUnitComponentId INTEGER NOT NULL,
    TeacherId INTEGER NOT NULL,
    AcademicYearId INTEGER NOT NULL,
    PRIMARY KEY (CurricularUnitComponentId, TeacherId, AcademicYearId),
    FOREIGN KEY (CurricularUnitComponentId) REFERENCES CurricularUnitComponents(Id),
    FOREIGN KEY (TeacherId) REFERENCES Teachers(Id),
    FOREIGN KEY (AcademicYearId) REFERENCES AcademicYears(Id)
);

CREATE TABLE ClassGroups (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL,
    CourseId INTEGER NOT NULL,
    AcademicYearId INTEGER NOT NULL,
    CourseYearId INTEGER NOT NULL,
    CreatedAt TIMESTAMP,
    FOREIGN KEY (CourseId) REFERENCES Courses(Id),
    FOREIGN KEY (AcademicYearId) REFERENCES AcademicYears(Id),
    FOREIGN KEY (CourseYearId) REFERENCES CourseYears(Id)
);

CREATE TABLE RoomTypes (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Departments (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Rooms (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL,
    Capacity INTEGER,
    Location VARCHAR,
    RoomTypeId INTEGER NOT NULL,
    DepartmentId INTEGER,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (RoomTypeId) REFERENCES RoomTypes(Id),
    FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);

CREATE TABLE WeekDays (
    Id SMALLINT PRIMARY KEY,
    Name VARCHAR NOT NULL
);

CREATE TABLE Schedules (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ClassGroupId INTEGER NOT NULL,
    CurricularUnitComponentId INTEGER NOT NULL,
    SemesterId INTEGER NOT NULL,
    DayOfWeek SMALLINT NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    RoomId INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (ClassGroupId) REFERENCES ClassGroups(Id),
    FOREIGN KEY (CurricularUnitComponentId) REFERENCES CurricularUnitComponents(Id),
    FOREIGN KEY (SemesterId) REFERENCES Semesters(Id),
    FOREIGN KEY (RoomId) REFERENCES Rooms(Id),
    FOREIGN KEY (DayOfWeek) REFERENCES WeekDays(Id)
);

CREATE TABLE HolidayTypes (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL,
    Description VARCHAR
);

CREATE TABLE Holidays (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL,
    Date DATE NOT NULL,
    HolidayTypeId INTEGER NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (HolidayTypeId) REFERENCES HolidayTypes(Id)
);

CREATE TABLE Activities (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Title VARCHAR NOT NULL,
    Description TEXT,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    StartTime TIME,
    EndTime TIME,
    Location VARCHAR,
    RoomId INTEGER DEFAULT NULL,
    CreatedByUserId INTEGER NOT NULL,
    UpdatedByUserId INTEGER,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (RoomId) REFERENCES Rooms(Id),
    FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id),
    FOREIGN KEY (UpdatedByUserId) REFERENCES Users(Id)
);

CREATE TABLE CompensationStatuses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR NOT NULL UNIQUE,
    Description VARCHAR NOT NULL
);

CREATE TABLE CompensationRequests (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TeacherId INTEGER NOT NULL,
    CurricularUnitComponentId INTEGER NOT NULL,
    OriginalDate DATE NOT NULL,
    OriginalStartTime TIME NOT NULL,
    OriginalEndTime TIME NOT NULL,
    NewDate DATE NOT NULL,
    NewStartTime TIME NOT NULL,
    NewEndTime TIME NOT NULL,
    RoomId INTEGER,
    StatusId INTEGER NOT NULL DEFAULT 1,
    Justification TEXT,
    AdminResponse TEXT,
    CreatedAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (TeacherId) REFERENCES Teachers(Id),
    FOREIGN KEY (CurricularUnitComponentId) REFERENCES CurricularUnitComponents(Id),
    FOREIGN KEY (RoomId) REFERENCES Rooms(Id),
    FOREIGN KEY (StatusId) REFERENCES CompensationStatuses(Id)
);

CREATE TABLE CompensationRequestClassGroups (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    CompensationRequestId INTEGER NOT NULL,
    ClassGroupId INTEGER NOT NULL,
    FOREIGN KEY (CompensationRequestId) REFERENCES CompensationRequests(Id),
    FOREIGN KEY (ClassGroupId) REFERENCES ClassGroups(Id)
);
