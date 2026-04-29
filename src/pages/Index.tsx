import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, DollarSign, Clock, Star, HeartPulse, AlertTriangle, Search, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, CartesianGrid,
} from "recharts";
import data from "@/data/healthcareData.json";
import KPICard from "@/components/dashboard/KPICard";
import ChartCard from "@/components/dashboard/ChartCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PatientTable from "@/components/dashboard/PatientTable";
import { Bed } from "lucide-react";

const COLORS = [
  "hsl(168, 80%, 48%)", "hsl(200, 75%, 55%)", "hsl(280, 65%, 60%)",
  "hsl(35, 90%, 55%)", "hsl(0, 72%, 55%)",
];

const toChartArray = (obj: Record<string, number>) =>
  Object.entries(obj).map(([name, value]) => ({ name, value }));

const statusData = toChartArray(data.statusDist);
const ageData = toChartArray(data.ageBucketDist);
const cityData = toChartArray(data.cityDist);
const feedbackData = toChartArray(data.feedbackDist);
const monthlyData = Object.entries(data.monthlyPatients).map(([name, value]) => ({
  name: name.replace("2007-", ""), patients: value,
}));
const costByStatusData = Object.entries(data.costByStatus).map(([name, value]) => ({
  name, cost: value, los: data.losByStatus[name as keyof typeof data.losByStatus] ?? 0,
}));
const deptRatingData = Object.entries(data.ratingByDept).map(([name, value]) => ({
  dept: `Dept ${name}`, rating: value,
}));
const sentimentData = toChartArray(data.sentimentDist);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          {p.name}: <span className="text-primary font-medium">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

type TabKey = "overview" | "patients" | "performance" | "records";

const tabVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const Index = () => {
  const [tab, setTab] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "patients", label: "Patient Analytics" },
    { key: "performance", label: "Performance" },
    { key: "records", label: "Patient Records" },
  ];

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <DashboardHeader />

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                tab === t.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-md shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPICard title="Total Patients" value={data.summary.totalPatients.toLocaleString()} subtitle="All records" icon={Users} index={0} />
          <KPICard title="Total Revenue" value={`$${(data.summary.totalRevenue / 1000).toFixed(0)}K`} subtitle={`Avg $${data.summary.avgCost}`} icon={DollarSign} index={1} />
          <KPICard title="Avg Stay" value={`${data.summary.avgLOS} days`} subtitle="Length of stay" icon={Clock} index={2} />
          <KPICard title="Avg Rating" value={data.summary.avgRating} subtitle="Patient satisfaction" icon={Star} index={3} />
        </div>

        {/* Alert bar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 mb-6"
        >
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <p className="text-xs text-foreground">
            <span className="font-semibold">{data.summary.icuPatients} ICU</span> patients &middot;{" "}
            <span className="font-semibold">{data.summary.deaths} Deaths</span> recorded &middot; Avg ER wait:{" "}
            <span className="font-semibold">{data.summary.avgERTime} min</span>
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard title="Monthly Patient Volume" subtitle="2007 admission trends" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(168,80%,48%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(168,80%,48%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="patients" stroke="hsl(168,80%,48%)" fill="url(#gPrimary)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Patient Status" subtitle="Current distribution">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-2">
                  {statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-xs text-muted-foreground">{s.name}</span>
                    </div>
                  ))}
                </div>
              </ChartCard>
              <ChartCard title="Avg Cost by Status" subtitle="Treatment cost comparison" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={costByStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cost" fill="hsl(200,75%,55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Patient Sentiment" subtitle="Feedback analysis">
                <div className="space-y-3 mt-2">
                  {sentimentData.map((s, i) => {
                    const pct = ((s.value / data.summary.totalPatients) * 100).toFixed(1);
                    return (
                      <div key={s.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground font-medium">{s.name}</span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full" style={{ background: COLORS[i] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Gender Distribution</p>
                  <div className="flex gap-4">
                    {Object.entries(data.genderDist).map(([g, v]) => (
                      <div key={g} className="flex items-center gap-2">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${g === "F" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>{g}</span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{v}</p>
                          <p className="text-xs text-muted-foreground">{((v / data.summary.totalPatients) * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            </motion.div>
          )}

          {tab === "patients" && (
            <motion.div key="patients" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard title="Age Distribution" subtitle="Patient demographics by age group">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ageData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {ageData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Top Cities" subtitle="Patient origin by city">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={cityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} axisLine={false} angle={-30} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="hsl(168,80%,48%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Patient Type Split" subtitle="Inpatient vs Outpatient">
                <div className="flex items-center justify-center gap-8 py-6">
                  {Object.entries(data.patientType).map(([type, count], i) => (
                    <motion.div key={type} className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.2, type: "spring" }}>
                      <div className="mx-auto mb-3 rounded-full flex items-center justify-center" style={{ width: Math.max(80, (count / data.summary.totalPatients) * 160), height: Math.max(80, (count / data.summary.totalPatients) * 160), background: `${COLORS[i]}22`, border: `2px solid ${COLORS[i]}` }}>
                        <span className="text-lg font-display font-bold text-foreground">{count}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground capitalize">{type}</p>
                      <p className="text-xs text-muted-foreground">{((count / data.summary.totalPatients) * 100).toFixed(1)}%</p>
                    </motion.div>
                  ))}
                </div>
              </ChartCard>
              <ChartCard title="Patient Feedback" subtitle="Satisfaction survey results">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={feedbackData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}>
                      {feedbackData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </motion.div>
          )}

          {tab === "performance" && (
            <motion.div key="performance" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ChartCard title="Department Ratings" subtitle="Average patient rating by department" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={deptRatingData}>
                    <PolarGrid stroke="hsl(220,14%,18%)" />
                    <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} />
                    <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(215,15%,55%)" }} />
                    <Radar dataKey="rating" stroke="hsl(168,80%,48%)" fill="hsl(168,80%,48%)" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Avg Length of Stay" subtitle="Days by patient status">
                <div className="space-y-4 mt-2">
                  {Object.entries(data.losByStatus).map(([status, los], i) => (
                    <div key={status} className="flex items-center gap-3">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground">{status}</span>
                          <span className="text-primary font-semibold">{los} days</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(los / 5) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
              <ChartCard title="Top States" subtitle="Patient origin by state" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={toChartArray(data.stateDist)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,14%,18%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215,15%,55%)" }} axisLine={false} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215,15%,55%)" }} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="hsl(280,65%,60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Avg Cost by Age" subtitle="Treatment cost per age group">
                <div className="space-y-3 mt-2">
                  {Object.entries(data.costByAge).map(([age, cost], i) => (
                    <div key={age}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground">{age}</span>
                        <span className="text-accent font-semibold">${cost}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(cost / 200) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            </motion.div>
          )}

          {tab === "records" && (
            <motion.div key="records" variants={tabVariants} initial="initial" animate="animate" exit="exit">
              <PatientTable />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Healthcare Analytics Dashboard &middot; {data.summary.totalPatients} patient records</p>
          <div className="flex items-center gap-1.5">
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Live Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
