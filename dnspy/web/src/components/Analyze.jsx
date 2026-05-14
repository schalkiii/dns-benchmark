import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Chip,
  Tabs,
  Tab,
  Divider,
  Pagination,
  ScrollShadow,
} from "@nextui-org/react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LogarithmicScale } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Toaster, toast } from "sonner";

import { FaSearch as SearchIcon } from "react-icons/fa";
import { IoIosArrowUp as ArrowUpIcon, IoIosArrowDown as CollapseIcon } from "react-icons/io";

import { useFile } from "../contexts/FileContext";
import ServerTable from "./ServerTable";
import { getGradientColors } from "../utils";

ChartJS.register(CategoryScale, LinearScale, LogarithmicScale, BarElement, Title, Tooltip, Legend);

const REGION_GROUPS = {
  ASIA: {
    name: "asia",
    regions: ["CN", "HK", "TW", "JP", "KR", "SG", "ID", "MY", "TH", "VN", "IN", "AU", "NZ", "BD", "AE"],
  },
  AMERICAS: {
    name: "americas",
    regions: ["US", "CA", "BR", "MX", "AR", "CL"],
  },
  EUROPE: {
    name: "europe",
    regions: [
      "EU", "DE", "FR", "GB", "IT", "ES", "NL", "SE", "CH", "PL", "RU",
      "CZ", "CY", "RO", "NO", "FI", "SI", "IE", "LV", "HU", "TR", "MD",
      "LU", "BG", "EE", "AT", "IL"
    ],
  },
  CHINA: {
    name: "china",
    regions: ["CN", "HK", "TW", "MO"],
  },
  GLOBAL: {
    name: "global",
    regions: ["CDN", "CLOUDFLARE", "GOOGLE", "AKAMAI", "FASTLY"],
  }
};

