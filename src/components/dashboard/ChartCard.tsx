import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

const ChartCard = ({ title, subtitle, children, className = "" }: ChartCardProps) => (
  <div className={`rounded-xl bg-card border border-border p-5 ${className}`}>
    <div className="mb-4">
      <h3 className="text-sm font-display font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export default ChartCard;
