import React from 'react';
import { ScrollArea, ScrollBar } from '../../../components/ui/scroll-area';
import { ArrowRight, User, Bell, Search, Filter, Menu, CheckSquare, Calendar as CalendarIcon, PieChart, Plus, X, Upload, ChevronDown, LogOut, Settings, MessageSquare, Printer, Download, ToggleLeft, ToggleRight, FileText } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

// --- Balsamiq-Style "Sketch" Components ---
// Goal: Hand-drawn, rough, thick lines, distinct "low-fi" aesthetic

const SketchText = ({ children, className, variant = 'body', align = 'left' }: { children: React.ReactNode, className?: string, variant?: 'h1' | 'h2' | 'label' | 'body' | 'small', align?: 'left' | 'center' | 'right' }) => {
    const styles = {
        h1: "text-3xl font-bold uppercase tracking-tight",
        h2: "text-xl font-bold",
        label: "text-xs font-bold uppercase tracking-wider mb-1 block",
        body: "text-sm leading-relaxed",
        small: "text-xs text-slate-500"
    };
    return (
        <div className={cn("font-mono text-slate-900", styles[variant], `text-${align}`, className)}>
            {children}
        </div>
    );
};

const SketchBox = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
    <div className={cn("border-2 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]", className)}>
        {children}
    </div>
);