const SERVER_TYPES = {
  ALL: "all",
  UDP: "udp",
  DoH: "doh",
  DoT: "dot",
  DoQ: "doq"
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function Analyze() {
  const { t } = useTranslation();
  const { file, jsonData } = useFile();
  const [selectedRegions, setSelectedRegions] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChart, setSelectedChart] = useState("scores");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 150;
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [serverType, setServerType] = useState(SERVER_TYPES.ALL);

  useEffect(() => {
    if (!jsonData) return;
    try {
      const regions = new Set();
      Object.values(jsonData).forEach((server) => {
        if (server?.geocode?.trim()) {
          regions.add(server.geocode);
        }
      });
      setSelectedRegions(regions);
    } catch (error) {
      console.error("Error processing jsonData:", error);
      toast.error("数据处理出错");
    }
  }, [jsonData]);

  const availableRegions = useMemo(() => {
    if (!jsonData) return [];
    try {
      const regions = new Set();
      Object.values(jsonData).forEach((server) => {
        if (server?.geocode?.trim() && server?.score?.total > 0) {
          regions.add(server.geocode);
        }
      });
      return Array.from(regions);
    } catch (error) {
      console.error("Error getting available regions:", error);
      return [];
    }
  }, [jsonData]);

  const debouncedSelectedRegions = useDebounce(selectedRegions, 300);

  const filteredData = useMemo(() => {
    if (!jsonData) return {};
    try {
      return Object.fromEntries(
        Object.entries(jsonData)
          .filter(([key, data]) => {
            const matchesRegion = data?.geocode && debouncedSelectedRegions.has(data.geocode) && data?.score?.total > 0;
            if (!matchesRegion) return false;
            if (serverType === SERVER_TYPES.ALL) return true;

            const url = (key || "").toLowerCase();
            switch (serverType) {
              case SERVER_TYPES.DoH:
                return url.startsWith("https://") || url.includes("/dns-query");
              case SERVER_TYPES.DoT:
                return url.startsWith("tls://") || url.endsWith(":853");
              case SERVER_TYPES.DoQ:
                return url.startsWith("quic://");
              case SERVER_TYPES.UDP:
                return !url.startsWith("https://") && !url.includes("/dns-query") && !url.startsWith("tls://") && !url.endsWith(":853") && !url.startsWith("quic://");
              default:
                return true;
            }
          })
      );
    } catch (error) {
      console.error("Error filtering data:", error);
      return {};
    }
  }, [jsonData, debouncedSelectedRegions, serverType]);

  const emptyChartData = {
    labels: [],
    datasets: [{ label: "", data: [], backgroundColor: "" }],
  };

  const chartData = useMemo(() => {
    if (selectedRegions.size === 0 || Object.keys(filteredData).length === 0) return emptyChartData;

    try {
      const filterNonZero = (labels, values) => {
        const filtered = labels.map((label, i) => ({ label, value: values[i] }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return {
          labels: paginatedData.map((item) => item.label),
          values: paginatedData.map((item) => item.value),
        };
      };

      const filterLatency = (labels, values) => {
        const filtered = labels.map((label, i) => ({ label, value: values[i] }))
          .filter((item) => item.value > 0)
          .sort((a, b) => a.value - b.value);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = filtered.slice(startIndex, endIndex);

        return {
          labels: paginatedData.map((item) => item.label),
          values: paginatedData.map((item) => item.value),
        };
      };

      const labels = Object.keys(filteredData);
      const scores = labels.map((server) => filteredData[server]?.score?.total ?? 0);
      const latencies = labels.map((server) => filteredData[server]?.latencyStats?.meanMs ?? 0);
      const successRates = labels.map((server) => filteredData[server]?.score?.successRate ?? 0);
      const qpsValues = labels.map((server) => filteredData[server]?.queriesPerSecond ?? 0);

      const scoreData = filterNonZero(labels, scores);
      const latencyData = filterLatency(labels, latencies);
      const successRateData = filterNonZero(labels, successRates);
      const qpsData = filterNonZero(labels, qpsValues);

      const makeGradientData = (data) => {
        const colors = getGradientColors(data.values.length);
        return {
          labels: data.labels,
          datasets: [{
            label: "",
            data: data.values,
            backgroundColor: colors,
            borderColor: colors.map(c => c.replace("0.8", "1")),
            borderWidth: 1,
            borderRadius: 3,
          }],
        };
      };

      return {
        scores: makeGradientData(scoreData),
        latencies: {
          labels: latencyData.labels,
          datasets: [{
            label: "",
            data: latencyData.values,
            backgroundColor: latencyData.values.map(() => "hsla(217, 91%, 60%, 0.7)"),
            borderColor: latencyData.values.map(() => "hsla(217, 91%, 60%, 1)"),
            borderWidth: 1,
            borderRadius: 3,
          }],
        },
        successRates: {
          labels: successRateData.labels,
          datasets: [{
            label: "",
            data: successRateData.values,
            backgroundColor: successRateData.values.map((v) =>
              v >= 90 ? "hsla(142, 71%, 45%, 0.7)" : v >= 70 ? "hsla(48, 96%, 53%, 0.7)" : "hsla(0, 84%, 60%, 0.7)"
            ),
            borderColor: successRateData.values.map((v) =>
              v >= 90 ? "hsla(142, 71%, 45%, 1)" : v >= 70 ? "hsla(48, 96%, 53%, 1)" : "hsla(0, 84%, 60%, 1)"
            ),
            borderWidth: 1,
            borderRadius: 3,
          }],
        },
        qps: makeGradientData(qpsData),
      };
    } catch (error) {
      console.error("Error generating chart data:", error);
      return emptyChartData;
    }
  }, [filteredData, selectedRegions, currentPage]);

  const options = useMemo(() => ({
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        animation: { duration: 0 },
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const label = context.dataset.label;
            return `${label}: ${value}`;
          },
        },
      },
    },
    responsive: true,
    indexAxis: "y",
    animation: { duration: 0 },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const server = chart.data.labels[index];
        navigator.clipboard.writeText(server).then(() => {
          toast.success(t("tip.copied"), {
            description: server,
            duration: 2000,
          });
        }).catch(error => {
          console.error("Failed to copy:", error);
          toast.error(t("tip.copy_failed"));
        });
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ...(selectedChart === 'latencies' ? {
          type: 'logarithmic',
          min: 1,
          ticks: {
            maxTicksLimit: 10,
            callback: function (value) { return value + 'ms'; }
          }
        } : selectedChart === 'qps' ? {
          type: 'logarithmic',
          min: 1,
          ticks: {
            maxTicksLimit: 10,
            callback: function (value) { return value.toLocaleString(); }
          }
        } : {
          type: 'linear',
          max: 100,
          ticks: { maxTicksLimit: 10 }
        })
      },
      y: {
        beginAtZero: true,
        barThickness: (context) => {
          const dataLength = context.chart.data.labels.length;
          return Math.min(30, Math.max(15, 400 / dataLength));
        }
      },
    },
  }), [selectedChart, t]);

  const filteredRegions = useMemo(
    () => availableRegions.filter((region) => region.toLowerCase().includes(searchQuery.toLowerCase())),
    [availableRegions, searchQuery]
  );

  const handleSelectAll = () => setSelectedRegions(new Set(availableRegions));
  const handleClearAll = () => setSelectedRegions(new Set());

  const selectedContent = useMemo(() => {
    if (selectedRegions.size === 0) return null;
    return (
      <ScrollShadow hideScrollBar className="w-full flex py-0.5 px-2 gap-1" orientation="horizontal">
        {Array.from(selectedRegions).map((region) => (
          <Chip key={region} onClose={() => handleRegionToggle(region, false)} variant="flat" size="sm">
            {region}
          </Chip>
        ))}
      </ScrollShadow>
    );
  }, [selectedRegions]);

  const handleRegionToggle = (region, checked) => {
    const newSelected = new Set(selectedRegions);
    if (checked) newSelected.add(region);
    else newSelected.delete(region);
    setSelectedRegions(newSelected);
  };

  const chartHeight = useMemo(() => {
    if (!chartData?.[selectedChart]?.labels?.length) return 200;
    const dataLength = chartData[selectedChart].labels.length;
    return Math.max(200, dataLength * 20 + 100);
  }, [chartData, selectedChart]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalPages = useMemo(() => {
    if (!chartData?.[selectedChart]?.labels) return 1;
    const totalItems = Object.keys(filteredData).length;
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [filteredData, chartData, selectedChart]);

  if (!file && !jsonData) {
    return (
      <div id="analyze" className="p-4 flex justify-center">
        <Card isBlurred>
          <CardBody className="text-center">
            <p>{t("tip.please_upload_file")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div id="analyze" className="p-4 flex flex-col gap-4">
      <Toaster position="top-center" expand={false} richColors />
      <div className="flex flex-col md:flex-row gap-4">
        <Card className={`w-full md:w-[180px] shrink-0 transition-all duration-300 h-fit ${isFilterCollapsed ? 'h-[52px] overflow-hidden' : ''}`}>
          <CardHeader
            className="font-medium text-lg px-2 py-2 cursor-pointer hover:bg-default-100"
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
          >
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4 m-2" />
              {t("tip.filters")}
            </div>
            <CollapseIcon
              className={`w-4 h-4 ml-auto transition-transform ${isFilterCollapsed ? 'rotate-0' : 'rotate-180'}`}
            />
          </CardHeader>
          <CardBody
            className={`px-2 py-2 flex flex-col relative transition-all duration-300 ${isFilterCollapsed ? 'max-h-0 p-0 overflow-hidden opacity-0' : 'max-h-[2000px]'}`}
          >
            <div className="text-sm text-default-500 mb-2">{t("tip.server_type")}</div>
            <div className="flex flex-wrap gap-1 mb-4">
              {Object.values(SERVER_TYPES).map((type) => (
                <Chip
                  key={type}
                  variant={serverType === type ? "solid" : "flat"}
                  color={serverType === type ? "primary" : "default"}
                  className="cursor-pointer"
                  onClick={() => setServerType(type)}
                >
                  {type.toUpperCase()}
                </Chip>
              ))}
            </div>

            <div className="text-sm text-default-500 mb-2">{t("tip.quick_filter")}</div>
            <div className="flex flex-wrap gap-1 mb-2">
              {Object.entries(REGION_GROUPS).map(([key, group]) => (
                <Chip
                  key={key}
                  variant="flat"
                  color="default"
                  className="cursor-pointer"
                  onClick={() => {
                    const regions = availableRegions.filter(r =>
                      group.regions.some(code => r.toUpperCase().includes(code)) ||
                      REGION_GROUPS.GLOBAL.regions.some(code => r.toUpperCase().includes(code))
                    );
                    setSelectedRegions(new Set(regions));
                  }}
                >
                  {t(`region.${key.toLowerCase()}`)}
                </Chip>
              ))}
            </div>
            <Divider className="my-2 mb-4" />
            <div className="text-sm text-default-500 mb-2">{t("tip.manual_select")}</div>

            <Input
              placeholder={t("tip.search_region")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<SearchIcon className="w-4 h-4" />}
              className="w-full mb-4"
            />
            <div className="flex gap-1 mb-3">
              <button onClick={handleSelectAll} className="flex-1 px-1.5 py-1 text-sm bg-primary text-white rounded-lg">
                {t("button.select_all")}
              </button>
              <button onClick={handleClearAll} className="flex-1 px-1.5 py-1 text-sm bg-default-100 text-default-700 rounded-lg">
                {t("button.clear_all")}
              </button>
            </div>
            <Divider className="my-2 mb-4" />

            <ScrollShadow id="region-scroll-container" className="flex-1">
              <div className="flex flex-wrap gap-1">
                {filteredRegions.map((region) => (
                  <Chip
                    key={region}
                    variant={selectedRegions.has(region) ? "solid" : "flat"}
                    color={selectedRegions.has(region) ? "primary" : "default"}
                    className="cursor-pointer"
                    onClick={() => handleRegionToggle(region, !selectedRegions.has(region))}
                  >
                    {region}
                  </Chip>
                ))}
              </div>
            </ScrollShadow>

            <button
              onClick={handleScrollToTop}
              className={`fixed bottom-4 right-4 p-2 bg-default-100 rounded-full hover:bg-default-200 transition-all z-10 shadow-lg ${showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              aria-label={t("tip.back_to_top")}
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          </CardBody>
        </Card>

        <div className="flex-1 flex flex-col min-w-0">
          <Tabs
            selectedKey={selectedChart}
            onSelectionChange={(key) => {
              setSelectedChart(String(key));
              setCurrentPage(1);
              setTimeout(() => {
                document.activeElement?.blur();
              }, 0);
            }}
            className="mb-2"
          >
            <Tab key="scores" title={t("score.scores")} />
            <Tab key="latencies" title={t("score.latencies")} />
            <Tab key="successRates" title={t("score.successRates")} />
            <Tab key="qps" title={t("score.qps")} />
            <Tab key="table" title={t("table.server")} />
          </Tabs>

          {selectedRegions.size > 0 ? (
            selectedChart === "table" ? (
              <Card className="flex-1">
                <CardBody>
                  <ServerTable jsonData={filteredData} />
                </CardBody>
              </Card>
            ) : (
              <Card className="flex-1">
                <CardHeader className="py-4">
                  <div className="w-full flex justify-between items-center ml-4">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold">{t(`score.${selectedChart}`)}</div>
                      <div className="text-sm text-default-500 italic">
                        {t(`score.desc_${selectedChart}`)}
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-default-500">
                          <span className="px-3 py-1.5 bg-default-100 rounded-lg font-medium">
                            {t("tip.showing_limited_data", { count: itemsPerPage })}
                          </span>
                          <span className="text-default-400">·</span>
                          <span className="px-3 py-1.5 bg-default-100 rounded-lg font-medium">
                            {t("tip.total_items", { total: Object.keys(filteredData).length })}
                          </span>
                        </div>
                        <Pagination
                          total={totalPages}
                          page={currentPage}
                          onChange={setCurrentPage}
                          size="sm"
                          showControls
                          variant="bordered"
                          classNames={{
                            wrapper: "gap-1.5",
                            item: "w-8 h-8 bg-default-50 hover:bg-default-100",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardBody style={{ height: `${chartHeight}px` }}>
                  <Bar
                    options={{
                      ...options,
                      maintainAspectRatio: false,
                      layout: {
                        padding: { left: 20, right: 30, top: 20, bottom: 20 }
                      },
                    }}
                    data={chartData?.[selectedChart] || emptyChartData}
                  />
                </CardBody>
              </Card>
            )
          ) : (
            <div className="flex justify-center items-center p-8">
              <p>{t("tip.no_region_selected")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}