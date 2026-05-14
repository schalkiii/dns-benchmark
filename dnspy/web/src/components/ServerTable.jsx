import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Input,
  Select,
  SelectItem,
  Button,
} from "@nextui-org/react";
import { FaSearch, FaSortAmountDown, FaCopy, FaExchangeAlt } from "react-icons/fa";
import { toast } from "sonner";
import { getServerType, getScoreBadgeColor } from "../utils";

export default function ServerTable({ jsonData, onCompare }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("score");
  const [sortDirection, setSortDirection] = useState("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedServers, setSelectedServers] = useState(new Set());

  const serverEntries = useMemo(() => {
    if (!jsonData) return [];
    return Object.entries(jsonData)
      .filter(([, data]) => data?.score?.total > 0)
      .map(([key, data]) => ({
        key,
        ip: data.ip || key,
        geocode: data.geocode || "Unknown",
        score: data.score?.total || 0,
        latency: data.latencyStats?.meanMs || 0,
        successRate: data.score?.successRate || 0,
        qps: data.queriesPerSecond || 0,
        type: getServerType(key),
        data,
      }));
  }, [jsonData]);

  const filteredEntries = useMemo(() => {
    let entries = serverEntries;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter(
        (e) => e.key.toLowerCase().includes(q) || e.ip.toLowerCase().includes(q) || e.geocode.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "all") {
      entries = entries.filter((e) => e.type.id === typeFilter);
    }

    entries.sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1;
      return (a[sortField] - b[sortField]) * multiplier;
    });

    return entries;
  }, [serverEntries, searchQuery, typeFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t("tip.copied"), { description: text, duration: 2000 });
    });
  };

  const handleSelectServer = (key) => {
    const newSet = new Set(selectedServers);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      if (newSet.size >= 3) return;
      newSet.add(key);
    }
    setSelectedServers(newSet);
  };

  const SortHeader = ({ field, children }) => (
    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort(field)}>
      {children}
      {sortField === field && (
        <FaSortAmountDown className={`w-3 h-3 transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`} />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder={t("table.server")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<FaSearch className="w-4 h-4 text-default-400" />}
          className="max-w-xs"
          size="sm"
        />
        <Select
          size="sm"
          className="max-w-[180px]"
          placeholder={t("table.filter_type")}
          selectedKeys={[typeFilter]}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0];
            if (value) setTypeFilter(value);
          }}
        >
          <SelectItem key="all">All</SelectItem>
          <SelectItem key="udp">UDP</SelectItem>
          <SelectItem key="doh">DoH</SelectItem>
          <SelectItem key="dot">DoT</SelectItem>
          <SelectItem key="doq">DoQ</SelectItem>
        </Select>
        <Button
          size="sm"
          variant={compareMode ? "solid" : "flat"}
          color={compareMode ? "primary" : "default"}
          startContent={<FaExchangeAlt />}
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedServers(new Set());
          }}
        >
          {t("table.compare")}
        </Button>
        {compareMode && selectedServers.size >= 2 && (
          <Button
            size="sm"
            color="secondary"
            onClick={() => onCompare?.(Array.from(selectedServers))}
          >
            {t("table.compare")} ({selectedServers.size})
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Table
          isHeaderSticky
          classNames={{
            base: "max-h-[600px] overflow-scroll",
            table: "min-w-full",
          }}
          removeWrapper
        >
          <TableHeader>
            <TableColumn className="text-xs uppercase tracking-wider">{t("table.server")}</TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">{t("table.ip")}</TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">{t("table.geo")}</TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">
              <SortHeader field="score">{t("table.score")}</SortHeader>
            </TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">
              <SortHeader field="latency">{t("table.latency")}</SortHeader>
            </TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">
              <SortHeader field="successRate">{t("table.success_rate")}</SortHeader>
            </TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">
              <SortHeader field="qps">{t("table.qps")}</SortHeader>
            </TableColumn>
            <TableColumn className="text-xs uppercase tracking-wider">{t("table.type")}</TableColumn>
          </TableHeader>
          <TableBody emptyContent={t("tip.no_data")}>
            {filteredEntries.map((entry, index) => (
              <TableRow key={entry.key}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Tooltip content={t("tip.click_to_copy")}>
                      <button
                        className="text-sm font-mono hover:text-primary transition-colors truncate max-w-[200px]"
                        onClick={() => handleCopy(entry.key)}
                      >
                        {entry.key.length > 30 ? entry.key.substring(0, 30) + "..." : entry.key}
                      </button>
                    </Tooltip>
                    {compareMode && (
                      <input
                        type="checkbox"
                        checked={selectedServers.has(entry.key)}
                        onChange={() => handleSelectServer(entry.key)}
                        className="ml-1"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip content={t("tip.click_to_copy")}>
                    <button
                      className="text-sm font-mono hover:text-primary transition-colors"
                      onClick={() => handleCopy(entry.ip)}
                    >
                      {entry.ip}
                    </button>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" className="text-xs">{entry.geocode}</Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    color={getScoreBadgeColor(entry.score)}
                    variant="flat"
                    size="sm"
                    className="font-mono"
                  >
                    {entry.score.toFixed(1)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{entry.latency.toFixed(0)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{entry.successRate.toFixed(1)}%</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{entry.qps.toFixed(1)}</span>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    style={{
                      backgroundColor: entry.type.bgColor,
                      color: entry.type.color,
                      border: `1px solid ${entry.type.color}30`,
                    }}
                    className="font-medium text-xs"
                  >
                    {entry.type.label}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}