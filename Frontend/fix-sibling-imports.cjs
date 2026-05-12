const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const moveMap = {
  // Core / Providers
  'LanguageContext': 'providers/LanguageContext.tsx',
  'Layout': 'layouts/Layout.tsx',
  'FloatingAIChat': 'layouts/FloatingAIChat.tsx',
  'GlobalSearch': 'layouts/GlobalSearch.tsx',
  'AIChatInterface': 'layouts/AIChatInterface.tsx',

  // Domain
  'RequestForm': 'components/domain/requests/RequestForm.tsx',
  'RequestDetails': 'components/domain/requests/RequestDetails.tsx',
  'RequestDetailsPage': 'components/domain/requests/RequestDetailsPage.tsx',
  'RejectionDialog': 'components/domain/requests/RejectionDialog.tsx',
  'CreateRequestSheet': 'components/domain/requests/CreateRequestSheet.tsx',
  'ClassDetailsView': 'components/domain/requests/ClassDetailsView.tsx',

  // Pages
  'CompensationChart': 'pages/Dashboard/components/CompensationChart.tsx',
  'AIDocumentConverter': 'pages/AiConverter/components/AIDocumentConverter.tsx',
  'AddUserModal': 'pages/Users/components/AddUserModal.tsx',
  'TeacherUnitsModal': 'pages/Users/components/TeacherUnitsModal.tsx',
  'BulkImportUsersSheet': 'pages/Users/components/BulkImportUsersSheet.tsx',
  'CourseDetailsPage': 'pages/Courses/components/CourseDetailsPage.tsx',
  'AddCourseModal': 'pages/Courses/components/AddCourseModal.tsx',
  'AddCurricularUnitModal': 'pages/Courses/components/AddCurricularUnitModal.tsx',
  'AssignTeacherToCourseModal': 'pages/Courses/components/AssignTeacherToCourseModal.tsx',
  'AssignTeachersModal': 'pages/Courses/components/AssignTeachersModal.tsx',
  'BulkImportSchedulesSheet': 'pages/Courses/components/BulkImportSchedulesSheet.tsx',
  'AddClassModal': 'pages/Courses/components/AddClassModal.tsx',
  'AddScheduleModal': 'pages/Courses/components/AddScheduleModal.tsx',
  'UserProfile': 'pages/Profile/components/UserProfile.tsx',
  'FullProjectStoryboard': 'pages/FullStoryboard/components/FullProjectStoryboard.tsx',
  'DesignSystem': 'pages/FullStoryboard/components/DesignSystem.tsx',
  'HighFidelityMocks': 'pages/FullStoryboard/components/HighFidelityMocks.tsx',
  'ProjectStoryboard': 'pages/ProjectStoryboard/components/ProjectStoryboard.tsx'
};

function getRelativePath(fromPath, toPath) {
  let rel = path.relative(path.dirname(fromPath), toPath);
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel.replace(/\\/g, '/');
}

for (const [baseName, newRelPath] of Object.entries(moveMap)) {
  const fullPath = path.join(srcDir, 'app', newRelPath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // Check for imports of other moved files, like `from './data'`
    for (const [targetName, targetRelPath] of Object.entries(moveMap)) {
      // It used to be `./targetName`
      const regex = new RegExp(`from\\s+['"]\\.\\/${targetName}['"]`, 'g');
      content = content.replace(regex, (match) => {
        const targetAbsPath = path.join(srcDir, 'app', targetRelPath.replace(/\.tsx?$/, ''));
        const fixedRelPath = getRelativePath(fullPath, targetAbsPath);
        changed = true;
        return `from '${fixedRelPath}'`;
      });
    }

    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Fixed sibling imports in: ${newRelPath}`);
    }
  }
}

console.log('Done fixing sibling imports!');
