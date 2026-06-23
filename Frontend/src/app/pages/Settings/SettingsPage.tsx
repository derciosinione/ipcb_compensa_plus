import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Database,
  Calendar,
  Save,
  CheckCircle,
  RefreshCw,
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Slider } from "../../components/ui/slider";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "../../providers/LanguageContext";
import { cn } from "../../components/ui/utils";

export const SettingsPage = () => {
  const { t } = useLanguage();
  
  // State for Academic Rules
  const [minDaysAdvance, setMinDaysAdvance] = useState(3);
  const [maxSessionsPerSemester, setMaxSessionsPerSemester] = useState(5);
  const [autoApproveConflicts, setAutoApproveConflicts] = useState(false);
  const [allowWeekends, setAllowWeekends] = useState(false);
  const [bufferTime, setBufferTime] = useState([10]); // Slider values are arrays

  // State for Notifications Settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [immediateNotify, setImmediateNotify] = useState(true);

  // State for System Sync
  const [syncSchedule, setSyncSchedule] = useState("daily");
  const [cleanupThreshold, setCleanupThreshold] = useState(30);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = () => {
    toast.success(t("settings.save_success") || "System settings updated successfully.");
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    toast.info(t("settings.toast_sync_start"));
    setTimeout(() => {
      setIsSyncing(false);
      toast.success(t("settings.toast_sync_success"));
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <SettingsIcon className="w-6 h-6" />
            </div>
            {t("settings.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("settings.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-lg shadow-blue-500/20 self-start md:self-auto transition-all hover:scale-[1.02]"
        >
          <Save className="w-4 h-4" />
          <span>{t("settings.btn_save")}</span>
        </Button>
      </div>

      <Tabs defaultValue="academic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px] mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <TabsTrigger
            value="academic"
            className="rounded-lg text-xs font-semibold flex items-center gap-1.5 py-2.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t("settings.tab_academic")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-lg text-xs font-semibold flex items-center gap-1.5 py-2.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t("settings.tab_notifications")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="integration"
            className="rounded-lg text-xs font-semibold flex items-center gap-1.5 py-2.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{t("settings.tab_database")}</span>
          </TabsTrigger>
        </TabsList>

        {/* Academic Rules Tab */}
        <TabsContent value="academic" className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                {t("settings.regulations_title")}
              </CardTitle>
              <CardDescription>
                {t("settings.regulations_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Advance Notice Window */}
                <div className="space-y-2">
                  <Label htmlFor="advance-notice" className="font-semibold text-slate-700 dark:text-slate-300">
                    {t("settings.min_advance")}
                  </Label>
                  <Input
                    id="advance-notice"
                    type="number"
                    min={1}
                    max={30}
                    value={minDaysAdvance}
                    onChange={(e) => setMinDaysAdvance(parseInt(e.target.value) || 1)}
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-slate-400">
                    {t("settings.min_advance_desc")}
                  </p>
                </div>

                {/* Max Sessions per Semester */}
                <div className="space-y-2">
                  <Label htmlFor="max-sessions" className="font-semibold text-slate-700 dark:text-slate-300">
                    {t("settings.max_sessions")}
                  </Label>
                  <Input
                    id="max-sessions"
                    type="number"
                    min={1}
                    max={20}
                    value={maxSessionsPerSemester}
                    onChange={(e) => setMaxSessionsPerSemester(parseInt(e.target.value) || 1)}
                    className="max-w-[200px]"
                  />
                  <p className="text-xs text-slate-400">
                    {t("settings.max_sessions_desc")}
                  </p>
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Slider for Buffer Time */}
              <div className="space-y-4 max-w-[500px]">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t("settings.buffer_time")}
                  </Label>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                    {t("settings.minutes").replace("{count}", bufferTime[0].toString())}
                  </Badge>
                </div>
                <Slider
                  defaultValue={[10]}
                  max={60}
                  step={5}
                  value={bufferTime}
                  onValueChange={setBufferTime}
                  className="py-2"
                />
                <p className="text-xs text-slate-400">
                  {t("settings.buffer_time_desc")}
                </p>
              </div>

              <Separator className="bg-slate-100 dark:bg-slate-800" />

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-0.5 pr-4">
                    <Label className="font-bold text-slate-700 dark:text-slate-200">
                      {t("settings.auto_approve")}
                    </Label>
                    <p className="text-xs text-slate-400">
                      {t("settings.auto_approve_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={autoApproveConflicts}
                    onCheckedChange={setAutoApproveConflicts}
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                  <div className="space-y-0.5 pr-4">
                    <Label className="font-bold text-slate-700 dark:text-slate-200">
                      {t("settings.allow_weekends")}
                    </Label>
                    <p className="text-xs text-slate-400">
                      {t("settings.allow_weekends_desc")}
                    </p>
                  </div>
                  <Switch
                    checked={allowWeekends}
                    onCheckedChange={setAllowWeekends}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                {t("settings.alerts_title")}
              </CardTitle>
              <CardDescription>
                {t("settings.alerts_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <Label className="font-bold text-slate-700 dark:text-slate-200">
                    {t("settings.email_notif")}
                  </Label>
                  <p className="text-xs text-slate-400">
                    {t("settings.email_notif_desc")}
                  </p>
                </div>
                <Switch
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <Label className="font-bold text-slate-700 dark:text-slate-200">
                    {t("settings.weekly_digest")}
                  </Label>
                  <p className="text-xs text-slate-400">
                    {t("settings.weekly_digest_desc")}
                  </p>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-xl transition-colors border border-slate-100 dark:border-slate-800/40">
                <div className="space-y-0.5 pr-4">
                  <Label className="font-bold text-slate-700 dark:text-slate-200">
                    {t("settings.push_alerts")}
                  </Label>
                  <p className="text-xs text-slate-400">
                    {t("settings.push_alerts_desc")}
                  </p>
                </div>
                <Switch
                  checked={immediateNotify}
                  onCheckedChange={setImmediateNotify}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Sync / Database Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sync Configuration Card */}
            <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  {t("settings.sync_title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.sync_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sync Frequency */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t("settings.sync_freq")}
                    </Label>
                    <Select value={syncSchedule} onValueChange={setSyncSchedule}>
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">{t("settings.freq_hourly")}</SelectItem>
                        <SelectItem value="daily">{t("settings.freq_daily")}</SelectItem>
                        <SelectItem value="weekly">{t("settings.freq_weekly")}</SelectItem>
                        <SelectItem value="manual">{t("settings.freq_manual")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">
                      {t("settings.sync_freq_desc")}
                    </p>
                  </div>

                  {/* Rejected Cleanup */}
                  <div className="space-y-2">
                    <Label htmlFor="cleanup" className="font-semibold text-slate-700 dark:text-slate-300">
                      {t("settings.cleanup")}
                    </Label>
                    <Input
                      id="cleanup"
                      type="number"
                      min={7}
                      max={365}
                      value={cleanupThreshold}
                      onChange={(e) => setCleanupThreshold(parseInt(e.target.value) || 30)}
                    />
                    <p className="text-xs text-slate-400">
                      {t("settings.cleanup_desc")}
                    </p>
                  </div>
                </div>

                <Separator className="bg-slate-100 dark:bg-slate-800" />

                {/* Sync Action Area */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl gap-4">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 block">
                      {t("settings.force_sync")}
                    </span>
                    <span className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
                      {t("settings.force_sync_desc")}
                    </span>
                  </div>
                  <Button
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-2 px-5 shadow-md shadow-emerald-500/25 shrink-0 transition-all hover:scale-[1.01]"
                  >
                    <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                    {isSyncing ? t("settings.sync_btn_syncing") : t("settings.sync_btn")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Integration Status Card */}
            <Card className="border-none shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/80 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {t("settings.api_title")}
                </CardTitle>
                <CardDescription>
                  {t("settings.api_desc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Identity DB API</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-[10px]">
                    {t("settings.status_connected")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Core Schedule Service</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-[10px]">
                    {t("settings.status_connected")}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Notification Worker</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50 text-[10px]">
                    {t("settings.status_active")}
                  </Badge>
                </div>
                
                <Separator className="bg-slate-100 dark:bg-slate-800" />
                
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex justify-between">
                    <span>{t("settings.last_sync")}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t("settings.last_sync_val")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("settings.classes_monitored")}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t("settings.classes_monitored_val")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("settings.sys_version")}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">v1.4.2-stable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
