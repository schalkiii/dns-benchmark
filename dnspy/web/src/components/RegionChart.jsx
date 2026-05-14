import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { getGradientColors } from "../utils";

export default function RegionChart({ jsonData }) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!jsonData) return null;

    const regionCounts = {};
    Object.entries(jsonData).forEach(([, data]) => {
      if (data?.score?.total > 0) {
        const geo = data.geocode || "Unknown";
        regionCounts[geo] = (regionCounts[geo] || 0) + 1;
      }
    });

    const entries = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);

    if (entries.length === 0) return null;

    const colors = getGradientColors(entries.length);

    return {
      labels: entries.map(([region]) => region),
      datasets: [
        {
          label: t("overview.total_servers"),
          data: entries.map(([, count]) => count),
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
          label: (context) => `${t("overview.total_servers")}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        ticks: { stepSize: 1 },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  if (!chartData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-0 pt-4 px-6">
          <h3 className="text-lg font-semibold">{t("overview.region_distribution")}</h3>
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