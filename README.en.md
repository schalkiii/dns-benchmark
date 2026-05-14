# DNSPY - DNS Server Benchmark & Visual Analysis Tool

[![Go Version](https://img.shields.io/badge/Go-1.23%2B-00ADD8?style=flat&logo=go)](https://golang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/xxnuo/dns-benchmark?style=flat&logo=github)](https://github.com/xxnuo/dns-benchmark/releases)

[English](./README.en.md) | [中文](./README.md)

> A cross-platform DNS server benchmarking tool with 1000+ built-in global DNS servers, supporting UDP/DoH/DoT/DoQ protocols, featuring a modern web-based visual analysis dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
  - [Download](#1-download)
  - [Run Tests](#2-run-tests)
  - [View Results](#3-view-results)
- [Web Dashboard](#web-dashboard)
  - [Overview Page](#overview-page)
  - [Data Analysis](#data-analysis)
  - [DNS Sources](#dns-sources)
- [Command Line Options](#command-line-options)
- [Scoring System](#scoring-system)
- [Built-in DNS Servers](#built-in-dns-servers)
- [Build Guide](#build-guide)
- [Architecture](#architecture)
- [License](#license)

---

## Overview

DNS services in many regions are often hijacked by ISPs, injecting advertisements and raising privacy concerns. To ensure a safe and reliable internet experience, we need trustworthy DNS services.

**DNSPY** is a DNS server benchmarking tool written in Go that can:

- Test available DNS servers and their performance in your local network environment
- Run cross-platform on Windows, macOS, and Linux
- Provide an intuitive web-based visual analysis dashboard
- Include 1000+ built-in global DNS servers (UDP, DoH, DoT, DoQ)

## Features

### Core Features

- **Multi-Protocol Support** — Test plain UDP DNS, DNS-over-HTTPS (DoH), DNS-over-TLS (DoT), and DNS-over-QUIC (DoQ)
- **Global Coverage** — 1000+ built-in DNS servers from around the world
- **Concurrent Testing** — Customizable concurrency for faster testing
- **Smart Scoring** — Multi-dimensional scoring based on success rate, latency, QPS, and more
- **GeoIP Location** — Automatically identify DNS server geographic locations
- **Flexible Configuration** — Custom test domains, server lists, test duration, and more

### Dashboard Features

- **Overview Dashboard** — Stats cards, server type distribution, Top 10 ranking, region distribution, smart insights
- **Multi-Dimensional Analysis** — Charts for total score, latency, success rate, and QPS with region and protocol filtering
- **Data Table** — Sortable, searchable, filterable detailed data table
- **DNS Source Browser** — DNS servers grouped by protocol type
- **i18n Support** — Chinese and English interfaces
- **Dark/Light Theme** — Light and dark mode with system theme detection

## Quick Start

### 1. Download

From the [Releases](https://github.com/xxnuo/dns-benchmark/releases) page, download the appropriate `dnspy-*` file for your system:

| System | File |
|--------|------|
| macOS (Intel) | `dnspy-darwin-amd64` |
| macOS (Apple Silicon) | `dnspy-darwin-arm64` |
| Linux (x86_64) | `dnspy-linux-amd64` |
| Linux (ARM64) | `dnspy-linux-arm64` |
| Windows (x86_64) | `dnspy-windows-amd64.exe` |
| Windows (ARM64) | `dnspy-windows-arm64.exe` |

### 2. Run Tests

**Important**: Disable all proxy software's Tun mode and virtual network card mode, otherwise test results will be severely affected.

Rename the downloaded file to `dnspy` (`dnspy.exe` on Windows), then run:

```bash
# Ensure no proxy environment variables
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY

# Run tests (uses built-in 1000+ DNS servers and 10000 popular domains)
./dnspy
```

Press `y` when prompted to confirm using the built-in DNS server list, and testing will begin.

### 3. View Results

After testing completes, results are saved to a JSON file (e.g., `dnspy_result_2024-11-07-17-32-13.json`).

Press `Y` or Enter when prompted to automatically open the web dashboard.

You can also view results anytime:

```bash
# Option 1: Open a previous result with dnspy
./dnspy dnspy_result_2024-11-07-17-32-13.json

# Option 2: Open the web dashboard directly and upload the JSON file
# Visit https://bench.dash.2020818.xyz
```

## Web Dashboard

The web dashboard provides three main pages:

### Overview Page

After uploading test results, the overview page automatically displays:

- **Stats Cards** — Total servers, average score, average latency, total queries
- **Server Type Distribution** — UDP/DoH/DoT/DoQ donut chart
- **Top 10 Ranking** — Highest-scoring servers
- **Region Distribution** — Servers grouped by geographic location
- **Smart Insights** — Auto-generated data insights including top score, fastest latency, type distribution

### Data Analysis

Four-dimensional bar chart analysis:

| Dimension | Description |
|-----------|-------------|
| Total Score | Overall performance (0-100), higher is better |
| Average Latency | Response time (ms), lower is better |
| Success Rate | Successful resolution ratio (%), higher is better |
| QPS | Queries Per Second, higher is better |

Supports filtering by region and protocol type, pagination, and click-to-copy server addresses.

### DNS Sources

All tested DNS servers grouped by UDP, DoH, DoT, and DoQ protocols, with IP addresses, geographic locations, scores, and latency details.

## Command Line Options

```bash
~> dnspy -h

Usage Examples:

  dnspy                                          Start testing with built-in DNS servers
  dnspy -s 114.114.114.114                       Test a single server
  dnspy dnspy_result_2024-10-22-08-18.json       Visualize test results

Options:
  -c, --concurrency int       Concurrency per test (default 10)
  -d, --domains string        Domain data file path (default: built-in 10000 domains)
  -t, --duration int          Test duration in seconds (default 10)
  -f, --file string           Server list file path
  -g, --geo string            GeoIP lookup
      --json                  Output logs in JSON format
  -l, --level string          Log level (default "info")
      --no-aaaa               Skip IPv6 (AAAA record) testing
      --old-html              Deprecated, use old HTML output
  -o, --output string         Output file path
      --prefer-ipv4           Prefer IPv4 (default true)
  -s, --server strings        Manually specify server(s) to test
  -w, --worker int            Number of servers to test simultaneously (default 20)
```

## Scoring System

DNSPY uses a multi-dimensional weighted scoring system:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Success Rate | 35% | Ratio of successful responses to total requests |
| Error Rate | 10% | Ratio of errors and IO errors to total requests |
| Latency | 50% | Combined mean and median latency with stability factor |
| QPS | 5% | Queries per second using logarithmic mapping |

Scores range from 0-100, with higher scores indicating better overall performance.

## Built-in DNS Servers

The project includes **1000+** DNS servers covering:

- **UDP DNS** — Traditional DNS servers (e.g., 114.114.114.114, 8.8.8.8, 1.1.1.1)
- **DoH (DNS over HTTPS)** — Encrypted DNS queries (e.g., Cloudflare, Google, NextDNS, AdGuard)
- **DoT (DNS over TLS)** — TLS encrypted DNS (e.g., Quad9, CleanBrowsing, Mullvad)
- **DoQ (DNS over QUIC)** — QUIC protocol DNS (e.g., AdGuard, Control D)

Data sources include [KnowledgeBaseDNS](https://kb.dns.se/), [curl/wiki/DNS-over-HTTPS](https://github.com/curl/curl/wiki/DNS-over-HTTPS), and more.

## Build Guide

### Prerequisites

- Go 1.23+
- curl
- make (optional)

### Build Steps

```bash
# 1. Clone repository
git clone https://github.com/xxnuo/dns-benchmark.git
cd dns-benchmark/dnspy

# 2. Update data files (optional)
make update

# 3. Configure dependencies
make configuration

# 4. Build
make build
```

After compilation, executable files for each platform will be generated in the current directory.

### Web Dashboard Development

```bash
cd web
pnpm install
pnpm dev     # Start development server
pnpm build   # Build for production
```

## Architecture

```
dnspy/
├── main.go              # Entry point
├── config.go            # Configuration & CLI argument parsing
├── runner.go            # Test executor (invokes dnspyre)
├── rank.go              # Scoring system
├── geo.go               # GeoIP location lookup
├── jsonreporter.go      # JSON result format definition
├── utils.go             # Utility functions
├── tools.go             # Helper tools
├── log.go               # Logging system
├── res/                 # Resource files
│   ├── providers.txt    # DNS server list (1000+)
│   ├── domains.txt      # Test domain list (10000+)
│   ├── Country.mmdb     # GeoIP database
│   └── template.html    # HTML output template (legacy)
├── web/                 # Web dashboard
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Pages
│       ├── contexts/    # State management
│       ├── locales/     # Internationalization
│       └── utils.js     # Utility functions
└── scripts/             # Helper scripts
```

### Tech Stack

**Backend (Testing Tool)**
- [Go](https://golang.org/) — High-performance compiled language
- [dnspyre](https://github.com/Tantalor93/dnspyre) — DNS benchmarking engine
- [geoip2-golang](https://github.com/oschwald/geoip2-golang) — GeoIP database reader
- [pflag](https://github.com/spf13/pflag) — CLI argument parsing
- [logrus](https://github.com/sirupsen/logrus) — Structured logging

**Frontend (Dashboard)**
- [React 18](https://react.dev/) — UI framework
- [NextUI](https://nextui.org/) — React component library
- [TailwindCSS](https://tailwindcss.com/) — CSS framework
- [Chart.js](https://www.chartjs.org/) — Data visualization
- [Framer Motion](https://www.framer.com/motion/) — Animation engine
- [react-i18next](https://react.i18next.com/) — Internationalization
- [Rsbuild](https://rsbuild.dev/) — Build tool

## License

This project is open source. Contributions and suggestions are welcome.

---

**DNSPY** — Making DNS benchmarking simple and powerful.