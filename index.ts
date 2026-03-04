import { parse } from "bpu-ts";
import { TransformTx } from "bmapjs/src/bmap";
import type { BmapTx, BobTx, MAP } from "bmapjs/src/types/common";

// Your raw transaction hex here. this one is taken from https://whatsonchain.com/tx/28a22d135c27605300006235baacea727c9c0dedb7500160a87d59e0d4e0bf60
const TX_HEX =
  "0100000001d812c2322231573d391fd6070071192e8bf2d981e9897f6503c91170a31cb2a5030000006a47304402202f98e220b0e354496dc2e08a4c0c1758aad220375456c27c41ff11a5b4d0500c0220566188f842c7e7e0fc9fc85b084eb298aef90f2661d23ccd53650ce3f90715ef412102708d7099dc7fa135d81669c06ab550a7f7aad1878f3c9cfd4184b66ee6d5c3a7ffffffff07f3710000000000001976a9147f4564fab35729b397f5b73dd8ea069dc508608888acb77a0000000000001976a9144b8b0c61065e1e615bae2ec5410fdbd51112802a88accfab0000000000001976a914a8db0f7005bdf4c38491855ea0d8536e475dd41088acdfa30000000000001976a91424e37b905e0c2a0e1bffec97db63fd5aaad1279a88ac3c390000000000001976a91409cc4559bdcb84cb35c107743f0dbb10d66679cc88ac0000000000000000ad006a223150755161374b36324d694b43747373534c4b79316b683536575755374d74555235035345540361707008746f6e6963706f7704747970650b6f666665725f636c69636b106f666665725f73657373696f6e5f696440653162383835613737633733393834376166633862343864656163316265636161383131386538383734616133626239376264643939623231643335343263630f6f666665725f636f6e6669675f696403313736b82b3e2b000000001976a914c5b6790c814b363c44f283f7dd3d1726f8b89d3388ac00000000";

/**
 * Parse raw transaction using BPU
 */
async function bobFromRawTx(rawtx: string): Promise<BobTx> {
  try {
    const result = await parse({
      tx: { r: rawtx },
    });

    if (!result) {
      throw new Error("No result from parsing transaction");
    }

    return result as BobTx;
  } catch (error) {
    console.error("Error parsing raw transaction:", error);
    throw new Error(
      `Failed to parse transaction: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Extract MAP protocol data from raw transaction
 */
async function extractMAPData(txHex: string): Promise<MAP[] | null> {
  try {
    console.log("🔍 Processing transaction...");

    // Step 1: Parse raw transaction with BPU
    console.log("📦 Step 1: Parsing with BPU...");
    const bobTx = await bobFromRawTx(txHex);
    console.log("✅ BPU parsing complete");

    // Step 2: Transform to BMAP format
    console.log("🔄 Step 2: Transforming with BMAP...");
    const bmapTx: BmapTx = await TransformTx(bobTx);
    console.log("✅ BMAP transformation complete");

    // Step 3: Check for MAP protocol data
    console.log("🔎 Step 3: Checking for MAP protocol...");

    if (!bmapTx.MAP || bmapTx.MAP.length === 0) {
      console.log("❌ No MAP protocol data found in transaction");
      return null;
    }

    console.log(`✅ Found ${bmapTx.MAP.length} MAP output(s)`);
    return bmapTx.MAP;
  } catch (error) {
    console.error("❌ Error extracting MAP data:", error);
    return null;
  }
}

/**
 * Pretty print MAP data
 */
function printMAPData(mapData: MAP[] | null) {
  if (!mapData) {
    console.log("\n📭 No MAP data to display");
    return;
  }

  console.log("\n📋 MAP Protocol Data:");
  console.log("=".repeat(50));

  mapData.forEach((mapOutput, index) => {
    console.log(`\n📤 Output #${index + 1}:`);
    console.log("-".repeat(30));

    // MAP data in bmapjs is an object with parsed key-value pairs
    const mapObj = mapOutput as Record<string, any>;

    Object.entries(mapObj).forEach(([key, value]) => {
      if (key !== "protocol" && key !== "address") {
        console.log(`  ${key}: ${value}`);
      }
    });

    if (mapObj.address) {
      console.log(`  Address: ${mapObj.address}`);
    }
  });

  console.log("\n" + "=".repeat(50));
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 MAP Protocol Extractor\n");

  // You can also load from a file if needed
  // import { TX_HEX } from './transaction-hex.js';

  const mapData = await extractMAPData(TX_HEX);

  if (mapData) {
    printMAPData(mapData);

    // Example: Access specific MAP fields
    console.log("\n🔍 Raw MAP data for programmatic use:");
    console.log(JSON.stringify(mapData, null, 2));
  }

  console.log("\n✨ Done!");
}

// Run the main function
main().catch(console.error);
