import { useLanguage } from "../../providers/LanguageContext";

export const NotFoundPage = () => {
  const { t } = useLanguage();
  return <div className="p-12 text-center text-slate-500">{t("not_found.text")}</div>;
};