const SketchButton = ({ children, variant = 'primary', className, icon: Icon }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'ghost', className?: string, icon?: any }) => {
    const base = "h-10 px-4 flex items-center justify-center gap-2 font-mono font-bold text-sm border-2 border-slate-900 transition-transform active:translate-y-0.5 active:shadow-none";
    const styles = {
        primary: "bg-slate-900 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5",
        secondary: "bg-white text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5",
        ghost: "border-transparent shadow-none hover:bg-slate-100"
    };
    return (
        <button className={cn(base, styles[variant], className)}>
            {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
            {children}
        </button>
    );
};

const SketchInput = ({ label, placeholder, value, icon: Icon }: { label?: string, placeholder?: string, value?: string, icon?: any }) => (
    <div className="w-full">
        {label && <SketchText variant="label">{label}</SketchText>}
        <div className="h-10 w-full border-2 border-slate-900 bg-white flex items-center px-3 gap-2">
            {Icon && <Icon className="w-4 h-4 text-slate-900" />}
            <span className={cn("font-mono text-sm flex-1 truncate", value ? "text-slate-900" : "text-slate-400 italic")}>
                {value || placeholder}
            </span>
        </div>
    </div>
);

const SketchAvatar = ({ fallback }: { fallback: string }) => (
    <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-100 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
        <span className="font-mono font-bold text-slate-900">{fallback}</span>
    </div>
);

// --- Browser Container (The "Sheet") ---

const SketchBrowser = ({ title, url, children }: { title: string, url: string, children: React.ReactNode }) => (
  <div className="flex flex-col gap-6 min-w-[1000px] group">
    <div className="border-4 border-slate-900 rounded-xl bg-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] flex flex-col h-[800px]">
       {/* Browser Chrome */}
       <div className="border-b-4 border-slate-900 px-4 py-3 flex items-center gap-4 bg-slate-100">
          <div className="flex gap-2">
             <div className="w-4 h-4 rounded-full border-2 border-slate-900 bg-white" />
             <div className="w-4 h-4 rounded-full border-2 border-slate-900 bg-white" />
          </div>
          <div className="flex-1 max-w-2xl mx-auto border-2 border-slate-900 bg-white rounded-md px-4 py-2 flex items-center justify-between">
             <span className="font-mono text-xs text-slate-900">https://compensa.edu/{url}</span>
             <div className="w-3 h-3 rounded-full border-2 border-slate-900" />
          </div>
          <div className="w-16" />
       </div>
       
       {/* Viewport */}
       <div className="flex-1 bg-white relative overflow-hidden flex flex-col text-left font-mono">
          {children}
       </div>
    </div>
    
    <div className="text-center pb-4">
       <div className="font-mono font-bold text-2xl text-slate-900 uppercase tracking-widest">{title}</div>
    </div>
  </div>
);

const FlowArrow = () => (
  <div className="hidden lg:flex items-center justify-center px-8 opacity-60">
    <ArrowRight className="w-16 h-16 text-slate-900" strokeWidth={1.5} />
  </div>
);

// --- Layout Sketch ---

const SketchLayout = ({ children, activeNav = 'Dashboard' }: { children: React.ReactNode, activeNav?: string }) => (
    <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r-4 border-slate-900 flex flex-col bg-slate-50">
            <div className="h-20 flex items-center px-6 border-b-4 border-slate-900 bg-white">
                <div className="w-8 h-8 border-2 border-slate-900 bg-slate-900 mr-3 rotate-45" />
                <span className="font-bold text-xl uppercase">Compensa+</span>
            </div>
            <div className="p-6 space-y-4">
                {[
                    { name: 'Dashboard', icon: PieChart },
                    { name: 'Solicitações', icon: CheckSquare },
                    { name: 'Calendário', icon: CalendarIcon },
                    { name: 'Relatórios', icon: FileText },
                    { name: 'Configurações', icon: Settings }
                ].map(item => (
                    <div key={item.name} className={cn("flex items-center gap-3 px-3 py-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]", 
                        item.name === activeNav ? "bg-slate-900 text-white" : "bg-white text-slate-900")}>
                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                        <span className="font-bold text-sm">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto p-6 border-t-4 border-slate-900">
                <div className="flex items-center gap-2 font-bold text-slate-500">
                    <LogOut className="w-5 h-5" /> Sair
                </div>
            </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Navbar */}
            <div className="h-20 border-b-4 border-slate-900 bg-white flex items-center justify-between px-8">
                <div className="w-80">
                    <SketchInput placeholder="Buscar (Ctrl+K)..." icon={Search} />
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative cursor-pointer">
                        <Bell className="w-6 h-6 border-2 border-slate-900 rounded-full p-0.5" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-900 border border-white rounded-full" />
                    </div>
                    <div className="flex items-center gap-3 border-l-2 border-slate-300 pl-6">
                        <div className="text-right leading-tight hidden md:block">
                            <div className="font-bold text-sm">Prof. Ana Silva</div>
                            <div className="text-xs text-slate-500 uppercase">Administrador</div>
                        </div>
                        <SketchAvatar fallback="AS" />
                    </div>
                </div>
            </div>
            
            {/* Page Body */}
            <div className="flex-1 overflow-auto p-8">
                {children}
            </div>
        </div>
    </div>
);

// --- Screen Sketches ---

const LoginScreen = () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-slate-50">
        <SketchBox className="w-full max-w-md p-8 bg-white flex flex-col gap-6 transform rotate-1">
             <div className="flex flex-col items-center gap-4 mb-4">
                 <div className="w-16 h-16 border-4 border-slate-900 bg-slate-900 rotate-12" />
                 <SketchText variant="h1" align="center">Acesso Restrito</SketchText>
             </div>
             
             <div className="space-y-4">
                 <SketchInput label="EMAIL" placeholder="seu@email.edu" icon={User} />
                 <SketchInput label="SENHA" value="********" icon={CheckSquare} />
             </div>

             <div className="flex items-center gap-2">
                 <div className="w-5 h-5 border-2 border-slate-900 flex items-center justify-center">
                     <div className="w-3 h-3 bg-slate-900" />
                 </div>
                 <span className="text-xs font-bold uppercase">Manter conectado</span>
             </div>
             
             <SketchButton className="w-full h-12 text-lg">ENTRAR NO SISTEMA</SketchButton>
             
             <div className="text-center pt-4 border-t-2 border-dashed border-slate-300">
                 <span className="text-xs font-bold underline cursor-pointer">Esqueci minha senha</span>
             </div>
        </SketchBox>
    </div>
);

const DashboardScreen = () => (
    <SketchLayout activeNav="Dashboard">
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4">
                <SketchText variant="h1">Painel de Controle</SketchText>
                <SketchButton variant="primary" icon={Plus}>Nova Solicitação</SketchButton>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8">
                <SketchBox className="p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-slate-200 rounded-full border-2 border-slate-900" />
                    <SketchText variant="label">Horas Cumpridas</SketchText>
                    <div className="text-5xl font-bold mt-2">124<span className="text-2xl text-slate-500">h</span></div>
                    <div className="mt-4 w-full h-4 border-2 border-slate-900 rounded-full p-0.5">
                        <div className="h-full w-3/4 bg-slate-900 rounded-full" />
                    </div>
                </SketchBox>
                
                <SketchBox className="p-6">
                    <SketchText variant="label">Saldo Atual</SketchText>
                    <div className="text-5xl font-bold mt-2 text-green-700">+12<span className="text-2xl text-slate-500">h</span></div>
                    <div className="mt-4 text-xs font-bold bg-green-100 inline-block px-2 py-1 border border-green-800 text-green-900 rounded-sm">
                        BOM ESTADO
                    </div>
                </SketchBox>

                <SketchBox className="p-6">
                     <SketchText variant="label">Pendências</SketchText>
                     <div className="text-5xl font-bold mt-2">03</div>
                     <div className="mt-4 text-xs underline cursor-pointer">Ver detalhes &rarr;</div>
                </SketchBox>
            </div>
            
            {/* Charts Area */}
            <div className="grid grid-cols-2 gap-8 h-80">
                <SketchBox className="p-6 flex flex-col">
                    <div className="flex justify-between mb-4">
                        <SketchText variant="h2">Evolução Semanal</SketchText>
                        <div className="border-2 border-slate-900 px-2 text-xs font-bold">OUTUBRO ▾</div>
                    </div>
                    <div className="flex-1 border-l-2 border-b-2 border-slate-900 flex items-end justify-between px-4 pb-0 relative">
                        {/* Bars */}
                        {[30, 50, 45, 80, 40, 60, 75].map((h, i) => (
                            <div key={i} className="w-8 bg-slate-400 border-2 border-slate-900 hover:bg-slate-900 transition-colors relative group" style={{ height: `${h}%` }}>
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-1 font-bold">
                                    {h}h
                                </div>
                            </div>
                        ))}
                    </div>
                </SketchBox>

                <SketchBox className="p-6 flex flex-col gap-4">
                    <SketchText variant="h2">Avisos Recentes</SketchText>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 items-start border-b border-dashed border-slate-300 pb-2">
                             <div className="w-2 h-2 mt-1.5 bg-slate-900 rounded-full" />
                             <div>
                                 <div className="font-bold text-sm">Prazo de entrega de relatórios</div>
                                 <div className="text-xs text-slate-500">Há {i} dias • Coordenação</div>
                             </div>
                        </div>
                    ))}
                </SketchBox>
            </div>
        </div>
    </SketchLayout>
);

