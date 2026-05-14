# DNSPY - DNS 服务器基准测试与可视化分析工具

[![Go Version](https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=flat&logo=go)](https://golang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/xxnuo/dns-benchmark?style=flat&logo=github)](https://github.com/xxnuo/dns-benchmark/releases)

[English](./README.en.md) | [中文](./README.md)

> 跨平台 DNS 服务器性能测试工具，内置 1000+ 全球 DNS 服务器，支持 UDP/DoH/DoT/DoQ 协议测试，并提供现代化的 Web 可视化分析面板。

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
  - [下载工具](#1-下载工具)
  - [运行测试](#2-运行测试)
  - [查看结果](#3-查看结果)
- [Web 可视化面板](#web-可视化面板)
  - [概览页面](#概览页面)
  - [数据分析](#数据分析)
  - [DNS 源浏览](#dns-源浏览)
- [命令行参数](#命令行参数)
- [评分系统](#评分系统)
- [内置 DNS 服务器](#内置-dns-服务器)
- [编译指南](#编译指南)
- [技术架构](#技术架构)
- [许可证](#许可证)

---

## 项目简介

国内 DNS 服务常遭运营商劫持，被插入各种广告，同时存在隐私泄露风险。为了保障安全可靠的上网体验，我们需要寻找值得信赖的 DNS 服务。

**DNSPY** 是一款用 Go 语言编写的 DNS 服务器基准测试工具，它能够：

- 测试本地网络环境下可用的 DNS 服务器及其性能表现
- 支持跨平台运行（Windows、macOS、Linux）
- 提供直观的 Web 可视化分析面板
- 内置 1000+ 全球 DNS 服务器（包括 UDP、DoH、DoT、DoQ）

## 功能特性

### 核心功能

- **多协议支持** — 测试普通 UDP DNS、DNS-over-HTTPS (DoH)、DNS-over-TLS (DoT)、DNS-over-QUIC (DoQ)
- **全球覆盖** — 内置 1000+ 个来自全球各地的 DNS 服务器
- **多线程并发** — 支持自定义并发数，大幅提升测试速度
- **智能评分** — 基于成功率、延迟、QPS 等多维度综合评分
- **GeoIP 定位** — 自动识别 DNS 服务器的地理位置
- **灵活配置** — 支持自定义测试域名、服务器列表、测试时长等

### 可视化面板

- **概览仪表盘** — 统计数据卡片、服务器类型分布、Top 10 排名、地区分布、智能分析
- **多维分析** — 总分、延迟、成功率、QPS 四种维度图表，支持地区筛选和服务器类型筛选
- **数据表格** — 可排序、可搜索、可按类型筛选的详细数据表格
- **DNS 源浏览** — 按协议类型分组的 DNS 服务器列表
- **中英文切换** — 支持中文和英文界面
- **明暗主题** — 支持亮色/暗色模式，跟随系统主题

## 快速开始

### 1. 下载工具

在 [Releases](https://github.com/xxnuo/dns-benchmark/releases) 页面中，根据您的系统架构下载对应的 `dnspy-*` 文件：

| 系统 | 文件名 |
|------|--------|
| macOS (Intel) | `dnspy-darwin-amd64` |
| macOS (Apple Silicon) | `dnspy-darwin-arm64` |
| Linux (x86_64) | `dnspy-linux-amd64` |
| Linux (ARM64) | `dnspy-linux-arm64` |
| Windows (x86_64) | `dnspy-windows-amd64.exe` |
| Windows (ARM64) | `dnspy-windows-arm64.exe` |

### 2. 运行测试

**重要提示**：必须关闭所有代理软件的 Tun 模式和虚拟网卡模式，否则会严重影响测试结果的准确性。

将下载的文件重命名为 `dnspy`（Windows 系统为 `dnspy.exe`），然后执行：

```bash
# 确保没有代理环境变量
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY

# 运行测试（将使用内置的 1000+ DNS 服务器和 10000 个热门域名）
./dnspy
```

按提示输入 `y` 确认使用内置 DNS 服务器列表，即可开始测试。

### 3. 查看结果

测试完成后，结果将输出到当前目录下的 JSON 文件（如 `dnspy_result_2024-11-07-17-32-13.json`）。

按程序提示输入 `Y` 或直接按回车键，程序将自动打开 Web 可视化面板。

您也可以随时通过以下方式查看：

```bash
# 方式一：用 dnspy 打开之前的测试结果
./dnspy dnspy_result_2024-11-07-17-32-13.json

# 方式二：直接打开 Web 面板并上传 JSON 文件
# 打开 https://bench.dash.2020818.xyz
```

## Web 可视化面板

Web 可视化面板提供了三个主要页面：

### 概览页面

上传测试结果后，概览页面自动展示：

- **统计卡片** — 服务器总数、平均评分、平均延迟、总查询数
- **服务器类型分布** — UDP/DoH/DoT/DoQ 占比环形图
- **Top 10 排名** — 综合评分最高的 10 个服务器
- **地区分布** — 按地理位置分布的服务器数量
- **智能分析** — 自动生成的数据洞察，包括最高分、最快延迟、类型占比等

### 数据分析

提供四种维度的柱状图分析：

| 维度 | 说明 |
|------|------|
| 总分 | 综合表现评分（0-100），越高越好 |
| 平均延迟 | 响应时间（ms），越低越好 |
| 成功率 | 成功解析比例（%），越高越好 |
| QPS | 每秒查询数，越高越好 |

支持按地区筛选、按协议类型筛选、分页浏览，点击柱状图可复制服务器地址。

### DNS 源浏览

按 UDP、DoH、DoT、DoQ 四种协议类型分组展示所有测试过的 DNS 服务器，包含 IP 地址、地理位置、评分、延迟等详细信息。

## 命令行参数

```bash
~> dnspy -h

使用示例:

  dnspy                                          使用内置的所有 DNS 服务器直接启动测试
  dnspy -s 114.114.114.114                       测试单个服务器
  dnspy dnspy_result_2024-10-22-08-18.json       对测试结果进行可视化分析

参数说明:
  -c, --concurrency int       每个测试的并发数 (默认 10)
  -d, --domains string        域名数据文件路径 (默认使用内置的 10000 个热门域名)
  -t, --duration int          每个测试持续时间，单位秒 (默认 10)
  -f, --file string           服务器列表文件路径
  -g, --geo string            GeoIP 归属地查询
      --json                  以 JSON 格式输出日志
  -l, --level string          日志级别 (默认 "info")
      --no-aaaa               不测试 IPv6 (AAAA 记录)
      --old-html              已弃用，使用旧版 HTML 输出
  -o, --output string         输出文件路径
      --prefer-ipv4           优先使用 IPv4 (默认 true)
  -s, --server strings        手动指定要测试的服务器
  -w, --worker int            同时测试的服务器数量 (默认 20)
```

## 评分系统

DNSPY 使用多维度加权评分系统对 DNS 服务器进行综合评估：

| 维度 | 权重 | 说明 |
|------|------|------|
| 成功率 | 35% | 成功响应次数占总请求次数的比例 |
| 错误率 | 10% | 错误响应和 IO 错误占总请求次数的比例 |
| 延迟 | 50% | 综合平均延迟和中位数延迟，考虑稳定性 |
| QPS | 5% | 每秒查询数，使用对数函数映射 |

评分范围 0-100 分，分数越高代表综合性能越好。

## 内置 DNS 服务器

项目内置了 **1000+** 个 DNS 服务器，涵盖：

- **UDP DNS** — 传统 DNS 服务器（如 114.114.114.114、8.8.8.8、1.1.1.1）
- **DoH (DNS over HTTPS)** — 加密 DNS 查询（如 Cloudflare、Google、NextDNS、AdGuard）
- **DoT (DNS over TLS)** — TLS 加密 DNS（如 Quad9、CleanBrowsing、Mullvad）
- **DoQ (DNS over QUIC)** — QUIC 协议 DNS（如 AdGuard、Control D）

数据来源包括 [KnowledgeBaseDNS](https://kb.dns.se/)、[curl/wiki/DNS-over-HTTPS](https://github.com/curl/curl/wiki/DNS-over-HTTPS) 等。

## 编译指南

### 环境要求

- Go 1.23+
- curl
- make（可选）

### 编译步骤

```bash
# 1. 克隆仓库
git clone https://github.com/xxnuo/dns-benchmark.git
cd dns-benchmark/dnspy

# 2. 更新数据文件（可选）
make update

# 3. 配置依赖
make configuration

# 4. 编译
make build
```

编译完成后，将在当前目录生成各平台的可执行文件。

### Web 面板开发

```bash
cd web
pnpm install
pnpm dev     # 启动开发服务器
pnpm build   # 构建生产版本
```

## 技术架构

```
dnspy/
├── main.go              # 主程序入口
├── config.go            # 配置和命令行参数解析
├── runner.go            # 测试执行器（调用 dnspyre）
├── rank.go              # 评分系统
├── geo.go               # GeoIP 地理位置查询
├── jsonreporter.go      # JSON 结果格式定义
├── utils.go             # 工具函数
├── tools.go             # 辅助工具
├── log.go               # 日志系统
├── res/                 # 资源文件
│   ├── providers.txt    # DNS 服务器列表（1000+）
│   ├── domains.txt      # 测试域名列表（10000+）
│   ├── Country.mmdb     # GeoIP 数据库
│   └── template.html    # HTML 输出模板（旧版）
├── web/                 # Web 可视化面板
│   └── src/
│       ├── components/  # React 组件
│       ├── pages/       # 页面
│       ├── contexts/    # 状态管理
│       ├── locales/     # 国际化
│       └── utils.js     # 工具函数
└── scripts/             # 辅助脚本
```

### 技术栈

**后端（测试工具）**
- [Go](https://golang.org/) — 高性能编译型语言
- [dnspyre](https://github.com/Tantalor93/dnspyre) — DNS 基准测试引擎
- [geoip2-golang](https://github.com/oschwald/geoip2-golang) — GeoIP 数据库读取
- [pflag](https://github.com/spf13/pflag) — 命令行参数解析
- [logrus](https://github.com/sirupsen/logrus) — 结构化日志

**前端（可视化面板）**
- [React 18](https://react.dev/) — UI 框架
- [NextUI](https://nextui.org/) — React 组件库
- [TailwindCSS](https://tailwindcss.com/) — CSS 框架
- [Chart.js](https://www.chartjs.org/) — 数据可视化
- [Framer Motion](https://www.framer.com/motion/) — 动画引擎
- [react-i18next](https://react.i18next.com/) — 国际化
- [Rsbuild](https://rsbuild.dev/) — 构建工具

## 许可证

本项目采用开源许可证。欢迎贡献代码和提出建议。

---

**DNSPY** — 让 DNS 测试变得简单而强大。