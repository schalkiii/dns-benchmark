import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { getServerType, getGradientColors } from "../utils";

export default function TopServers({ jsonData }) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!jsonData) return null;

    const entries = Object.entries(jsonData)
      .filter(([, data]) => data?.score?.total > 0)
      .map(([key, data]) => ({ key, score: data.score.total }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    if (entries.length === 0) return null;

    const colors = getGradientColors(entries.length);

    return {
      labels: entries.map((e) => e.key.length > 25 ? e.key.substring(0, 25) + "..." : e.key),
      datasets: [
        {
          label: t("score.scores"),
          data: entries.map((e) => e.score),
          backgroundColor: colors,
          borderColor: colors.map((c) => c.replace("0.8", "1")),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [jsonData]);

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${t("score.scores")}: ${context.raw.toFixed(1)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
        },
      },
    },
  };

  if (!chartData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-0 pt-4 px-6">
          <h3 className="text-lg font-semibold">{t("overview.top_servers")}</h3>
        </CardHeader>
        <CardBody className="p-6">
          <div className="h-[350px]">
            <Bar data={chartData} options={options} />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}