const CalendarScreen = () => (
    <SketchLayout activeNav="Calendário">
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                 <SketchText variant="h1">Calendário Acadêmico</SketchText>
                 <div className="flex gap-2">
                     <SketchButton variant="secondary">&lt;</SketchButton>
                     <SketchButton variant="secondary" className="w-32">OUTUBRO</SketchButton>
                     <SketchButton variant="secondary">&gt;</SketchButton>
                 </div>
            </div>
            
            <SketchBox className="flex-1 p-4">
                <div className="grid grid-cols-7 h-full gap-2">
                    {/* Header */}
                    {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(day => (
                        <div key={day} className="text-center font-bold text-sm border-b-2 border-slate-900 pb-2 mb-2">{day}</div>
                    ))}
                    
                    {/* Days Grid - 5 weeks approx */}
                    {Array.from({length: 35}).map((_, i) => {
                        const day = i - 2; // Offset for month start
                        const isToday = day === 14;
                        const hasEvent = [5, 12, 14, 22].includes(day);
                        
                        if (day <= 0 || day > 31) return <div key={i} className="bg-slate-50/50 opacity-20" />;
                        
                        return (
                            <div key={i} className={cn("border-2 border-slate-200 p-2 relative min-h-[80px]", isToday ? "bg-slate-100 border-slate-900" : "")}>
                                <span className={cn("text-xs font-bold", isToday ? "text-slate-900 text-lg" : "text-slate-500")}>{day}</span>
                                {hasEvent && (
                                    <div className="mt-2 bg-slate-900 text-white text-[10px] p-1 font-bold leading-tight truncate border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                                        Reunião Ped...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </SketchBox>
        </div>
    </SketchLayout>
);

const RequestFormScreen = () => (
    <SketchLayout activeNav="Solicitações">
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="border-b-4 border-slate-900 pb-4">
                <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase">
                    <span>Solicitações</span>
                    <span>/</span>
                    <span className="text-slate-900">Novo Registro</span>
                </div>
                <SketchText variant="h1">Registrar Atividade</SketchText>
            </div>
            
            <SketchBox className="p-8 space-y-8">
                {/* Form Row 1 */}
                <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                         <SketchText variant="label">Tipo de Ocorrência</SketchText>
                         <div className="h-10 border-2 border-slate-900 bg-white flex items-center justify-between px-3 cursor-pointer">
                             <span className="font-bold text-sm">Reposição de Aula</span>
                             <ChevronDown className="w-5 h-5" />
                         </div>
                     </div>
                     <SketchInput label="Data" value="14/10/2024" icon={CalendarIcon} />
                </div>
                
                {/* Form Row 2 */}
                <div className="grid grid-cols-2 gap-8">
                     <SketchInput label="Início" value="08:00" placeholder="00:00" />
                     <SketchInput label="Término" value="12:00" placeholder="00:00" />
                </div>
                
                {/* Text Area */}
                <div className="space-y-2">
                    <SketchText variant="label">Justificativa Detalhada</SketchText>
                    <div className="border-2 border-slate-900 bg-white p-4 min-h-[120px]">
                        <p className="font-mono text-sm leading-relaxed">
                            Solicito reposição referente à aula não ministrada no dia 12/10 devido ao feriado nacional. A reposição será realizada com turmas unificadas no auditório.
                        </p>
                    </div>
                    <div className="text-right text-xs text-slate-500 font-bold">240 caracteres</div>
                </div>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-400 bg-slate-50 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 hover:border-slate-900">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500 uppercase">Anexar Comprovante (PDF/JPG)</span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-slate-200">
                    <SketchButton variant="ghost">CANCELAR</SketchButton>
                    <SketchButton variant="primary">ENVIAR PARA ANÁLISE</SketchButton>
                </div>
            </SketchBox>
        </div>
    </SketchLayout>
);

const KanbanScreen = () => (
    <SketchLayout activeNav="Solicitações">
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <SketchText variant="h1">Fluxo de Aprovação</SketchText>
                <div className="flex gap-2">
                    <SketchButton variant="secondary" icon={Filter}>Filtrar</SketchButton>
                    <SketchButton variant="secondary" icon={Settings}>Configurar</SketchButton>
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden pb-4">
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-200 border-2 border-slate-900 p-3 font-bold text-center uppercase tracking-wide">
                        Pendentes (3)
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="space-y-4 pr-2">
                            {[1, 2, 3].map(i => (
                                <SketchBox key={i} className="p-4 cursor-pointer hover:-translate-y-1 transition-transform">
                                    <div className="flex justify-between mb-2">
                                        <div className="bg-yellow-100 text-yellow-900 text-[10px] font-bold px-1 border border-yellow-900">URGENTE</div>
                                        <div className="text-xs font-bold text-slate-400">#84{i}</div>
                                    </div>
                                    <div className="font-bold text-sm mb-1">Abono de Falta</div>
                                    <div className="text-xs text-slate-600 mb-3">Prof. Carlos Santos</div>
                                    <div className="flex justify-end gap-2">
                                        <button className="w-6 h-6 border-2 border-slate-900 bg-white flex items-center justify-center hover:bg-red-100"><X className="w-4 h-4" /></button>
                                        <button className="w-6 h-6 border-2 border-slate-900 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700"><CheckSquare className="w-4 h-4" /></button>
                                    </div>
                                </SketchBox>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-200 border-2 border-slate-900 p-3 font-bold text-center uppercase tracking-wide">
                        Em Análise (2)
                    </div>
                    <div className="space-y-4">
                         <SketchBox className="p-4 opacity-60">
                            <div className="text-xs font-bold text-slate-400 mb-1">#839</div>
                            <div className="font-bold text-sm">Reposição</div>
                            <div className="text-xs text-slate-600">Prof. Maria Clara</div>
                        </SketchBox>
                        <SketchBox className="p-4 opacity-60">
                            <div className="text-xs font-bold text-slate-400 mb-1">#838</div>
                            <div className="font-bold text-sm">Hora Extra</div>
                            <div className="text-xs text-slate-600">Prof. João Pedro</div>
                        </SketchBox>
                    </div>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-200 border-2 border-slate-900 p-3 font-bold text-center uppercase tracking-wide">
                        Concluídos
                    </div>
                    <div className="space-y-4">
                        <SketchBox className="p-4 bg-slate-50 border-slate-300 shadow-none">
                            <div className="flex items-center gap-2 mb-1 text-green-700">
                                <CheckSquare className="w-4 h-4" />
                                <span className="font-bold text-xs">APROVADO</span>
                            </div>
                            <div className="font-bold text-sm text-slate-400 line-through">Licença Médica</div>
                        </SketchBox>
                    </div>
                </div>
            </div>
        </div>
    </SketchLayout>
);

// --- NEW SCREENS ---

const RequestDetailScreen = () => (
    <SketchLayout activeNav="Solicitações">
         <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                     <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase">
                        <span>Solicitações</span>
                        <span>/</span>
                        <span className="text-slate-900">Detalhe</span>
                    </div>
                    <SketchText variant="h1">Solicitação #842</SketchText>
                </div>
                <div className="flex gap-3">
                    <SketchButton variant="ghost" icon={Printer}>Imprimir</SketchButton>
                    <div className="px-4 py-2 border-2 border-slate-900 bg-yellow-100 text-yellow-900 font-bold text-sm uppercase">
                        Em Análise
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <SketchBox className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 border-b-2 border-dashed border-slate-200 pb-4">
                            <div>
                                <SketchText variant="label">Solicitante</SketchText>
                                <SketchText variant="body">Prof. Carlos Santos</SketchText>
                            </div>
                            <div>
                                <SketchText variant="label">Data de Envio</SketchText>
                                <SketchText variant="body">14 Out 2024, 10:30</SketchText>
                            </div>
                        </div>
                        <div>
                             <SketchText variant="label">Tipo</SketchText>
                             <SketchText variant="h2">Abono de Falta</SketchText>
                        </div>
                        <div>
                             <SketchText variant="label">Justificativa</SketchText>
                             <p className="text-sm font-mono leading-relaxed mt-1">
                                 Comparecimento a consulta médica de urgência. Atestado médico anexo comprova o período de ausência das 08:00 às 10:00.
                             </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-300 p-3 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-slate-500" />
                            <span className="text-sm font-bold underline">atestado_medico.pdf</span>
                        </div>
                    </SketchBox>
                    
                    <SketchBox className="p-6">
                        <SketchText variant="h2" className="mb-4">Histórico de Discussão</SketchText>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <SketchAvatar fallback="CS" />
                                <div className="bg-slate-50 p-3 border-2 border-slate-200 rounded-tr-xl rounded-br-xl rounded-bl-xl flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-xs">Carlos Santos</span>
                                        <span className="text-[10px] text-slate-400">14/10 - 10:30</span>
                                    </div>
                                    <p className="text-xs">Seguem documentos anexos conforme solicitado.</p>
                                </div>
                            </div>
                             <div className="flex gap-4 flex-row-reverse">
                                <SketchAvatar fallback="COORD" />
                                <div className="bg-slate-100 p-3 border-2 border-slate-900 rounded-tl-xl rounded-bl-xl rounded-br-xl flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-xs">Coordenação</span>
                                        <span className="text-[10px] text-slate-400">14/10 - 11:15</span>
                                    </div>
                                    <p className="text-xs">Recebido. Iremos analisar a validade do atestado para o período total.</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2">
                            <SketchInput placeholder="Escreva um comentário..." />
                            <SketchButton variant="primary" icon={MessageSquare}>Enviar</SketchButton>
                        </div>
                    </SketchBox>
                </div>

                <div className="space-y-6">
                     <SketchBox className="p-4">
                        <SketchText variant="label" className="mb-3">Ações da Coordenação</SketchText>
                        <div className="space-y-2">
                            <SketchButton variant="primary" className="w-full justify-start bg-green-800 border-green-900" icon={CheckSquare}>Aprovar Pedido</SketchButton>
                            <SketchButton variant="primary" className="w-full justify-start bg-red-800 border-red-900" icon={X}>Rejeitar Pedido</SketchButton>
                             <SketchButton variant="secondary" className="w-full justify-start">Solicitar Correção</SketchButton>
                        </div>
                     </SketchBox>
                </div>
            </div>
         </div>
    </SketchLayout>
);

const ReportScreen = () => (
    <SketchLayout activeNav="Relatórios">
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <SketchText variant="h1">Relatório de Banco de Horas</SketchText>
                <div className="flex gap-2">
                    <SketchButton variant="secondary" icon={Download}>Exportar CSV</SketchButton>
                    <SketchButton variant="secondary" icon={Printer}>Imprimir</SketchButton>
                </div>
            </div>

            <SketchBox className="p-6">
                <div className="flex gap-4 mb-6 border-b border-slate-200 pb-6">
                    <div className="flex-1">
                        <SketchText variant="label">Período</SketchText>
                        <div className="flex gap-2 items-center">
                            <SketchInput value="01/10/2024" icon={CalendarIcon} />
                            <span>até</span>
                             <SketchInput value="31/10/2024" icon={CalendarIcon} />
                        </div>
                    </div>
                    <div className="w-1/3">
                         <SketchText variant="label">Departamento</SketchText>
                         <div className="border-2 border-slate-900 p-2 bg-white flex justify-between items-center">
                             <span className="text-sm font-bold">Todos os Departamentos</span>
                             <ChevronDown className="w-4 h-4" />
                         </div>
                    </div>
                </div>

                <div className="border-2 border-slate-900">
                    <div className="grid grid-cols-6 bg-slate-100 border-b-2 border-slate-900 p-3 font-bold text-xs uppercase text-slate-700">
                        <div className="col-span-2">Professor</div>
                        <div>Matrícula</div>
                        <div className="text-right">Horas Totais</div>
                        <div className="text-right">Saldo</div>
                        <div className="text-center">Status</div>
                    </div>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="grid grid-cols-6 p-3 border-b border-slate-200 text-sm hover:bg-slate-50">
                             <div className="col-span-2 font-bold">Prof. Exemplo Silva {i}</div>
                             <div className="font-mono text-slate-500">100.20.{i}34</div>
                             <div className="text-right">160h</div>
                             <div className={cn("text-right font-bold", i % 2 === 0 ? "text-green-700" : "text-red-700")}>
                                 {i % 2 === 0 ? "+12h" : "-4h"}
                             </div>
                             <div className="text-center">
                                 <span className={cn("text-[10px] px-2 py-0.5 border rounded-full font-bold", i % 2 === 0 ? "bg-green-100 border-green-800 text-green-900" : "bg-red-100 border-red-800 text-red-900")}>
                                     {i % 2 === 0 ? "REGULAR" : "ATENÇÃO"}
                                 </span>
                             </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 text-center text-xs text-slate-500 font-bold uppercase tracking-wide">
                    Exibindo 6 de 145 resultados
                </div>
            </SketchBox>
        </div>
    </SketchLayout>
);

const ProfileScreen = () => (
    <SketchLayout activeNav="Configurações">
        <div className="max-w-2xl mx-auto space-y-8">
            <SketchText variant="h1">Meu Perfil</SketchText>
            
            <SketchBox className="p-8 relative mt-12">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-slate-900 flex items-center justify-center mb-2">
                        <User className="w-10 h-10 text-slate-500" />
                    </div>
                    <SketchButton variant="secondary" className="h-6 text-xs px-2">Alterar Foto</SketchButton>
                </div>
                
                <div className="mt-12 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <SketchInput label="Nome Completo" value="Ana Carolina Silva" />
                        <SketchInput label="Matrícula" value="2021.55.901" icon={CheckSquare} />
                    </div>
                     <div className="grid grid-cols-2 gap-6">
                        <SketchInput label="Email Institucional" value="ana.silva@compensa.edu" icon={User} />
                        <SketchInput label="Telefone" value="(11) 99999-9999" />
                    </div>
                    
                    <div className="pt-6 border-t-2 border-slate-200">
                        <SketchText variant="h2" className="mb-4">Notificações</SketchText>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm">Alertas por Email</div>
                                    <div className="text-xs text-slate-500">Receber atualizações de status</div>
                                </div>
                                <ToggleRight className="w-10 h-10 text-slate-900" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm">Lembretes de Pendência</div>
                                    <div className="text-xs text-slate-500">Avisar 24h antes do prazo</div>
                                </div>
                                <ToggleRight className="w-10 h-10 text-slate-900" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t-2 border-slate-200 flex justify-end gap-4">
                        <SketchButton variant="ghost">Descartar</SketchButton>
                        <SketchButton variant="primary">Salvar Alterações</SketchButton>
                    </div>
                </div>
            </SketchBox>
        </div>
    </SketchLayout>
);

export const ProjectStoryboard = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 py-12 bg-[#f0f4f8] min-h-screen">
      <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col gap-2 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white w-fit font-mono text-xs font-bold uppercase tracking-widest transform -rotate-1">
                  V.1.0-DRAFT
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight font-mono uppercase">Wireframes Principais</h2>
              <p className="font-mono text-slate-600 max-w-2xl border-l-4 border-slate-900 pl-4 py-2">
                  Esboços de baixa fidelidade simulando a estrutura e fluxo da aplicação (Estilo Balsamiq).
              </p>
          </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-12">
        <div className="flex items-start justify-center gap-12 px-12 min-w-max py-4">
            <SketchBrowser title="1. Login" url="auth">
                <LoginScreen />
            </SketchBrowser>
            
            <FlowArrow />
            
            <SketchBrowser title="2. Dashboard" url="dashboard">
                <DashboardScreen />
            </SketchBrowser>
            
            <FlowArrow />
            
            <SketchBrowser title="3. Calendário" url="agenda">
                <CalendarScreen />
            </SketchBrowser>
            
            <FlowArrow />
            
            <SketchBrowser title="4. Novo Pedido" url="solicitacao/nova">
                <RequestFormScreen />
            </SketchBrowser>
            
            <FlowArrow />
            
            <SketchBrowser title="5. Quadro Kanban" url="gestao/kanban">
                <KanbanScreen />
            </SketchBrowser>
            
            <FlowArrow />

            <SketchBrowser title="6. Detalhes do Pedido" url="solicitacao/ver/842">
                <RequestDetailScreen />
            </SketchBrowser>

            <FlowArrow />

            <SketchBrowser title="7. Relatório de Horas" url="relatorios/banco-horas">
                <ReportScreen />
            </SketchBrowser>

            <FlowArrow />

            <SketchBrowser title="8. Perfil & Configurações" url="minha-conta/perfil">
                <ProfileScreen />
            </SketchBrowser>
        </div>
        <ScrollBar orientation="horizontal" className="h-4" />
      </ScrollArea>
    </div>
  );
};
