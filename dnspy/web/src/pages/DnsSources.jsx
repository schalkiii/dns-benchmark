import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardBody, Chip, Input } from "@nextui-org/react";
import { FaServer, FaSearch } from "react-icons/fa";
import { useFile } from "../contexts/FileContext";
import { getServerType, getScoreBadgeColor, SERVER_TYPES } from "../utils";

function ProviderCard({ serverKey, data, index }) {
  const type = getServerType(serverKey);
  const serverName = serverKey.length > 40 ? serverKey.substring(0, 40) + "..." : serverKey;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardBody className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-medium truncate">{serverName}</p>
              {data.ip && (
                <p className="text-xs text-default-400 font-mono mt-0.5">{data.ip}</p>
              )}
            </div>
            <Chip
              size="sm"
              style={{
                backgroundColor: type.bgColor,
                color: type.color,
                border: `1px solid ${type.color}30`,
              }}
              className="font-medium shrink-0 ml-2"
            >
              {type.label}
            </Chip>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-default-400">Score:</span>
              <Chip color={getScoreBadgeColor(data.score?.total || 0)} size="sm" variant="flat" className="font-mono">
                {(data.score?.total || 0).toFixed(1)}
              </Chip>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-default-400">Latency:</span>
              <span className="font-mono font-medium">{(data.latencyStats?.meanMs || 0).toFixed(0)}ms</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-default-400">QPS:</span>
              <span className="font-mono font-medium">{(data.queriesPerSecond || 0).toFixed(1)}</span>
            </div>
            <Chip size="sm" variant="flat" className="text-xs">
              {data.geocode || "Unknown"}
            </Chip>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

export default function DnsSources() {
  const { t } = useTranslation();
  const { jsonData } = useFile();
  const [searchQuery, setSearchQuery] = useState("");

  const groupedData = useMemo(() => {
    if (!jsonData) return null;

    const groups = { udp: [], doh: [], dot: [], doq: [] };

    Object.entries(jsonData).forEach(([key, data]) => {
      if (data?.score?.total > 0) {
        const type = getServerType(key);
        groups[type.id].push({ key, data });
      }
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      Object.keys(groups).forEach((type) => {
        groups[type] = groups[type].filter(
          (item) =>
            item.key.toLowerCase().includes(q) ||
            (item.data.ip || "").toLowerCase().includes(q) ||
            (item.data.geocode || "").toLowerCase().includes(q)
        );
      });
    }

    Object.keys(groups).forEach((type) => {
      groups[type].sort((a, b) => (b.data.score?.total || 0) - (a.data.score?.total || 0));
    });

    return groups;
  }, [jsonData, searchQuery]);

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

  const sections = [
    { key: 'udp', label: t("sources.type_udp"), type: SERVER_TYPES.UDP },
    { key: 'doh', label: t("sources.type_doh"), type: SERVER_TYPES.DoH },
    { key: 'dot', label: t("sources.type_dot"), type: SERVER_TYPES.DoT },
    { key: 'doq', label: t("sources.type_doq"), type: SERVER_TYPES.DoQ },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
          {t("sources.title")}
        </h1>
        <p className="text-default-500 text-sm mt-1">{t("sources.description")}</p>
      </motion.div>

      <Input
        placeholder={t("tip.search_region")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        startContent={<FaSearch className="w-4 h-4 text-default-400" />}
        className="max-w-md"
      />

      <div className="space-y-8">
        {sections.map((section) => {
          const items = groupedData?.[section.key] || [];
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: section.type.color }}
                />
                <h2 className="text-lg font-semibold">{section.label}</h2>
                <Chip size="sm" variant="flat">
                  {t("sources.provider_count", { count: items.length })}
                </Chip>
              </div>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {items.map((item, index) => (
                    <ProviderCard key={item.key} serverKey={item.key} data={item.data} index={index} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-default-400 italic px-1">{t("sources.no_providers")}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}