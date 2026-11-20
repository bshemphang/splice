import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface ClipSpec {
  title: string;
  sourceUrl: string;
  sourceMoment: string;
  publishedUrl: string;
  durationSeconds: number;
  width: number;
  height: number;
  frameRate: number;
  videoCodec: string;
  audioCodec: string;
  hookLines: string[];
  pitchLines: string[];
  playCode: string;
  bountyPage: string;
}

interface Verification {
  clipFilePresent: boolean;
  ffprobeAvailable: boolean;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  hasAudio: boolean;
  checksPassed: string[];
  checksFailed: string[];
}

const CLIP: ClipSpec = {
  title: "Splice",
  sourceUrl: "https://www.youtube.com/watch?v=DcVBNKZP6xg",
  sourceMoment: "0:04-0:34",
  publishedUrl: "https://youtube.com/shorts/5HU39t_PDIU",
  durationSeconds: 30,
  width: 1080,
  height: 1920,
  frameRate: 30,
  videoCodec: "h264",
  audioCodec: "aac",
  hookLines: ["HE STOLE HER SCOOTER", "HE FELT BAD INSTANTLY"],
  pitchLines: [
    "Make clips like this with AI",
    "and earn money on make.fun",
    "make.fun/bounty/gta6-clipper-01",
  ],
  playCode: "makefun-rain-grain-bistro",
  bountyPage: "https://make.fun/bounty/gta6-clipper-01",
};

const YOUTUBE_URL =
  /^https:\/\/(www\.|m\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}($|[?&#])/;

function botDir(): string {
  return process.env.MAKEFUN_BOT_DIR ?? dirname(fileURLToPath(import.meta.url));
}

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "out";
}

function verifyClip(root: string): Verification {
  const result: Verification = {
    clipFilePresent: false,
    ffprobeAvailable: false,
    durationSeconds: null,
    width: null,
    height: null,
    hasAudio: false,
    checksPassed: [],
    checksFailed: [],
  };
  const clipPath = join(root, "work", "splice-v1.mp4");
  if (!existsSync(clipPath)) {
    result.checksFailed.push("clip file work/splice-v1.mp4 not present in this snapshot");
    return result;
  }
  result.clipFilePresent = true;
  let probe: {
    format?: { duration?: string };
    streams?: Array<{ codec_type?: string; width?: number; height?: number; codec_name?: string }>;
  };
  try {
    const raw = execFileSync(
      "ffprobe",
      ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", clipPath],
      { encoding: "utf8", timeout: 15000 },
    );
    probe = JSON.parse(raw) as typeof probe;
    result.ffprobeAvailable = true;
  } catch {
    result.checksFailed.push("ffprobe not available or failed on the clip file");
    return result;
  }
  const duration = probe.format?.duration ? Number(probe.format.duration) : NaN;
  if (Number.isFinite(duration)) {
    result.durationSeconds = duration;
    if (Math.abs(duration - CLIP.durationSeconds) < 0.5) {
      result.checksPassed.push(`duration ${duration.toFixed(2)}s matches ${CLIP.durationSeconds}s`);
    } else {
      result.checksFailed.push(`duration ${duration.toFixed(2)}s differs from ${CLIP.durationSeconds}s`);
    }
  }
  for (const stream of probe.streams ?? []) {
    if (stream.codec_type === "video") {
      result.width = stream.width ?? null;
      result.height = stream.height ?? null;
      if (stream.width === CLIP.width && stream.height === CLIP.height) {
        result.checksPassed.push(`resolution ${stream.width}x${stream.height} matches vertical Short`);
      } else {
        result.checksFailed.push(`resolution ${stream.width}x${stream.height} is not ${CLIP.width}x${CLIP.height}`);
      }
      if (stream.codec_name === CLIP.videoCodec) {
        result.checksPassed.push(`video codec ${stream.codec_name} matches`);
      }
    }
    if (stream.codec_type === "audio") {
      result.hasAudio = true;
      if (stream.codec_name === CLIP.audioCodec) {
        result.checksPassed.push(`audio codec ${stream.codec_name} matches`);
      }
    }
  }
  if (!result.hasAudio) {
    result.checksFailed.push("no audio stream found in the clip");
  }
  return result;
}

function main(): void {
  const root = botDir();
  const out = outputDir();
  mkdirSync(out, { recursive: true });

  const videoPath = join(root, "VIDEO.json");
  const videoRaw = readFileSync(videoPath, "utf8");
  const video = JSON.parse(videoRaw) as { url?: unknown };
  if (typeof video !== "object" || video === null || typeof video.url !== "string") {
    throw new Error("VIDEO.json must be an object with a string url");
  }
  if (!YOUTUBE_URL.test(video.url)) {
    throw new Error(`VIDEO.json url is not a YouTube video address: ${video.url}`);
  }

  copyFileSync(videoPath, join(out, "VIDEO.json"));

  const verification = verifyClip(root);
  if (video.url !== CLIP.publishedUrl) {
    verification.checksFailed.push(
      `VIDEO.json url ${video.url} differs from the clip manifest publishedUrl ${CLIP.publishedUrl}`,
    );
  } else {
    verification.checksPassed.push("VIDEO.json url matches the clip manifest publishedUrl");
  }
  const manifest = {
    entry: "gta6-clipper-01",
    brand: "Splice",
    clip: CLIP,
    video: { url: video.url },
    verification,
  };
  writeFileSync(join(out, "clip-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(manifest, null, 2));
}

main();
