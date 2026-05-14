import { motion } from "framer-motion";
import { Card, CardBody } from "@nextui-org/react";

export default function StatsCard({ icon: Icon, title, value, subtitle, color = "primary", delay = 0 }) {
  const gradientMap = {
    primary: "from-violet-500 to-blue-500",
    success: "from-emerald-500 to-teal-500",
    warning: "from-amber-500 to-orange-500",
    danger: "from-rose-500 to-pink-500",
    info: "from-cyan-500 to-sky-500",
  };

  const gradient = gradientMap[color] || gradientMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="group relative overflow-hidden border-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        <CardBody className="relative z-10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-default-500">{title}</p>
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-default-400 mt-1">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}>
                <Icon className={`w-6 h-6 text-${color}-500`} />
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}