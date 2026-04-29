import { Activity, Bell, Search } from "lucide-react";

const DashboardHeader = () => (
  <header className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">HealthCare Analytics</h1>
        <p className="text-xs text-muted-foreground">Hospital Management Dashboard</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search patients..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-48"
        />
      </div>
      <button className="relative p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-card" />
      </button>
    </div>
  </header>
);

export default DashboardHeader;
