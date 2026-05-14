import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useFile } from "../contexts/FileContext";
import StatsCard from "../components/StatsCard";
import TypeChart from "../components/TypeChart";
import TopServers from "../components/TopServers";
import RegionChart from "../components/RegionChart";
import Insights from "../components/Insights";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { FaServer, FaStar, FaClock, FaGlobe } from "react-icons/fa";
import { calculateStats } from "../utils";

export default function Overview() {
  const { t } = useTranslation();
  const { jsonData } = useFile();
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => calculateStats(jsonData), [jsonData]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!jsonData) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <FaServer className="w-16 h-16 mx-auto mb-4 text-default-300" />
          <p className="text-lg text-default-500">{t("tip.no_data")}</p>
        </motion.div>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
          {t("overview.title")}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FaServer}
          title={t("overview.total_servers")}
          value={stats?.totalServers || 0}
          subtitle={t("overview.total_servers_desc")}
          color="primary"
          delay={0}
        />
        <StatsCard
          icon={FaStar}
          title={t("overview.avg_score")}
          value={stats?.avgScore || "N/A"}
          subtitle={t("overview.avg_score_desc")}
          color="success"
          delay={0.1}
        />
        <StatsCard
          icon={FaClock}
          title={t("overview.avg_latency")}
          value={stats ? `${stats.avgLatency}ms` : "N/A"}
          subtitle={t("overview.avg_latency_desc")}
          color="warning"
          delay={0.2}
        />
        <StatsCard
          icon={FaGlobe}
          title={t("overview.total_queries")}
          value={stats?.totalQueries?.toLocaleString() || 0}
          subtitle={t("overview.total_queries_desc")}
          color="info"
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TypeChart jsonData={jsonData} />
        <TopServers jsonData={jsonData} />
      </div>

      <RegionChart jsonData={jsonData} />

      <Insights jsonData={jsonData} />
    </div>
  );
}