#!/bin/bash
set -e
cd /Users/abhi/proj/sensei/ship-fast-all/ship-fast

WITH_DIR=".forge/nonthink-bench/with-prefill"
WITHOUT_DIR=".forge/nonthink-bench/without-prefill"
mkdir -p "$WITH_DIR" "$WITHOUT_DIR"

PROMPTS=(
  "A cozy neighborhood coffee shop called Brew & Bloom with online ordering, a blog about brewing techniques, and a photo gallery"
  "A SaaS analytics platform called DataPulse for monitoring API health, uptime tracking, and incident management with team alerts"
  "A fitness coaching platform called IronClad with workout tracking, trainer booking, and a pricing page"
  "An online store for handmade ceramic pottery called Clay & Craft with product catalog, cart, and artist stories"
  "An Italian restaurant called Trattoria Bella with a menu, reservation booking, and chef specials"
)

echo "=== WITH prefill (current code — no thinking) ==="
for i in 0 1 2 3 4; do
  echo "--- Prompt $((i+1)) ---"
  HOMEPAGE_MODEL=openai/gpt-oss-120b timeout 60 bun scripts/bench-quality.mjs "${PROMPTS[$i]}" "$WITH_DIR/prompt-$((i+1)).txt" 2>&1
done
