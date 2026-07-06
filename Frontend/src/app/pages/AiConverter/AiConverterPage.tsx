import React from "react";
import { AIChatInterface } from "../../layouts/AIChatInterface";
import { Sparkles } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import type { AuthenticatedUser } from "../../types/user";
import { useLanguage } from "../../providers/LanguageContext";

export const AiConverterPage = ({ user }: { user?: AuthenticatedUser }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-shrink-0 pb-4 border-b border-slate-200 dark:border-slate-800">
        <PageHeader
          icon={Sparkles}
          title={t("ai_assistant.title")}
          description={t("ai_assistant.desc")}
        />
      </div>
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4">
        <AIChatInterface userRole={user?.role} maxHeight="100%" />
      </div>
    </div>
  );
};
