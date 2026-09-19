# DNS Inspector

A lightweight TypeScript CLI for DNS inspection and troubleshooting.

DNS Inspector provides DNS record resolution, IP addresses, and TTL information through a simple command-line interface. The project is being developed toward an enterprise-grade DNS troubleshooting and diagnostics tool with support for authoritative DNS queries, DNS delegation analysis, TTL investigation, and cloud DNS validation.

---

## Table of Contents

- [Features](#features)
- [Why DNS Inspector?](#why-dns-inspector)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Input File Format](#input-file-format)
- [Command Reference](#command-reference)
- [TTL Behavior](#ttl-behavior)
- [Authoritative DNS](#authoritative-dns)
- [DNS Delegation](#dns-delegation)
- [DNS Troubleshooting Use Cases](#dns-troubleshooting-use-cases)
- [Roadmap](#roadmap)
- [Development](#development)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Example Workflow](#example-workflow)
- [Contributing](#contributing)

---

## Features

- IPv4 (`A`) record lookup
- IPv6 (`AAAA`) record lookup
- DNS TTL information
- IPv4 / IPv6 selection
- Batch DNS lookup from a file
- Duplicate hostname handling
- Blank-line handling
- Comment support in input files
- TypeScript implementation
- CLI-friendly output
- Authoritative DNS lookup support *(planned)*

---

## Why DNS Inspector?

DNS troubleshooting often starts with a simple DNS lookup:

```text
hostname → DNS resolver → IP address
```

However, the DNS resolver used by the operating system or corporate network is usually a **recursive DNS resolver**. Recursive resolvers cache DNS responses.

For example, an authoritative DNS record may have:

```text
TTL = 600 seconds
```

When querying through a recursive resolver, you may see:

```text
Query 1 → TTL 600
Query 2 → TTL 594
Query 3 → TTL 587
Query 4 → TTL 580
```

This does not necessarily mean that the DNS configuration changed. The authoritative DNS server may still have `TTL = 600`.

The difference is between:

| Term | Meaning |
|------|---------|
| **Authoritative TTL** | TTL returned by the authoritative DNS server |
| **Remaining cached TTL** | TTL remaining in a recursive resolver cache |

DNS Inspector is being developed to make this distinction easier during DNS troubleshooting.

---

## Architecture

### Current Resolution Flow

The current implementation uses the Node.js DNS resolution APIs.

```text
                    DNS Inspector
                          |
                          v
                    Node.js DNS API
                          |
                          v
              Local / Corporate Resolver
                          |
                          v
                  DNS Infrastructure
                          |
                          v
                     A / AAAA
                          |
                          v
                  IP Address + TTL
```

Because the lookup uses the configured DNS resolver, the returned TTL can represent the **remaining cached TTL**.

### Planned Authoritative Resolution Flow

The next major capability is direct authoritative DNS lookup.

```text
                    DNS Inspector
                          |
                          v
                  Discover DNS NS
                          |
                          v
              Find authoritative NS
                          |
                          v
              Resolve NS IP address
                          |
                          v
          Query authoritative DNS server
                          |
                          v
                     A / AAAA
                          |
                          v
                 Authoritative TTL
```

This will allow DNS Inspector to inspect DNS records directly from authoritative nameservers instead of relying only on the local recursive resolver.

---

## Requirements

- Node.js 20+
- npm
- TypeScript

The project has been tested with modern Node.js versions.

---

## Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Change into the project directory:

```bash
cd dns-inspector
```

Install dependencies:

```bash
npm install
```

---

## Usage

### IPv4 DNS Lookup

IPv4 is the default lookup mode.

```bash
npm run dns -- bing.com
```

Example output:

```text
DNS Lookup: bing.com
================================================================================
┌─────────┬────────────┬────────────┬─────────────────────┬─────┐
│ (index) │ hostname   │ recordType │ address             │ ttl │
├─────────┼────────────┼────────────┼─────────────────────┼─────┤
│ 0       │ 'bing.com' │ 'A'        │ '150.171.28.10'     │ 600 │
│ 1       │ 'bing.com' │ 'A'        │ '150.171.27.10'     │ 600 │
└─────────┴────────────┴────────────┴─────────────────────┴─────┘
```

### IPv6 DNS Lookup

Use the `--ipv6` option to query IPv6 (`AAAA`) records.

```bash
npm run dns -- bing.com --ipv6
```

Example output:

```text
DNS Lookup: bing.com
================================================================================
┌─────────┬────────────┬────────────┬─────────────────────┬─────┐
│ (index) │ hostname   │ recordType │ address             │ ttl │
├─────────┼────────────┼────────────┼─────────────────────┼─────┤
│ 0       │ 'bing.com' │ 'AAAA'     │ '2620:1ec:33::10'   │ 600 │
│ 1       │ 'bing.com' │ 'AAAA'     │ '2620:1ec:33:1::10' │ 600 │
└─────────┴────────────┴────────────┴─────────────────────┴─────┘
```

### Explicit IPv4 Lookup

You can explicitly specify IPv4 using `--ipv4`.

```bash
npm run dns -- bing.com --ipv4
```

This is equivalent to the default behavior:

```bash
npm run dns -- bing.com
```

### Batch DNS Lookup

DNS Inspector supports processing multiple hostnames from a file.

Create a file named `dns-list.txt`:

```text
google.com
bing.com
github.com

# Production endpoints
api.example.com
www.example.com
```

Run the batch lookup:

```bash
npm run dns -- --file dns-list.txt
```

By default, this performs IPv4 (`A`) lookups.

### Batch IPv6 Lookup

Use `--ipv6` with the file option:

```bash
npm run dns -- --file dns-list.txt --ipv6
```

This performs IPv6 (`AAAA`) lookups for every hostname in the file.

---

## Input File Format

The DNS input file supports the following.

### One hostname per line

```text
google.com
bing.com
github.com
```

### Blank lines

Blank lines are ignored.

```text
google.com

bing.com

github.com
```

### Comments

Lines beginning with `#` are ignored.

```text
# Public DNS endpoints
google.com
bing.com

# Developer resources
github.com
```

### Duplicate hostnames

Duplicate hostnames are automatically removed.

For example:

```text
google.com
bing.com
google.com
github.com
bing.com
```

will process:

```text
google.com
bing.com
github.com
```

only once.

---

## Command Reference

| Command | Description |
|---------|-------------|
| `npm run dns -- example.com` | IPv4 (`A`) lookup |
| `npm run dns -- example.com --ipv4` | IPv4 (`A`) lookup |
| `npm run dns -- example.com --ipv6` | IPv6 (`AAAA`) lookup |
| `npm run dns -- --file dns-list.txt` | Batch IPv4 lookup |
| `npm run dns -- --file dns-list.txt --ipv4` | Batch IPv4 lookup |
| `npm run dns -- --file dns-list.txt --ipv6` | Batch IPv6 lookup |

---

## TTL Behavior

TTL stands for **Time To Live**. It determines how long a DNS response may be cached.

For example:

```text
A record
    |
    +-- IP: 192.0.2.10
    |
    +-- TTL: 600 seconds
```

When an authoritative DNS server returns `TTL = 600`, a recursive resolver may cache the response. If you query that recursive resolver later, you might see:

```text
600
594
588
582
```

The decreasing value represents the **remaining cache lifetime**. When the resolver refreshes the record, the TTL can return to approximately `600`.

Therefore:

```text
Authoritative TTL
        ≠
Remaining recursive-cache TTL
```

This distinction is particularly important when troubleshooting:

- DNS changes
- DNS migrations
- Application connectivity
- Load balancer changes
- Route 53 changes
- DNS propagation
- Failover
- Disaster recovery
- Cloud migrations

---

## Authoritative DNS

### Planned Capability

DNS Inspector is being developed to support direct authoritative DNS queries.

The intended workflow is:

```text
example.com
     |
     v
Find authoritative NS
     |
     v
ns1.example.com
ns2.example.com
     |
     v
Resolve nameserver IP
     |
     v
Query authoritative server
     |
     v
A / AAAA response
     |
     v
Authoritative TTL
```

This avoids relying solely on the local recursive resolver.

For example:

```text
Local recursive resolver

Query 1 → TTL 600
Query 2 → TTL 594
Query 3 → TTL 587
```

versus:

```text
Authoritative DNS server

Query 1 → TTL 600
Query 2 → TTL 600
Query 3 → TTL 600
```

> The exact response can vary depending on the DNS infrastructure and authoritative nameserver queried.

---

## DNS Delegation

A future version will support DNS delegation analysis.

For example:

```text
www.example.com
       |
       v
example.com
       |
       v
Authoritative Nameservers
       |
       +---- ns1.example.com
       |
       +---- ns2.example.com
```

For delegated subdomains:

```text
api.example.com
       |
       v
example.com
       |
       v
Delegated Zone
       |
       +---- ns1.api.example.com
       +---- ns2.api.example.com
```

DNS Inspector will eventually identify the authoritative zone and the nameservers responsible for the requested hostname.

---

## DNS Troubleshooting Use Cases

DNS Inspector is intended to help with common infrastructure and DevOps troubleshooting scenarios.

### 1. DNS Resolution

Check whether a hostname resolves:

```bash
npm run dns -- api.example.com
```

### 2. IPv4 / IPv6 Validation

IPv4:

```bash
npm run dns -- api.example.com
```

IPv6:

```bash
npm run dns -- api.example.com --ipv6
```

This can help identify situations where:

```text
A     → available
AAAA  → unavailable
```

or:

```text
A     → old IP
AAAA  → new IP
```

### 3. TTL Investigation

Check TTL values during DNS changes:

```bash
npm run dns -- api.example.com
```

This can help investigate whether a DNS change has propagated through the configured resolver.

### 4. DNS Migration Validation

DNS Inspector can be used during infrastructure migrations.

Before migration:

```text
api.example.com
       |
       v
Old infrastructure
```

After migration:

```text
api.example.com
       |
       v
New infrastructure
```

DNS Inspector can help validate the resulting DNS records.

### 5. Cloud Migration

The tool can eventually be used as part of cloud migration validation:

```text
On-Premises
     |
     v
DNS
     |
     v
AWS
```

Potential future integrations include:

- Amazon Route 53
- AWS CLI
- CloudWatch
- AWS Lambda
- CI/CD pipelines

---

## Roadmap

### DNS Record Types

- [x] A records
- [x] AAAA records
- [ ] CNAME
- [ ] MX
- [ ] NS
- [ ] TXT
- [ ] CAA
- [ ] SOA
- [ ] PTR

### DNS Resolution

- [x] Recursive DNS lookup
- [ ] Authoritative DNS lookup
- [ ] Authoritative nameserver discovery
- [ ] Nameserver IP resolution
- [ ] DNS delegation detection
- [ ] CNAME chain resolution
- [ ] Direct UDP DNS queries
- [ ] TCP fallback
- [ ] DNSSEC inspection

### DNS Troubleshooting

- [ ] TTL analysis
- [ ] Authoritative TTL comparison
- [ ] Multiple authoritative nameserver comparison
- [ ] DNS propagation analysis
- [ ] Nameserver consistency checks
- [ ] DNS response-time measurement
- [ ] NXDOMAIN analysis
- [ ] SERVFAIL analysis
- [ ] Timeout detection
- [ ] DNS response-code analysis

### Output Formats

Future versions may support:

- [ ] JSON
- [ ] CSV
- [ ] YAML
- [ ] Machine-readable output
- [ ] CI/CD-friendly exit codes

Example future usage:

```bash
dns-inspector api.example.com --json
```

### Enterprise / Cloud Roadmap

Future versions may include integrations for cloud and enterprise DNS environments.

**AWS**

- [ ] Route 53 lookup
- [ ] Route 53 record validation
- [ ] Route 53 health checks
- [ ] AWS account / region awareness
- [ ] Cross-account DNS validation

**Automation**

- [ ] CI/CD DNS validation
- [ ] Jenkins integration
- [ ] GitHub Actions integration
- [ ] Terraform validation
- [ ] DNS change validation
- [ ] Automated DNS health checks

**Observability**

- [ ] DNS response latency
- [ ] Availability checks
- [ ] DNS monitoring
- [ ] Prometheus metrics
- [ ] Grafana integration

---

## Development

### TypeScript Type Checking

Run the TypeScript compiler without generating JavaScript:

```bash
npx tsc --noEmit
```

A successful result means the project passed TypeScript type checking.

### Run Using tsx

You can execute the TypeScript file directly:

```bash
npx tsx dns-lookup.ts bing.com
```

### Run Using npm

The recommended approach is:

```bash
npm run dns -- bing.com
```

---

## Project Structure

```text
dns-inspector/
│
├── dns-lookup.ts
├── dns-list.txt
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

The project structure will evolve as additional DNS functionality is added. A future architecture may look like:

```text
dns-inspector/
│
├── src/
│   ├── cli/
│   ├── dns/
│   │   ├── authoritative.ts
│   │   ├── recursive.ts
│   │   ├── records.ts
│   │   └── delegation.ts
│   │
│   ├── resolvers/
│   ├── formatters/
│   └── utils/
│
├── tests/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Technology Stack

DNS Inspector is built using:

- TypeScript
- Node.js
- Node.js DNS APIs
- npm

Planned technologies may include:

- DNS packet libraries
- UDP / TCP DNS queries
- AWS SDK
- Route 53 APIs
- Prometheus
- JSON / YAML processing

---

## Example Workflow

A typical DNS troubleshooting workflow could eventually look like:

```text
             DNS Inspector
                   |
                   v
          +------------------+
          | Hostname Input   |
          +------------------+
                   |
                   v
          +------------------+
          | Record Selection |
          +------------------+
                   |
                   v
          +------------------+
          | DNS Resolution   |
          +------------------+
                   |
            +------+------+
            |             |
            v             v
       Recursive     Authoritative
            |             |
            v             v
         Cached        Direct NS
         Response       Response
            |             |
            +------+------+
                   |
                   v
          +------------------+
          | DNS Analysis     |
          +------------------+
                   |
                   v
          +------------------+
          | IP / TTL / NS    |
          +------------------+
```

---

## Contributing

Contributions, improvements, bug reports, and feature suggestions are welcome.

For significant changes, please open an issue first to discuss the proposed implementation.

When contributing:

1. Create a feature branch.
2. Make the required changes.
3. Run TypeScript validation.
4. Test the CLI.
5. Update the documentation where required.
6. Submit a pull request.
