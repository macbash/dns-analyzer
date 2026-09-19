
import { promises as dns } from "node:dns";
import { readFile } from "node:fs/promises";

interface DNSResult {
  hostname: string;
  recordType: string;
  address: string;
  ttl: number;
}

type IPVersion = "ipv4" | "ipv6";

// =====================================================
// DNS LOOKUP
// =====================================================

async function dnsLookup(
  hostname: string,
  ipVersion: IPVersion
): Promise<DNSResult[]> {

  const results: DNSResult[] = [];

  // ---------------------------------------------------
  // IPv4
  // ---------------------------------------------------

  if (ipVersion === "ipv4") {

    try {

      const records = await dns.resolve4(hostname, {
        ttl: true
      });

      for (const record of records) {

        results.push({
          hostname,
          recordType: "A",
          address: record.address,
          ttl: record.ttl
        });
      }

    } catch {
      // No A record
    }
  }

  // ---------------------------------------------------
  // IPv6
  // ---------------------------------------------------

  if (ipVersion === "ipv6") {

    try {

      const records = await dns.resolve6(hostname, {
        ttl: true
      });

      for (const record of records) {

        results.push({
          hostname,
          recordType: "AAAA",
          address: record.address,
          ttl: record.ttl
        });
      }

    } catch {
      // No AAAA record
    }
  }

  return results;
}

// =====================================================
// READ DNS FILE
// =====================================================

async function readDNSFile(
  filename: string
): Promise<string[]> {

  const content = await readFile(
    filename,
    "utf-8"
  );

  const hostnames = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.startsWith("#"));

  // Remove duplicates
  return [...new Set(hostnames)];
}

// =====================================================
// PROCESS HOSTNAME
// =====================================================

async function processHostname(
  hostname: string,
  ipVersion: IPVersion
): Promise<DNSResult[]> {

  console.log(`Looking up: ${hostname}`);

  try {

    return await dnsLookup(
      hostname,
      ipVersion
    );

  } catch (error) {

    console.error(
      `Lookup failed: ${hostname}`
    );

    if (error instanceof Error) {
      console.error(error.message);
    }

    return [];
  }
}

// =====================================================
// GET IP VERSION
// =====================================================

function getIPVersion(
  args: string[]
): IPVersion {

  const hasIPv4 =
    args.includes("--ipv4");

  const hasIPv6 =
    args.includes("--ipv6");

  // Both flags supplied
  if (hasIPv4 && hasIPv6) {

    console.error(
      "ERROR: --ipv4 and --ipv6 cannot be used together."
    );

    process.exit(1);
  }

  // IPv6 explicitly requested
  if (hasIPv6) {
    return "ipv6";
  }

  // IPv4 is the default
  return "ipv4";
}

// =====================================================
// USAGE
// =====================================================

function printUsage(): void {

  console.log("");

  console.log("DNS Lookup Tool");
  console.log("==============================");

  console.log("");

  console.log("Single DNS:");
  console.log(
    "  npm run dns -- google.com"
  );

  console.log("");

  console.log("Single DNS - IPv6:");
  console.log(
    "  npm run dns -- google.com --ipv6"
  );

  console.log("");

  console.log("DNS file:");
  console.log(
    "  npm run dns -- --file dns-list.txt"
  );

  console.log("");

  console.log("DNS file - IPv6:");
  console.log(
    "  npm run dns -- --file dns-list.txt --ipv6"
  );

  console.log("");

  console.log("Explicit IPv4:");
  console.log(
    "  npm run dns -- google.com --ipv4"
  );

  console.log("");
}

// =====================================================
// MAIN
// =====================================================

async function main(): Promise<void> {

  const args = process.argv.slice(2);

  // ---------------------------------------------------
  // Determine IP version
  // ---------------------------------------------------

  const ipVersion =
    getIPVersion(args);

  console.log("");

  console.log("DNS Lookup Tool");
  console.log("==============================");

  console.log(
    `IP Version: ${ipVersion.toUpperCase()}`
  );

  console.log("");

  // ===================================================
  // MODE 1: FILE
  //
  // IMPORTANT:
  // Check --file BEFORE single hostname.
  // ===================================================

  if (args.includes("--file")) {

    const fileIndex =
      args.indexOf("--file");

    const filename =
      args[fileIndex + 1];

    if (!filename) {

      console.error(
        "ERROR: File name is required after --file."
      );

      printUsage();

      process.exit(1);
    }

    console.log(
      `DNS Lookup File: ${filename}`
    );

    console.log(
      "=".repeat(80)
    );

    console.log("");

    try {

      const hostnames =
        await readDNSFile(filename);

      console.log(
        `DNS names found: ${hostnames.length}`
      );

      console.log("");

      if (
        hostnames.length === 0
      ) {

        console.log(
          "No DNS names found in the file."
        );

        return;
      }

      const allResults:
        DNSResult[] = [];

      // -----------------------------------------------
      // Process DNS names
      // -----------------------------------------------

      for (
        const hostname of hostnames
      ) {

        const results =
          await processHostname(
            hostname,
            ipVersion
          );

        allResults.push(
          ...results
        );
      }

      // -----------------------------------------------
      // Display results
      // -----------------------------------------------

      console.log("");

      console.log(
        "DNS Lookup Results"
      );

      console.log(
        "=".repeat(100)
      );

      console.log("");

      if (
        allResults.length === 0
      ) {

        console.log(
          `No ${ipVersion.toUpperCase()} DNS records found.`
        );

        return;
      }

      console.table(
        allResults
      );

    } catch (error) {

      console.error(
        `Unable to read file: ${filename}`
      );

      if (error instanceof Error) {

        console.error(
          error.message
        );
      }

      process.exit(1);
    }

    return;
  }

  // ===================================================
  // MODE 2: SINGLE DNS
  // ===================================================

  const hostnameArgs =
    args.filter(
      (arg) => !arg.startsWith("--")
    );

  if (hostnameArgs.length === 1) {

    const hostname =
      hostnameArgs[0];

    if (!hostname) {
      printUsage();
      process.exit(1);
    }

    console.log(
      `DNS Lookup: ${hostname}`
    );

    console.log(
      "=".repeat(80)
    );

    console.log("");

    const results =
      await processHostname(
        hostname,
        ipVersion
      );

    console.log("");

    console.log(
      "DNS Lookup Results"
    );

    console.log(
      "=".repeat(80)
    );

    console.log("");

    if (results.length === 0) {

      console.log(
        `No ${ipVersion.toUpperCase()} DNS records found for ${hostname}`
      );

      return;
    }

    console.table(
      results
    );

    return;
  }

  // ===================================================
  // INVALID ARGUMENTS
  // ===================================================

  printUsage();

  process.exit(1);
}

// =====================================================
// START APPLICATION
// =====================================================

main().catch((error) => {

  console.error(
    "Unexpected application error:"
  );

  if (error instanceof Error) {

    console.error(
      error.message
    );

  } else {

    console.error(error);
  }

  process.exit(1);
});