
export const SAMPLE_YAML = `# Xenkio Tool Configuration
name: xenkio
version: 1.0.0
description: All-in-One Productivity Tools

server:
  host: localhost
  port: 3000
  ssl: true

features:
  - id: yaml-validator
    name: YAML Validator
    tags:
      - developer
      - data
      - format
  - id: json-formatter
    name: JSON Formatter
    tags:
      - developer
      - data

author:
  name: Altruis
  url: https://xenkio.com

settings:
  theme: light
  notifications: true
  maxRetries: 3
`;

export const SAMPLE_JSON_FOR_YAML = `{
  "name": "xenkio",
  "version": "1.0.0",
  "description": "All-in-One Productivity Tools",
  "server": {
    "host": "localhost",
    "port": 3000,
    "ssl": true
  },
  "features": [
    { "id": "yaml-validator", "name": "YAML Validator" },
    { "id": "json-formatter", "name": "JSON Formatter" }
  ],
  "author": {
    "name": "Altruis",
    "url": "https://xenkio.com"
  }
}`;
