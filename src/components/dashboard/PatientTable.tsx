import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, User } from "lucide-react";
import patients from "@/data/patients.json";

type SortKey = "name" | "age" | "cost" | "los" | "rating" | "date";
type SortDir = "asc" | "desc";

const STATUSES = ["All", "Normal", "Readmit", "Discharge", "Death", "ICU"];
const PER_PAGE = 15;

const statusColors: Record<string, string> = {
  Normal: "bg-primary/15 text-primary",
  Readmit: "bg-chart-4/15 text-chart-4",
  Discharge: "bg-chart-2/15 text-chart-2",
  Death: "bg-destructive/15 text-destructive",
  ICU: "bg-chart-3/15 text-chart-3",
};

const PatientTable = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<(typeof patients)[0] | null>(null);

  const filtered = useMemo(() => {
    let result = patients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.state.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }
    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronDown className="h-3 w-3 opacity-30" />;

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, city, or state..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} patients found</p>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {([["name", "Patient"], ["age", "Age"], ["cost", "Cost"], ["los", "LOS"], ["rating", "Rating"], ["date", "Date"]] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                    <span className="flex items-center gap-1">{label} <SortIcon col={key} /></span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">City</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Type</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginated.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedPatient(p)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.age}</td>
                    <td className="px-4 py-3 text-foreground">${p.cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.los}d</td>
                    <td className="px-4 py-3">
                      <span className="text-primary font-medium">{p.rating}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status] || ""}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{p.patientType}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-30 transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const n = start + i;
            if (n > totalPages) return null;
            return (
              <button key={n} onClick={() => setPage(n)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${page === n ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {n}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-30 transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Patient Profile Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-foreground">{selectedPatient.name}</h3>
                    <p className="text-xs text-muted-foreground">ID: {selectedPatient.id} &middot; {selectedPatient.gender === "M" ? "Male" : "Female"}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Age", `${selectedPatient.age} (${selectedPatient.ageBucket})`],
                  ["Status", selectedPatient.status],
                  ["Type", selectedPatient.patientType],
                  ["City", selectedPatient.city],
                  ["State", selectedPatient.state],
                  ["Dept", `#${selectedPatient.deptId}`],
                  ["Cost", `$${selectedPatient.cost.toFixed(2)}`],
                  ["LOS", `${selectedPatient.los} days`],
                  ["Rating", `${selectedPatient.rating} / 5`],
                  ["Feedback", selectedPatient.feedback],
                  ["Date", selectedPatient.date],
                ].map(([label, value]) => (
                  <div key={label} className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientTable;
