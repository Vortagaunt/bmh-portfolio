#!/usr/bin/env node
import { createWriteStream, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ASSETS = [
  // Hero vintage Mac
  { url: "https://framerusercontent.com/images/DzpNvOVYBsbBtYnWd9beA8kpc.png", out: "public/images/vintage-mac.png" },
  // Project covers (image variants)
  { url: "https://framerusercontent.com/images/aHaWQYLedKAgFgBVDIsYTikxfWQ.png", out: "public/images/email-emily.png" },
  { url: "https://framerusercontent.com/images/Yd7bmlYMlhNPdvDcvqQ1BuekW5E.png", out: "public/images/navigation-redesign.png" },
  { url: "https://framerusercontent.com/images/d1COvSSaVB9z7CfFXmAuXPIKvY.png", out: "public/images/fund-catalogue.png" },
  // About portrait
  { url: "https://framerusercontent.com/images/RskGZ8KzPHa6mSiQWTwdknvy5Ok.jpg", out: "public/images/sahor-portrait.jpg" },
  // Phone.obj footer
  { url: "https://framerusercontent.com/images/SRdJpd2k6rJLlOIevZ6bommO0.png", out: "public/images/phone-obj.png" },
  // Video posters
  { url: "https://framerusercontent.com/images/sWMyVYc484NZIMEFt8UcJyUZo.png", out: "public/images/email-emily-poster.png" },
  { url: "https://framerusercontent.com/images/iIfvBX8XDhZxf9izUCM49bszTKc.png", out: "public/images/navigation-redesign-poster.png" },
  { url: "https://framerusercontent.com/images/QoUtJaFJwjzpmlgRuB8m0Vn8Nok.png", out: "public/images/fund-catalogue-poster.png" },
  // Videos (autoloop project previews)
  { url: "https://framerusercontent.com/assets/TdfE7hsAgQfWqVSkhp8M2XipBE.webm", out: "public/videos/email-emily.webm" },
  { url: "https://framerusercontent.com/assets/sjxQ2qprBcpjtCuN4TXObnEKCs.mp4", out: "public/videos/navigation-redesign.mp4" },
  { url: "https://framerusercontent.com/assets/l09Q5W2PoqzzL8WCrYK81DPCLLE.mp4", out: "public/videos/fund-catalogue.mp4" },
  // Favicons
  { url: "https://framerusercontent.com/images/AI158bzEiEAY8LseimWOuijvw.png", out: "public/seo/favicon.png" },
  { url: "https://framerusercontent.com/images/LmqtMixJOo8H8YLRoj2IWkEjKg.png", out: "public/seo/favicon-alt.png" },
  { url: "https://framerusercontent.com/images/C2s8b6YGvk6GbU8H0GoYfC2l2s8.png", out: "public/seo/apple-touch-icon.png" },
];

async function dl({ url, out }) {
  const target = path.join(ROOT, out);
  mkdirSync(path.dirname(target), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(target));
  console.log("✓", out);
}

async function main() {
  const queue = [...ASSETS];
  const concurrency = 4;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (queue.length) {
        const job = queue.shift();
        try {
          await dl(job);
        } catch (e) {
          console.error("✗", job.out, e.message);
        }
      }
    })
  );
}

main();
