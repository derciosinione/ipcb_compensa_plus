import React, { useState } from "react";
import {
  Sliders as PreferencesIcon,
  Sun,
  Moon,
  Monitor,
  Globe,
  Calendar,
  Bell,
  Save,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "../../providers/LanguageContext";
import { useTheme } from "../../components/ui/theme-provider";
import { cn } from "../../components/ui/utils";

export const PreferencesPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  // Local preferences states (would be persisted per user)
  const [defaultCalView, setDefaultCalView] = useState("month");
  const [startMon, setStartMon] = useState(true);
  const [showTimetableInCal, setShowTimetableInCal] = useState(true);

  const [inAppNotif, setInAppNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [notifFreq, setNotifFreq] = useState("realtime");

  const handleSave = () => {
    toast.success(t("preferences.save_success"));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <PreferencesIcon className="w-6 h-6" />
            </div>
            {t("preferences.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("preferences.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-lg shadow-blue-500/20 self-start md:self-auto transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>{t("preferences.btn_save")}</span>
        </Button>
      </div>

      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px] mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <TabsTrigger
            value="display"
            className="rounded-lg text-xs font-semibold flex items-center gap-1.5 py-2.5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t("preferences.tab_display")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="rounded-lg text-xs font-semibold flex items-center gap-1.5 py-2.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("preferences.tab_calendar")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg text-xs font-semibold flex items-center gap-1.5 py-2.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t("preferences.tab_notifications")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Display & Language Tab */}
        <TabsContent value="display" className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                {t("preferences.appearance_title")}
              </CardTitle>
              <CardDescription>
                {t("preferences.appearance_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-3 max-w-[400px]">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t("preferences.app_lang")}
                </Label>
                <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="pt">Português (PT)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  {t("preferences.app_lang_desc")}
                </p>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Theme Selector */}
              <div className="space-y-3">
                <Label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("preferences.theme_title")}
                </Label>
                <div className="grid grid-cols-3 max-w-[480px] gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400",
                      theme === "light"
                        ? "border-blue-500 bg-blue-50/20 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                    )}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-semibold">{t("preferences.theme_light")}</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400",
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50/20 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                    )}
                  >
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-semibold">{t("preferences.theme_dark")}</span>
                  </button>

                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400",
                      theme === "system"
                        ? "border-blue-500 bg-blue-50/20 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                    )}
                  >
                    <Monitor className="w-5 h-5 text-slate-500" />
                    <span className="text-xs font-semibold">{t("preferences.theme_system")}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {t("preferences.theme_desc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Preferences Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                {t("preferences.cal_title")}
              </CardTitle>
              <CardDescription>
                {t("preferences.cal_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default View */}
              <div className="space-y-3 max-w-[400px]">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t("preferences.cal_default_view")}
                </Label>
                <Select value={defaultCalView} onValueChange={setDefaultCalView}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">{t("preferences.cal_view_month")}</SelectItem>
                    <SelectItem value="week">{t("preferences.cal_view_week")}</SelectItem>
                    <SelectItem value="day">{t("preferences.cal_view_day")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  {t("preferences.cal_default_view_desc")}
                </p>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-0.5 pr-4">
                    <Label className="font-bold text-slate-700 dark:text-slate-200">
                      {t("preferences.cal_start_mon")}
                    </Label>
                    <p className="text-xs text-slate-400">
                      {t("preferences.cal_start_mon_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={startMon}
                    onCheckedChange={setStartMon}
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-0.5 pr-4">
                    <Label className="font-bold text-slate-700 dark:text-slate-200">
                      {t("preferences.cal_show_regular")}
                    </Label>
                    <p className="text-xs text-slate-400">
                      {t("preferences.cal_show_regular_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={showTimetableInCal}
                    onCheckedChange={setShowTimetableInCal}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts & Notifications preferences */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                {t("preferences.notif_channels")}
              </CardTitle>
              <CardDescription>
                {t("preferences.notif_channels_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-0.5 pr-4">
                    <Label className="font-bold text-slate-700 dark:text-slate-200">
                      {t("preferences.notif_email")}
                    </Label>
                    <p className="text-xs text-slate-400">
                      {t("preferences.notif_email_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={emailNotif}
                    onCheckedChange={setEmailNotif}
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-0.5 pr-4">
                    <Label className="font-bold text-slate-700 dark:text-slate-200">
                      {t("preferences.notif_inapp")}
                    </Label>
                    <p className="text-xs text-slate-400">
                      {t("preferences.notif_inapp_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={inAppNotif}
                    onCheckedChange={setInAppNotif}
                  />
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Notification Frequency */}
              <div className="space-y-3 max-w-[400px]">
                <Label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t("preferences.notif_freq")}
                </Label>
                <Select value={notifFreq} onValueChange={setNotifFreq}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">{t("preferences.freq_realtime")}</SelectItem>
                    <SelectItem value="daily">{t("preferences.freq_daily")}</SelectItem>
                    <SelectItem value="weekly">{t("preferences.freq_weekly")}</SelectItem>
                    <SelectItem value="none">{t("preferences.freq_none")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  {t("preferences.notif_freq_desc")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
