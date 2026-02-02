# Xenkio

> **"Your innovative toolkit for modern work"**

A comprehensive collection of online utilities for developers, designers, and digital professionals.

## The Name Behind Xenkio

### XEN — *From Greek "xenos" (ξένος)*

- **Meaning:** Foreign, new, innovative, different
- **In tech context:** Cutting-edge, modern, forward-thinking

### KIO — *From Japanese "器" (utsuwa/ki)*

- **Meaning:** Tool, vessel, container, instrument
- **Modern interpretation:** "Key" in pronunciation

### XENKIO = **"Innovative Tools"** or **"Key to Innovation"**

## Positioning

**Xenkio - Your innovative toolkit for modern work**

### Our Promise

- **Every tool you need. One platform.**
- **Tools that work as smart as you do.**
- **Professional tools. Zero complexity.**

## Overview

Xenkio provides a suite of web-based tools designed to streamline common digital tasks. All tools run entirely in your browser, ensuring your data remains private and secure.

### Why Choose Xenkio?

- **Fast** — Instant results without waiting
- **Private** — All processing happens locally in your browser
- **Modern** — Beautiful, intuitive interface
- **Free** — No subscriptions, no hidden fees

## Browser Support

Xenkio supports the latest versions of:

| Browser | Support |
|---------|---------|
| Chrome  | Yes |
| Firefox | Yes |
| Safari  | Yes |
| Edge    | Yes |


## Acknowledgments

Built with modern web technologies and inspired by the need for fast, reliable, and privacy-focused online tools.

Special thanks to all contributors who have helped improve Xenkio.


<p align="center">
  <strong>Xenkio</strong> — Every tool you need. One platform.
</p>

## Development & Deployment

This project is configured for deployment on **Cloudflare Workers** using **OpenNext**.

### Prerequisites

- Node.js (Latest LTS recommended)
- Cloudflare Account
- Wrangler CLI (`npm install -g wrangler` or use `npx`)

### Commands

- **`npm run dev`**: Start the Next.js local development server.
- **`npm run preview`**: Preview the Worker build locally using Wrangler (approximates the edge environment).
- **`npm run build:worker`**: Build the application for Cloudflare Workers (generates `.open-next` output).
- **`npm run deploy`**: Deploy the application to Cloudflare Workers.
- **`npm run cf-typegen`**: Generate TypeScript types for Cloudflare bindings.

### Deployment Configuration

The deployment is managed via `wrangler.jsonc` and `open-next.config.ts`.

- **`wrangler.jsonc`**: Contains Cloudflare Worker settings (name, compatibility, assets).
- **`open-next.config.ts`**: Configuration for the OpenNext adapter.

### Important Note on Caching

The default OpenNext configuration uses Cloudflare R2 for incremental cache (ISR). Ensure you have an R2 bucket set up and bound in `wrangler.jsonc` if you plan to use ISR features, or modify `open-next.config.ts` to use a different cache store (like KV) if preferred.