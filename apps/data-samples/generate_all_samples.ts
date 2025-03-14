import { spawn } from "child_process";
import path from "path";

const __dirname = import.meta.dirname;

const TYPES = [
  "basic_numbers",
  "time_series",
  "geospatial",
  "categorical",
  "correlated",
] as const;
const SIZES = ["tiny", "small", "medium", "large", "huge"] as const;
const OUTPUT_DIR = "generated_samples";

interface GenerationTask {
  type: (typeof TYPES)[number];
  size: (typeof SIZES)[number];
}

// Helper to run the sample_data.ts script with given parameters
function generateSample(task: GenerationTask): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use npx to ensure we can find ts-node
    const process = spawn("pnpx", [
      "tsx",
      path.join(__dirname, "sample_data.ts"),
      "--type",
      task.type,
      "--size",
      task.size,
      "--output",
      OUTPUT_DIR,
    ]);

    // Add error logging
    process.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    process.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Generation failed with code ${code}`));
      }
    });

    process.on("error", reject);
  });
}

async function generateAll() {
  console.log("Starting sample data generation...");
  const startTime = Date.now();

  // Create all combinations of types and sizes
  const tasks: GenerationTask[] = TYPES.flatMap((type) =>
    SIZES.map((size) => ({ type, size }))
  );

  const total = tasks.length;
  let completed = 0;

  // Process tasks sequentially to avoid overwhelming the system
  for (const task of tasks) {
    completed++;
    console.log(
      `[${completed}/${total}] Generating ${task.type} (${task.size})...`
    );

    try {
      await generateSample(task);
    } catch (error) {
      console.error(`Failed to generate ${task.type}_${task.size}:`, error);
    }
  }

  // Calculate and display total time
  const duration = (Date.now() - startTime) / 1000;
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  console.log("\n✨ Generation complete!");
  console.log(`Generated ${completed} files in ${minutes}m ${seconds}s`);
  console.log(`Files are located in: ${path.resolve(OUTPUT_DIR)}`);
}

// Start generation
generateAll().catch((error) => {
  console.error("Generation failed:", error);
  process.exit(1);
});
