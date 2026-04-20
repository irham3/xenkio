import { SvgOptimizerOptions } from './types';

export const SVGO_CDN_URL =
  'https://cdn.jsdelivr.net/npm/svgo@3/dist/svgo.browser.js';

export const DEFAULT_PLUGINS = [
  {
    name: 'removeDoctype',
    label: 'Remove DOCTYPE',
    description: 'Removes the DOCTYPE declaration',
    enabled: true,
  },
  {
    name: 'removeXMLProcInst',
    label: 'Remove XML Processing Instruction',
    description: 'Removes XML processing instructions',
    enabled: true,
  },
  {
    name: 'removeComments',
    label: 'Remove Comments',
    description: 'Removes all SVG comments',
    enabled: true,
  },
  {
    name: 'removeMetadata',
    label: 'Remove Metadata',
    description: 'Removes <metadata> elements',
    enabled: true,
  },
  {
    name: 'removeEditorsNSData',
    label: 'Remove Editor Data',
    description: 'Removes Inkscape, Illustrator, and other editor namespace data',
    enabled: true,
  },
  {
    name: 'cleanupAttrs',
    label: 'Clean Attributes',
    description: 'Cleans up attribute whitespace',
    enabled: true,
  },
  {
    name: 'mergeStyles',
    label: 'Merge Styles',
    description: 'Merges multiple <style> elements into one',
    enabled: true,
  },
  {
    name: 'inlineStyles',
    label: 'Inline Styles',
    description: 'Moves CSS declarations from <style> to element attributes',
    enabled: true,
  },
  {
    name: 'minifyStyles',
    label: 'Minify Styles',
    description: 'Minifies inline CSS with csso',
    enabled: true,
  },
  {
    name: 'cleanupIds',
    label: 'Clean IDs',
    description: 'Removes and minifies unused IDs',
    enabled: true,
  },
  {
    name: 'removeUselessDefs',
    label: 'Remove Useless Defs',
    description: 'Removes elements in <defs> that are not referenced',
    enabled: true,
  },
  {
    name: 'cleanupNumericValues',
    label: 'Clean Numeric Values',
    description: 'Rounds numeric values to reduce precision',
    enabled: true,
  },
  {
    name: 'convertColors',
    label: 'Convert Colors',
    description: 'Converts color values to shorter equivalents',
    enabled: true,
  },
  {
    name: 'removeUnknownsAndDefaults',
    label: 'Remove Defaults',
    description: 'Removes unknown elements and attributes, and default values',
    enabled: true,
  },
  {
    name: 'removeNonInheritableGroupAttrs',
    label: 'Remove Non-inheritable Group Attrs',
    description: 'Removes non-inheritable group presentation attributes',
    enabled: true,
  },
  {
    name: 'removeUselessStrokeAndFill',
    label: 'Remove Useless Stroke/Fill',
    description: 'Removes useless stroke and fill attributes',
    enabled: true,
  },
  {
    name: 'removeViewBox',
    label: 'Remove ViewBox',
    description: 'Removes viewBox attribute when possible',
    enabled: false,
  },
  {
    name: 'cleanupEnableBackground',
    label: 'Clean enable-background',
    description: 'Removes or cleans up the enable-background attribute',
    enabled: true,
  },
  {
    name: 'removeHiddenElems',
    label: 'Remove Hidden Elements',
    description: 'Removes hidden or invisible elements',
    enabled: true,
  },
  {
    name: 'removeEmptyText',
    label: 'Remove Empty Text',
    description: 'Removes empty text elements',
    enabled: true,
  },
  {
    name: 'convertShapeToPath',
    label: 'Convert Shapes to Path',
    description: 'Converts basic shapes (rect, circle, etc.) to paths',
    enabled: false,
  },
  {
    name: 'convertEllipseToCircle',
    label: 'Convert Ellipse to Circle',
    description: 'Converts ellipses to circles where possible',
    enabled: true,
  },
  {
    name: 'moveElemsAttrsToGroup',
    label: 'Move Attrs to Group',
    description: 'Moves common attributes to group elements',
    enabled: true,
  },
  {
    name: 'moveGroupAttrsToElems',
    label: 'Move Group Attrs to Elements',
    description: 'Moves some group attributes to element children',
    enabled: true,
  },
  {
    name: 'collapseGroups',
    label: 'Collapse Groups',
    description: 'Collapses useless groups',
    enabled: true,
  },
  {
    name: 'convertPathData',
    label: 'Convert Path Data',
    description: 'Optimizes path data: converting absolute to relative coords, removing redundant commands, etc.',
    enabled: true,
  },
  {
    name: 'convertTransform',
    label: 'Convert Transforms',
    description: 'Collapses multiple transforms into one and converts matrices to short equivalents',
    enabled: true,
  },
  {
    name: 'removeEmptyAttrs',
    label: 'Remove Empty Attributes',
    description: 'Removes empty attributes',
    enabled: true,
  },
  {
    name: 'removeEmptyContainers',
    label: 'Remove Empty Containers',
    description: 'Removes empty container elements',
    enabled: true,
  },
  {
    name: 'mergePaths',
    label: 'Merge Paths',
    description: 'Merges multiple paths into one if possible',
    enabled: true,
  },
  {
    name: 'removeUnusedNS',
    label: 'Remove Unused Namespaces',
    description: 'Removes unused namespace declarations',
    enabled: true,
  },
  {
    name: 'sortDefsChildren',
    label: 'Sort Defs Children',
    description: 'Sorts children of <defs> for better gzip compression',
    enabled: true,
  },
  {
    name: 'removeTitle',
    label: 'Remove Title',
    description: 'Removes <title> elements (may affect accessibility)',
    enabled: false,
  },
  {
    name: 'removeDesc',
    label: 'Remove Description',
    description: 'Removes <desc> elements',
    enabled: true,
  },
];

export const DEFAULT_OPTIONS: SvgOptimizerOptions = {
  svg: '',
  multipass: true,
  plugins: DEFAULT_PLUGINS,
};

export const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Inkscape SVG Export -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="200px" height="200px" viewBox="0 0 200 200">
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about=""/>
    </rdf:RDF>
  </metadata>
  <defs>
    <style type="text/css">
      .st0 {
        fill: #FF6B6B;
      }
      .st1 {
        fill: #4ECDC4;
        stroke: #000000;
        stroke-width: 2px;
      }
    </style>
  </defs>
  <rect x="0" y="0" width="200" height="200" fill="#FFFFFF" opacity="1.0"/>
  <g id="layer1" transform="translate(0, 0) scale(1, 1)">
    <circle class="st0" cx="100.0" cy="100.0" r="80.000" />
    <rect class="st1" x="60.0" y="60.0" width="80.000" height="80.000" rx="10.0" ry="10.0"/>
    <path d="M 100.0,30.0 L 170.0,150.0 L 30.0,150.0 Z" fill="#45B7D1" stroke="none"/>
  </g>
</svg>`;
