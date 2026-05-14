export const SERVER_TYPES = {
  UDP: { id: 'udp', label: 'UDP', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  DoH: { id: 'doh', label: 'DoH', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  DoT: { id: 'dot', label: 'DoT', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  DoQ: { id: 'doq', label: 'DoQ', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
};

export function getServerType(serverKey) {
  const key = (serverKey || '').toLowerCase();
  if (key.startsWith('https://') || key.includes('/dns-query')) return SERVER_TYPES.DoH;
  if (key.startsWith('tls://') || key.endsWith(':853')) return SERVER_TYPES.DoT;
  if (key.startsWith('quic://')) return SERVER_TYPES.DoQ;
  return SERVER_TYPES.UDP;
}

export function getScoreColor(score) {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

export function getScoreBadgeColor(score) {
  if (score >= 90) return 'success';
  if (score >= 70) return 'primary';
  if (score >= 50) return 'warning';
  return 'danger';
}

export function getLatencyColor(latency) {
  if (latency <= 50) return 'text-green-500';
  if (latency <= 150) return 'text-blue-500';
  if (latency <= 500) return 'text-yellow-500';
  return 'text-red-500';
}

export function getGradientColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360;
    colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
  }
  return colors;
}

export function getGradientBackground(ctx, chartArea, color1, color2) {
  if (!chartArea) return color1;
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

export function calculateStats(jsonData) {
  if (!jsonData) return null;

  const servers = Object.entries(jsonData).filter(([, data]) => data?.score?.total > 0);
  const totalServers = servers.length;
  const avgScore = servers.reduce((sum, [, data]) => sum + (data.score?.total || 0), 0) / totalServers;
  const avgLatency = servers.reduce((sum, [, data]) => sum + (data.latencyStats?.meanMs || 0), 0) / totalServers;
  const totalQueries = servers.reduce((sum, [, data]) => sum + (data.totalRequests || 0), 0);

  const typeDistribution = {};
  servers.forEach(([key]) => {
    const type = getServerType(key);
    typeDistribution[type.id] = (typeDistribution[type.id] || 0) + 1;
  });

  const regionDistribution = {};
  servers.forEach(([, data]) => {
    const geo = data.geocode || 'Unknown';
    regionDistribution[geo] = (regionDistribution[geo] || 0) + 1;
  });

  const topServers = servers
    .map(([key, data]) => ({ key, ...data }))
    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
    .slice(0, 10);

  return {
    totalServers,
    avgScore: avgScore.toFixed(1),
    avgLatency: avgLatency.toFixed(0),
    totalQueries,
    typeDistribution,
    regionDistribution,
    topServers,
  };
}