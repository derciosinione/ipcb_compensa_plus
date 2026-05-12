import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Layout / Sidebar
    "app.name": "Compensa+",
    "app.subtitle": "Academic Manager",
    "menu.main": "Main Menu",
    "menu.dashboard": "Dashboard",
    "menu.requests": "Requests",
    "menu.my_requests": "My Requests",
    "menu.calendar": "Calendar",
    "menu.courses": "Courses",
    "menu.classrooms": "Classrooms",
    "menu.system": "System",
    "menu.users": "Users",
    "menu.holidays": "Holidays & Calendar",
    "menu.settings": "Settings",
    "menu.help": "Help & Support",

    // Header
    "header.academic_year": "Academic Year",
    "header.active": "Active",
    "header.notifications": "Notifications",
    "header.all": "All",
    "header.unread": "Unread",
    "header.no_notifications": "No notifications found.",
    "header.view_all": "View All Notifications",

    // User Dropdown
    "user.account": "Account",
    "user.profile": "My Profile",
    "user.preferences": "Preferences",
    "user.system_settings": "System Settings",
    "user.switch_role": "Switch Role",
    "user.sign_out": "Sign Out",
    "user.language": "Language",

    // Roles
    "role.teacher": "Teacher",
    "role.coordinator": "Coordinator",
    "role.admin": "Admin",

    // Common
    "common.close": "Close",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",

    // Dashboard
    "dashboard.total_requests": "Total Requests",
    "dashboard.pending": "Pending",
    "dashboard.compensated": "Compensated",
    "dashboard.target_met": "Target Met",
    "dashboard.quick_stat": "Quick Stat",
    "dashboard.class_coverage": "Class coverage this semester.",
    "dashboard.notifications": "Notifications",
    "dashboard.requiring_attention": "You have 2 items requiring attention.",
    "dashboard.view_all": "View All Notifications",
    "dashboard.this_week_schedule": "This Week's Schedule",
    "dashboard.no_classes": "No Classes",
    "dashboard.pending_status": "Pending",
    "dashboard.upcoming_status": "Upcoming",

    // Auth / Login
    "auth.welcome": "Welcome back to Compensa+",
    "auth.subtitle": "Sign in to your academic management account",
    "auth.sign_in": "Sign in with Magic Link",
    "auth.check_inbox": "Check your inbox",
    "auth.enter_email":
      "Enter your email address and we'll send you a login link.",
    "auth.email_sent":
      "We've sent a magic link to {email}. Click the link to sign in.",
    "auth.email_label": "Email address",
    "auth.email_placeholder": "name@university.edu",
    "auth.send_link": "Send Magic Link",
    "auth.sending": "Sending link...",
    "auth.cant_find": "Can't find it? Check your spam folder or",
    "auth.try_another": "try another email",
    "auth.redirecting": "Redirecting you to dashboard...",
    "auth.no_account": "Don't have an account?",
    "auth.sign_up": "Sign up",
    "auth.error_email": "Please enter your email address",
    "auth.success_magic_link": "Magic link sent to your email!",

    // Courses
    "courses.title": "My Courses",
    "courses.subtitle_admin": "Manage all courses and curricula in the system.",
    "courses.subtitle_coordinator":
      "Manage the courses and curricula under your responsibility.",
    "courses.subtitle_teacher":
      "Access the curricular units and classes you are teaching.",
    "courses.new_course": "New Course",
    "courses.search_placeholder": "Search by name or abbreviation...",
    "courses.years": "Years",
    "courses.open": "Open Course",
    "courses.add_new": "Add New Course",
    "courses.create_program": "Create a new degree program",
    "courses.no_assigned": "No courses assigned",
    "courses.no_assigned_desc":
      "You don't have any courses assigned to your profile yet. Please contact the administrator.",

    // Actions
    "actions.view_details": "View Details",
    "actions.edit_settings": "Edit Settings",
    "actions.archive": "Archive",
    "actions.actions": "Actions",
    "actions.edit_details": "Edit Details",
    "actions.assign_units": "Assign Units",
    "actions.deactivate": "Deactivate",
    "actions.filter": "Filter",
    "actions.add_user": "Add User",

    // Users
    "users.title": "Users Directory",
    "users.subtitle": "Manage platform users, roles, and permissions.",
    "users.search": "Search users...",
    "users.name": "Name",
    "users.email": "Email",
    "users.role": "Role",

    // Calendar
    "calendar.month": "Month",
    "calendar.week": "Week",
    "calendar.day": "Day",
    "calendar.mode_requests": "Requests",
    "calendar.mode_timetables": "Timetables",
    "calendar.mode_occupancy": "Occupancy",
    "calendar.filters": "Filters",
    "calendar.no_events": "No events found",
    "calendar.new_request": "New Request",
    "calendar.manage_requests": "Managing compensation requests.",
    "calendar.view_timetable": "Viewing class timetables.",
    "calendar.check_occupancy": "Checking room occupancy.",

    // Teacher View / My Requests
    "requests.title": "My Requests",
    "requests.subtitle": "Manage and track your substitute class applications.",
    "requests.new_request": "New Request",
    "requests.search_placeholder": "Search by course or unit...",
    "requests.board_view": "Board",
    "requests.list_view": "List",
    "requests.filter_course": "Filter Course",
    "requests.filter_status": "Filter Status",
    "requests.sort_date": "Sort by Date",
    "requests.history": "History",
    "requests.current": "Active Requests",
    "requests.past": "Past",
    "requests.drop_here": "Drop here to mark as {status}",
    "requests.no_requests": "No {status} requests",
    "requests.cancel_success": "Request cancelled successfully",
    "requests.status_update": "Request moved to {status}",
    "requests.pending": "Pending",
    "requests.approved": "Approved",
    "requests.rejected": "Rejected",
    "requests.reason": "Reason",
    "requests.conflict_alert": "Room {room} is occupied.",
    "requests.soon_alert": "Scheduled date is approaching.",
    "requests.view_details": "View Details",
    "requests.edit_request": "Edit Request",
    "requests.cancel_request": "Cancel Request",
    "requests.all_courses": "All Courses",
    "requests.all_requests": "All Requests",
    "requests.oldest_first": "Oldest First",
    "requests.newest_first": "Newest First",

    // Request Details
    "details.back_to_requests": "Back to Requests",
    "details.reject": "Reject",
    "details.approve": "Approve",
    "details.report_issue": "Report Issue",
    "details.download_pdf": "Download PDF",
    "details.date_approaching": "Date Approaching",
    "details.date_approaching_desc":
      "The requested date ({date}) is very close. Please review this request urgently.",
    "details.rejection_reason": "Rejection Reason",
    "details.submitted_by": "Submitted By",
    "details.original_schedule": "Original Schedule",
    "details.proposed_schedule": "Proposed Schedule",
    "details.room_conflict": "Room Conflict Detected",
    "details.room_conflict_desc":
      "Room {room} is already booked for another class at this time. Please review the schedule or discuss with the coordinator.",
    "details.targeted_groups": "Targeted Groups",
    "details.justification": "Justification",
    "details.discussion": "Discussion",
    "details.chat_desc": "Chat with {role} about this request.",
    "details.no_comments": "No comments yet.",
    "details.type_message": "Type your message...",

    // Request Form
    "form.edit_title": "Edit Request",
    "form.new_title": "New Class Request",
    "form.edit_desc": "Modify the details of your request below.",
    "form.new_desc": "Add one or multiple compensation requests.",
    "form.pending_badge": "{count} Pending",
    "form.ready_submit": "Ready to Submit ({count})",
    "form.request_details": "Request Details",
    "form.add_request": "Add Request",
    "form.clear_form": "Clear Form",
    "form.course_unit": "Course & Unit",
    "form.select_course": "Course",
    "form.select_unit": "Unit / Subject",
    "form.groups": "Groups / Classes",
    "form.select_groups": "Select groups...",
    "form.component": "Component",
    "form.select_type": "Type",
    "form.reason_placeholder": "Brief reason...",
    "form.original": "Original",
    "form.new_schedule": "New Schedule",
    "form.room": "Room",
    "form.new_room": "New Room",
    "form.add_queue": "Add to Request Queue",
    "form.submit_all": "Submit {count} Requests",
    "form.submit_one": "Update Request",
    "form.conflict_detected": "Conflict detected: '{room}' is occupied.",
    "form.fill_required":
      "Please fill in all required fields (Course, Unit, Groups, Dates)",
    "form.added_queue": "Request added to queue",
    "form.updated_success": "Request updated successfully",
    "form.no_submit": "No requests to submit",
    "form.submitted_success": "Submitted {count} requests successfully",

    // Create Request Sheet (Calendar)
    "sheet.new_compensation": "New Compensation Request",
    "sheet.description":
      "Submit a request to reschedule a class or book an extra session.",
    "sheet.unit_course": "Unit / Course",
    "sheet.select_unit": "Select unit",
    "sheet.date_time": "Date & Time",
    "sheet.proposed_room": "Proposed Room",
    "sheet.select_room": "Select a room",
    "sheet.checking_availability": "Checking availability for {date}...",
    "sheet.create_request": "Create Request",
    "sheet.avail": "Avail",
    "sheet.busy": "Busy",

    // Add Course Modal
    "modal.add_course_title": "Add New Course",
    "modal.add_course_desc":
      "Create a new degree program to manage in the system.",
    "modal.course_name": "Course Name",
    "modal.course_name_placeholder": "e.g. Computer Science Engineering",
    "modal.abbr": "Abbr.",
    "modal.degree_type": "Degree Type",
    "modal.select_type": "Select type",
    "modal.duration": "Duration (Years)",
    "modal.total_ects": "Total ECTs",
    "modal.description": "Description",
    "modal.desc_placeholder": "Brief description of the course goals...",
    "modal.create_course": "Create Course",
    "modal.success_course": "Course created successfully",

    // Coordinator View
    "coordinator.title": "Requests Management",
    "coordinator.subtitle": "{role} and track compensation requests.",
    "coordinator.monitor": "Monitor",
    "coordinator.manage": "Manage",
    "coordinator.search_placeholder": "Search requests...",
    "coordinator.active_requests": "Active Requests",
    "coordinator.actions": "Actions",
    "coordinator.approve_request": "Approve Request",
    "coordinator.reject_request": "Reject Request",
    "coordinator.admin_error": "Administrators cannot change request status.",
    "coordinator.status_success": "Request {status} successfully.",
    "coordinator.approved": "approved",
    "coordinator.rejected": "rejected",

    // Rejection Dialog
    "reject.title": "Reject Request",
    "reject.desc":
      "Please provide a reason for rejecting this request. This will be visible to the teacher.",
    "reject.reason_label": "Rejection Reason",
    "reject.placeholder": "E.g., Room conflict, Policy violation...",
    "reject.confirm": "Confirm Rejection",

    // Global Search
    "search.placeholder": "Search courses, requests, rooms...",
    "search.no_results": "No results found matching {query}.",
    "search.shortcuts": "Quick Shortcuts",
    "search.platform": "Search across the entire platform",
    "search.close": "to close",

    // Chart
    "chart.title": "Compensation Analysis",
    "chart.description":
      "Monthly breakdown of compensation requests and approvals.",
    "chart.select_year": "Select Year",
    "chart.total": "Total Requests",
    "chart.approved": "Approved",
    "chart.rejected": "Rejected",
    "chart.loading": "Loading Chart...",
    "chart.total_label": "Total:",
    "chart.approved_label": "Approved:",
    "chart.rejected_label": "Rejected:",
    // Month abbreviations
    "month.Jan": "Jan",
    "month.Feb": "Feb",
    "month.Mar": "Mar",
    "month.Apr": "Apr",
    "month.May": "May",
    "month.Jun": "Jun",
    "month.Jul": "Jul",
    "month.Aug": "Aug",
    "month.Sep": "Sep",
    "month.Oct": "Oct",
    "month.Nov": "Nov",
    "month.Dec": "Dec",
  },
  pt: {
    // Layout / Sidebar
    "app.name": "Compensa+",
    "app.subtitle": "Gestão Acadêmica",
    "menu.main": "Menu Principal",
    "menu.dashboard": "Painel",
    "menu.requests": "Solicitações",
    "menu.my_requests": "Minhas Solicitações",
    "menu.calendar": "Calendário",
    "menu.courses": "Disciplinas",
    "menu.classrooms": "Salas",
    "menu.system": "Sistema",
    "menu.users": "Usuários",
    "menu.holidays": "Feriados e Calendário",
    "menu.settings": "Configurações",
    "menu.help": "Ajuda e Suporte",

    // Header
    "header.academic_year": "Ano Letivo",
    "header.active": "Ativo",
    "header.notifications": "Notificações",
    "header.all": "Todas",
    "header.unread": "Não lidas",
    "header.no_notifications": "Nenhuma notificação encontrada.",
    "header.view_all": "Ver todas as notificações",

    // User Dropdown
    "user.account": "Conta",
    "user.profile": "Meu Perfil",
    "user.preferences": "Preferências",
    "user.system_settings": "Configurações do Sistema",
    "user.switch_role": "Trocar Perfil",
    "user.sign_out": "Sair",
    "user.language": "Idioma",

    // Roles
    "role.teacher": "Professor",
    "role.coordinator": "Coordenador",
    "role.admin": "Administrador",

    // Common
    "common.close": "Fechar",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.loading": "Carregando...",

    // Dashboard
    "dashboard.total_requests": "Total de Solicitações",
    "dashboard.pending": "Pendentes",
    "dashboard.compensated": "Compensadas",
    "dashboard.target_met": "Meta Atingida",
    "dashboard.quick_stat": "Estatística Rápida",
    "dashboard.class_coverage": "Cobertura de aulas este semestre.",
    "dashboard.notifications": "Notificações",
    "dashboard.requiring_attention": "Você tem 2 itens requerendo atenção.",
    "dashboard.view_all": "Ver todas as notificações",
    "dashboard.this_week_schedule": "Agenda da Semana",
    "dashboard.no_classes": "Sem Aulas",
    "dashboard.pending_status": "Pendente",
    "dashboard.upcoming_status": "Próxima",

    // Auth / Login
    "auth.welcome": "Bem-vindo de volta ao Compensa+",
    "auth.subtitle": "Entre na sua conta de gestão acadêmica",
    "auth.sign_in": "Entrar com Link Mágico",
    "auth.check_inbox": "Verifique sua caixa de entrada",
    "auth.enter_email": "Digite seu email e enviaremos um link de login.",
    "auth.email_sent":
      "Enviamos um link mágico para {email}. Clique no link para entrar.",
    "auth.email_label": "Endereço de email",
    "auth.email_placeholder": "nome@universidade.edu",
    "auth.send_link": "Enviar Link Mágico",
    "auth.sending": "Enviando link...",
    "auth.cant_find": "Não encontrou? Verifique sua caixa de spam ou",
    "auth.try_another": "tente outro email",
    "auth.redirecting": "Redirecionando para o painel...",
    "auth.no_account": "Não tem uma conta?",
    "auth.sign_up": "Cadastre-se",
    "auth.error_email": "Por favor, digite seu endereço de email",
    "auth.success_magic_link": "Link mágico enviado para seu email!",

    // Courses
    "courses.title": "Minhas Disciplinas",
    "courses.subtitle_admin":
      "Gerencie todas as disciplinas e currículos do sistema.",
    "courses.subtitle_coordinator":
      "Gerencie as disciplinas e currículos sob sua responsabilidade.",
    "courses.subtitle_teacher":
      "Acesse as unidades curriculares e turmas que você está lecionando.",
    "courses.new_course": "Nova Disciplina",
    "courses.search_placeholder": "Buscar por nome ou sigla...",
    "courses.years": "Anos",
    "courses.open": "Abrir Disciplina",
    "courses.add_new": "Adicionar Nova Disciplina",
    "courses.create_program": "Criar um novo programa de graduação",
    "courses.no_assigned": "Nenhuma disciplina atribuída",
    "courses.no_assigned_desc":
      "Você não tem disciplinas atribuídas ao seu perfil. Entre em contato com o administrador.",

    // Actions
    "actions.view_details": "Ver Detalhes",
    "actions.edit_settings": "Configurações",
    "actions.archive": "Arquivar",
    "actions.actions": "Ações",
    "actions.edit_details": "Editar Detalhes",
    "actions.assign_units": "Atribuir Unidades",
    "actions.deactivate": "Desativar",
    "actions.filter": "Filtrar",
    "actions.add_user": "Adicionar Usuário",

    // Users
    "users.title": "Diretório de Usuários",
    "users.subtitle": "Gerencie usuários da plataforma, funções e permissões.",
    "users.search": "Buscar usuários...",
    "users.name": "Nome",
    "users.email": "Email",
    "users.role": "Função",

    // Calendar
    "calendar.month": "Mês",
    "calendar.week": "Semana",
    "calendar.day": "Dia",
    "calendar.mode_requests": "Solicitações",
    "calendar.mode_timetables": "Horários",
    "calendar.mode_occupancy": "Ocupação",
    "calendar.filters": "Filtros",
    "calendar.no_events": "Nenhum evento encontrado",
    "calendar.new_request": "Nova Solicitação",
    "calendar.manage_requests": "Gerenciando solicitações de compensação.",
    "calendar.view_timetable": "Visualizando horários de aula.",
    "calendar.check_occupancy": "Verificando ocupação das salas.",

    // Teacher View / My Requests
    "requests.title": "Minhas Solicitações",
    "requests.subtitle":
      "Gerencie e acompanhe suas solicitações de aulas substitutas.",
    "requests.new_request": "Nova Solicitação",
    "requests.search_placeholder": "Buscar por curso ou unidade...",
    "requests.board_view": "Quadro",
    "requests.list_view": "Lista",
    "requests.filter_course": "Filtrar Curso",
    "requests.filter_status": "Filtrar Status",
    "requests.sort_date": "Ordenar por Data",
    "requests.history": "Histórico",
    "requests.current": "Solicitações Ativas",
    "requests.past": "Passado",
    "requests.drop_here": "Solte aqui para marcar como {status}",
    "requests.no_requests": "Nenhuma solicitação {status}",
    "requests.cancel_success": "Solicitação cancelada com sucesso",
    "requests.status_update": "Solicitação movida para {status}",
    "requests.pending": "Pendente",
    "requests.approved": "Aprovado",
    "requests.rejected": "Rejeitado",
    "requests.reason": "Motivo",
    "requests.conflict_alert": "Sala {room} está ocupada.",
    "requests.soon_alert": "A data agendada está próxima.",
    "requests.view_details": "Ver Detalhes",
    "requests.edit_request": "Editar Solicitação",
    "requests.cancel_request": "Cancelar Solicitação",
    "requests.all_courses": "Todos os Cursos",
    "requests.all_requests": "Todas as Solicitações",
    "requests.oldest_first": "Mais Antigos",
    "requests.newest_first": "Mais Recentes",

    // Request Details
    "details.back_to_requests": "Voltar para Solicitações",
    "details.reject": "Rejeitar",
    "details.approve": "Aprovar",
    "details.report_issue": "Reportar Problema",
    "details.download_pdf": "Baixar PDF",
    "details.date_approaching": "Data Próxima",
    "details.date_approaching_desc":
      "A data solicitada ({date}) está muito próxima. Por favor, revise esta solicitação com urgência.",
    "details.rejection_reason": "Motivo da Rejeição",
    "details.submitted_by": "Enviado por",
    "details.original_schedule": "Horário Original",
    "details.proposed_schedule": "Horário Proposto",
    "details.room_conflict": "Conflito de Sala Detectado",
    "details.room_conflict_desc":
      "A sala {room} já está reservada para outra aula neste horário. Por favor, revise o horário ou discuta com o coordenador.",
    "details.targeted_groups": "Grupos Alvo",
    "details.justification": "Justificativa",
    "details.discussion": "Discussão",
    "details.chat_desc": "Converse com o {role} sobre esta solicitação.",
    "details.no_comments": "Nenhum comentário ainda.",
    "details.type_message": "Digite sua mensagem...",

    // Request Form
    "form.edit_title": "Editar Solicitação",
    "form.new_title": "Nova Solicitação de Aula",
    "form.edit_desc": "Modifique os detalhes da sua solicitação abaixo.",
    "form.new_desc": "Adicione uma ou várias solicitações de compensação.",
    "form.pending_badge": "{count} Pendentes",
    "form.ready_submit": "Pronto para Enviar ({count})",
    "form.request_details": "Detalhes da Solicitação",
    "form.add_request": "Adicionar Solicitação",
    "form.clear_form": "Limpar Formulário",
    "form.course_unit": "Curso e Unidade",
    "form.select_course": "Curso",
    "form.select_unit": "Unidade / Disciplina",
    "form.groups": "Grupos / Turmas",
    "form.select_groups": "Selecionar grupos...",
    "form.component": "Componente",
    "form.select_type": "Tipo",
    "form.reason_placeholder": "Motivo breve...",
    "form.original": "Original",
    "form.new_schedule": "Novo Horário",
    "form.room": "Sala",
    "form.new_room": "Nova Sala",
    "form.add_queue": "Adicionar à Fila",
    "form.submit_all": "Enviar {count} Solicitações",
    "form.submit_one": "Atualizar Solicitação",
    "form.conflict_detected": "Conflito detectado: '{room}' está ocupada.",
    "form.fill_required":
      "Por favor, preencha todos os campos obrigatórios (Curso, Unidade, Grupos, Datas)",
    "form.added_queue": "Solicitação adicionada à fila",
    "form.updated_success": "Solicitação atualizada com sucesso",
    "form.no_submit": "Nenhuma solicitação para enviar",
    "form.submitted_success": "{count} solicitações enviadas com sucesso",

    // Create Request Sheet (Calendar)
    "sheet.new_compensation": "Nova Solicitação de Compensação",
    "sheet.description":
      "Envie uma solicitação para reagendar uma aula ou reservar uma sessão extra.",
    "sheet.unit_course": "Unidade / Curso",
    "sheet.select_unit": "Selecionar unidade",
    "sheet.date_time": "Data e Hora",
    "sheet.proposed_room": "Sala Proposta",
    "sheet.select_room": "Selecionar uma sala",
    "sheet.checking_availability": "Verificando disponibilidade para {date}...",
    "sheet.create_request": "Criar Solicitação",
    "sheet.avail": "Disp",
    "sheet.busy": "Ocupado",

    // Add Course Modal
    "modal.add_course_title": "Adicionar Nova Disciplina",
    "modal.add_course_desc":
      "Crie um novo programa de graduação para gerenciar no sistema.",
    "modal.course_name": "Nome do Curso",
    "modal.course_name_placeholder": "ex: Engenharia Informática",
    "modal.abbr": "Abrev.",
    "modal.degree_type": "Tipo de Grau",
    "modal.select_type": "Selecionar tipo",
    "modal.duration": "Duração (Anos)",
    "modal.total_ects": "Total ECTs",
    "modal.description": "Descrição",
    "modal.desc_placeholder": "Breve descrição dos objetivos do curso...",
    "modal.create_course": "Criar Curso",
    "modal.success_course": "Curso criado com sucesso",

    // Coordinator View
    "coordinator.title": "Gestão de Solicitações",
    "coordinator.subtitle": "{role} e acompanhe solicitações de compensação.",
    "coordinator.monitor": "Monitorar",
    "coordinator.manage": "Gerenciar",
    "coordinator.search_placeholder": "Buscar solicitações...",
    "coordinator.active_requests": "Solicitações Ativas",
    "coordinator.actions": "Ações",
    "coordinator.approve_request": "Aprovar Solicitação",
    "coordinator.reject_request": "Rejeitar Solicitação",
    "coordinator.admin_error":
      "Administradores não podem alterar o status da solicitação.",
    "coordinator.status_success": "Solicitação {status} com sucesso.",
    "coordinator.approved": "aprovada",
    "coordinator.rejected": "rejeitada",

    // Rejection Dialog
    "reject.title": "Rejeitar Solicitação",
    "reject.desc":
      "Por favor, forneça um motivo para rejeitar esta solicitação. Isso será visível para o professor.",
    "reject.reason_label": "Motivo da Rejeição",
    "reject.placeholder": "Ex: Conflito de sala, Violação de política...",
    "reject.confirm": "Confirmar Rejeição",

    // Global Search
    "search.placeholder": "Buscar cursos, solicitações, salas...",
    "search.no_results": "Nenhum resultado encontrado para {query}.",
    "search.shortcuts": "Atalhos Rápidos",
    "search.platform": "Buscar em toda a plataforma",
    "search.close": "fechar",

    // Chart
    "chart.title": "Análise de Compensação",
    "chart.description":
      "Detalhamento mensal das solicitações e aprovações de compensação.",
    "chart.select_year": "Selecionar Ano",
    "chart.total": "Total de Solicitações",
    "chart.approved": "Aprovadas",
    "chart.rejected": "Rejeitadas",
    "chart.loading": "Carregando Gráfico...",
    "chart.total_label": "Total:",
    "chart.approved_label": "Aprovadas:",
    "chart.rejected_label": "Rejeitadas:",
    // Month abbreviations
    "month.Jan": "Jan",
    "month.Feb": "Fev",
    "month.Mar": "Mar",
    "month.Apr": "Abr",
    "month.May": "Mai",
    "month.Jun": "Jun",
    "month.Jul": "Jul",
    "month.Aug": "Ago",
    "month.Sep": "Set",
    "month.Oct": "Out",
    "month.Nov": "Nov",
    "month.Dec": "Dez",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  // Simple translation function that handles nested keys if we wanted to expand,
  // but for now simple string lookup
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
