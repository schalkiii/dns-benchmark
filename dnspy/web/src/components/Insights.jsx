import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { FaLightbulb } from "react-icons/fa";
import { getServerType } from "../utils";

export default function Insights({ jsonData }) {
  const { t } = useTranslation();

  const insights = useMemo(() => {
    if (!jsonData) return [];

    const entries = Object.entries(jsonData).filter(([, data]) => data?.score?.total > 0);
    if (entries.length === 0) return [];

    const result = [];

    const regions = new Set(entries.map(([, data]) => data.geocode));
    result.push({
      text: t("overview.insight_servers_count", { count: entries.length, regions: regions.size }),
      icon: "📊",
    });

    const bestServer = entries.reduce((best, current) =>
      current[1].score.total > best[1].score.total ? current : best
    );
    result.push({
      text: t("overview.insight_top_score", { score: bestServer[1].score.total.toFixed(1), server: bestServer[0] }),
      icon: "🏆",
    });

    const avgScore = entries.reduce((sum, [, data]) => sum + data.score.total, 0) / entries.length;
    result.push({
      text: t("overview.insight_avg_score", { score: avgScore.toFixed(1) }),
      icon: "📈",
    });

    const fastestServer = entries.reduce((fastest, current) =>
      current[1].latencyStats?.meanMs < fastest[1].latencyStats?.meanMs ? current : fastest
    );
    result.push({
      text: t("overview.insight_fastest_latency", {
        latency: fastestServer[1].latencyStats?.meanMs?.toFixed(0) || "N/A",
        server: fastestServer[0],
      }),
      icon: "⚡",
    });

    const typeCounts = { udp: 0, doh: 0, dot: 0, doq: 0 };
    entries.forEach(([key]) => {
      const type = getServerType(key);
      typeCounts[type.id]++;
    });
    const total = entries.length;
    const udpPercent = ((typeCounts.udp / total) * 100).toFixed(1);
    result.push({
      text: t("overview.insight_type_distribution", { percent: udpPercent }),
      icon: "🔵",
    });

    const dohPercent = ((typeCounts.doh / total) * 100).toFixed(1);
    if (typeCounts.doh > 0) {
      result.push({
        text: t("overview.insight_doh_percent", { percent: dohPercent }),
        icon: "🟢",
      });
    }

    const regionCounts = {};
    entries.forEach(([, data]) => {
      const geo = data.geocode || "Unknown";
      regionCounts[geo] = (regionCounts[geo] || 0) + 1;
    });
    const topRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0];
    if (topRegion) {
      result.push({
        text: t("overview.insight_top_region", { region: topRegion[0], count: topRegion[1] }),
        icon: "🌍",
      });
    }

    return result;
  }, [jsonData, t]);

  if (!insights || insights.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaLightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">{t("overview.insights_title")}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="flex items-start gap-3 p-3 rounded-xl bg-default-50 hover:bg-default-100 transition-colors"
              >
                <span className="text-lg">{insight.icon}</span>
                <p className="text-sm text-default-700 dark:text-default-300">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}