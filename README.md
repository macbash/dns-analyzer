
# DNS Inspector

A lightweight TypeScript CLI for DNS inspection and troubleshooting.

DNS Inspector provides DNS record resolution, IP addresses, and TTL information through a simple command-line interface. The project is being developed toward an enterprise-grade DNS troubleshooting and diagnostics tool with support for authoritative DNS queries, DNS delegation analysis, TTL investigation, and cloud DNS validation.

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
