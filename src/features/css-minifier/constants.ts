import { IndentSize, CssMinifierOptions } from './types';

export const INDENT_SIZES: { id: IndentSize; label: string }[] = [
  { id: 2, label: '2' },
  { id: 4, label: '4' },
  { id: 8, label: '8' },
];

export const DEFAULT_OPTIONS: CssMinifierOptions = {
  css: '',
  indentSize: 2,
};

export const SAMPLE_CSS = `/* Main Layout Styles */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  color: #333333;
}

/* Header */
.header {
  background-color: #1a1a2e;
  color: #ffffff;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header .logo {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header nav ul {
  list-style: none;
  display: flex;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.header nav a {
  color: #e0e0e0;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.header nav a:hover {
  color: #ffffff;
}

/* Main Content */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .header nav ul {
    gap: 16px;
  }

  .container {
    padding: 20px 16px;
  }
}`;
