// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table users {
  id integer [primary key]
  name varchar
  createdAt timestamp 
}


Table roles {
  id integer [primary key]
  name varchar
  createdAt timestamp 
}

Table userRoles {
  id integer [primary key]
  userId int [ref: > users.id, not null]
  roleId int [ref: > roles.id, not null]
  createdAt timestamp 
}

Table teacher {
  id integer [primary key]
  userId int [ref: > users.id]
  createdAt timestamp 
}

Table courseCoordinator {
  id integer [primary key]
  userId int [ref: > users.id]
  courseId int [ref: > course.id, not null]
  createdAt timestamp 
}

Table AcademicYear {
  id integer [primary key]
  description varchar [not null]
  createdAt timestamp 
}

Table course {
  id integer [primary key]
  name varchar
  sigla varchar
  createdAt timestamp 
}

Table courseYear {
  id integer [primary key]  
  number integer
  academicYearId integer [ref: > AcademicYear.id, not null]
  courseId integer [ref: > course.id, not null]
  createdAt timestamp 
}

Table semester {
  id integer [primary key]
  description varchar
  createdAt timestamp 
}

Table curricularUnit {
  id integer [primary key] 
  name varchar
  sigla varchar
  Credits double
  studyHours int
  responsibleTeacherId int [ref: > teacher.id, not null]
  courseYearId integer [ref: > courseYear.id, not null]
  semesterId integer [ref: > semester.id, not null]
  createdAt timestamp 
}

Table UnitComponent {
  id integer [primary key] 
  name varchar
  sigla varchar
  createdAt timestamp 
}


Table curricularUnitComponent {
  id integer [primary key]
  curricularUnitId integer [ref: > curricularUnit.id, not null]
  unitComponentId integer [ref: > UnitComponent.id, not null]
  evaluationPercentage double 
}


Table curricularUnitComponentTeacher {
  curricularUnitComponentId integer [ref: > curricularUnitComponent.id, not null]
  teacherId integer [ref: > teacher.id, not null]
  academicYearId integer [ref: > AcademicYear.id, not null] 
}


