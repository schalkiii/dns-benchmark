import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import { SERVER_TYPES } from "../utils";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TypeChart({ jsonData }) {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (!jsonData) return null;

    const counts = { udp: 0, doh: 0, dot: 0, doq: 0 };
    Object.entries(jsonData).forEach(([key, data]) => {
      if (data?.score?.total > 0) {
        const k = (key || "").toLowerCase();
        if (k.startsWith("https://") || k.includes("/dns-query")) counts.doh++;
        else if (k.startsWith("tls://") || k.endsWith(":853")) counts.dot++;
        else if (k.startsWith("quic://")) counts.doq++;
        else counts.udp++;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    return {
      labels: ["UDP", "DoH", "DoT", "DoQ"],
      datasets: [
        {
          data: [counts.udp, counts.doh, counts.dot, counts.doq],
          backgroundColor: [
            SERVER_TYPES.UDP.color,
            SERVER_TYPES.DoH.color,
            SERVER_TYPES.DoT.color,
            SERVER_TYPES.DoQ.color,
          ],
          borderColor: [
            `${SERVER_TYPES.UDP.color}80`,
            `${SERVER_TYPES.DoH.color}80`,
            `${SERVER_TYPES.DoT.color}80`,
            `${SERVER_TYPES.DoQ.color}80`,
          ],
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [jsonData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 16,
          usePointStyle: true,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  if (!chartData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-0 pt-4 px-6">
          <h3 className="text-lg font-semibold">{t("overview.server_type_distribution")}</h3>
        </CardHeader>
        <CardBody className="flex items-center justify-center p-6">
          <div className="w-full max-w-[280px] h-[280px]">
            <Doughnut data={chartData} options={options} />
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}