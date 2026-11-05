import React, { useState, useEffect } from 'react';
import useCountUp from '../hooks/useCountUp';

/**
 * Modern SVG Sparkline with subtle area gradient
 */
export function TrendSparkline({
  data = [12, 18, 15, 24, 22, 28, 35],
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'purple' | 'rose'
  height = 36,
  className = '',
}) {
  const colorMap = {
    blue: { stroke: '#2563eb', fill: 'url(#gradient-blue)' },
    emerald: { stroke: '#059669', fill: 'url(#gradient-emerald)' },
    amber: { stroke: '#d97706', fill: 'url(#gradient-amber)' },
    purple: { stroke: '#7c3aed', fill: 'url(#gradient-purple)' },
    rose: { stroke: '#e11d48', fill: 'url(#gradient-rose)' },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 120;
  const padding = 4;
  const innerHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * innerHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className={`inline-block overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-purple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-rose" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={areaD} fill={currentTheme.fill} />

        {/* Smooth line */}
        <path
          d={pathD}
          fill="none"
          stroke={currentTheme.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse end dot */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={currentTheme.stroke}
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

/**
 * Animated Progress Bar with percentage label
 */
export function AnimatedProgressBar({
  value = 0,
  max = 100,
  color = 'blue',
  showLabel = false,
  className = '',
}) {
  const percentage = Math.min(Math.max(Math.round((value / (max || 1)) * 100), 0), 100);

  const gradientMap = {
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-400 to-teal-600',
    amber: 'from-amber-400 to-orange-500',
    purple: 'from-purple-500 to-indigo-600',
    rose: 'from-rose-400 to-red-600',
  };

  const bgGradient = gradientMap[color] || gradientMap.blue;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1 font-display">
          <span>Capacity Completion</span>
          <span className="font-mono tabular-numbers text-slate-700">{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bgGradient} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * SVG Donut Ring Meter
 */
export function DonutMetric({
  value = 85,
  size = 64,
  strokeWidth = 6,
  color = '#2563eb',
  label = '',
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-bold font-display tabular-numbers text-slate-800">
          {value}%
        </span>
        {label && <span className="text-[8px] text-slate-400 uppercase tracking-tighter">{label}</span>}
      </div>
    </div>
  );
}

/**
 * Interactive Weekly / Distribution Bar Chart
 */
export function ActivityBarChart({
  data = [
    { label: 'Mon', value: 24, secondary: 18 },
    { label: 'Tue', value: 38, secondary: 26 },
    { label: 'Wed', value: 42, secondary: 34 },
    { label: 'Thu', value: 30, secondary: 22 },
    { label: 'Fri', value: 55, secondary: 40 },
    { label: 'Sat', value: 68, secondary: 52 },
    { label: 'Sun', value: 45, secondary: 36 },
  ],
  height = 160,
  primaryColor = 'bg-blue-600',
  secondaryColor = 'bg-indigo-200',
  className = '',
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondary || 0)), 10);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between gap-2 pt-4" style={{ height: `${height}px` }}>
        {data.map((item, idx) => {
          const primaryHeight = Math.max(Math.round((item.value / maxValue) * 100), 6);
          const secondaryHeight = item.secondary
            ? Math.max(Math.round((item.secondary / maxValue) * 100), 4)
            : 0;

          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-10 z-20 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg whitespace-nowrap font-mono animate-fade-in pointer-events-none">
                  <span className="font-bold">{item.value}</span> total
                  {item.secondary !== undefined && ` • ${item.secondary} checked`}
                </div>
              )}

              {/* Bar Columns Container */}
              <div className="w-full max-w-[28px] flex items-end justify-center gap-1 h-full">
                {item.secondary !== undefined && (
                  <div
                    className={`w-1/2 rounded-t-md transition-all duration-500 ease-out ${secondaryColor} group-hover:opacity-90`}
                    style={{ height: `${secondaryHeight}%` }}
                  />
                )}
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ease-out ${primaryColor} ${
                    isHovered ? 'brightness-110 scale-y-105' : ''
                  }`}
                  style={{ height: `${primaryHeight}%`, transformOrigin: 'bottom' }}
                />
              </div>

              {/* Bottom Label */}
              <span className="text-[10px] font-semibold text-slate-500 mt-2 font-display group-hover:text-blue-600 transition-colors">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Pure SVG Smooth Sine-Wave Sparkline for Stat Cards (matching visual reference)
 */
export function StatWaveSparkline({
  color = 'blue',
  data,
  className = 'w-full h-full',
}) {
  const colorMap = {
    blue: { stroke: '#3b82f6', stopStart: '#60a5fa', stopEnd: '#dbeafe' },
    emerald: { stroke: '#10b981', stopStart: '#34d399', stopEnd: '#d1fae5' },
    amber: { stroke: '#f59e0b', stopStart: '#fbbf24', stopEnd: '#fef3c7' },
    purple: { stroke: '#8b5cf6', stopStart: '#a78bfa', stopEnd: '#ede9fe' },
    violet: { stroke: '#8b5cf6', stopStart: '#a78bfa', stopEnd: '#ede9fe' },
    cyan: { stroke: '#06b6d4', stopStart: '#22d3ee', stopEnd: '#cffafe' },
    rose: { stroke: '#f43f5e', stopStart: '#fb7185', stopEnd: '#ffe4e6' },
  };

  const current = colorMap[color] || colorMap.blue;
  const gradientId = `wave-grad-${color}-${Math.random().toString(36).substring(2, 7)}`;

  // Default smooth wave points if dynamic array not provided
  const points = data && data.length >= 4
    ? data
    : [10, 16, 12, 22, 18, 25, 28];

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const padY = 4;
  const innerH = h - padY * 2;

  const coords = points.map((val, idx) => ({
    x: (idx / (points.length - 1)) * w,
    y: h - padY - ((val - min) / range) * innerH,
  }));

  // Build smooth cubic Bézier spline curve
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i];
    const p1 = coords[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={current.stopStart} stopOpacity="0.3" />
          <stop offset="100%" stopColor={current.stopEnd} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={current.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Premium Spline Area Chart with Tooltip & Dropdown (matching Revenue Overview in reference)
 */
export function SplineAreaChart({
  title = 'Revenue Overview',
  icon: Icon,
  headline = '₹0',
  trendBadge = 'Real Database',
  periods = ['Last 6 Months', 'Last 30 Days', 'This Year'],
  selectedPeriod,
  onPeriodChange,
  data,
  dataByPeriod,
  yAxisLabels,
  className = '',
}) {
  const [internalPeriod, setInternalPeriod] = useState(periods[0] || 'Last 6 Months');
  const activePeriod = selectedPeriod !== undefined ? selectedPeriod : internalPeriod;

  // Resolve dataset based on activePeriod or direct data prop
  const rawData = (dataByPeriod && dataByPeriod[activePeriod]) || data || [
    { label: 'Jun', value: 0, display: '₹0' },
    { label: 'Jul', value: 0, display: '₹0' },
    { label: 'Aug', value: 0, display: '₹0' },
    { label: 'Sep', value: 0, display: '₹0' },
    { label: 'Oct', value: 0, display: '₹0' },
    { label: 'Nov', value: 0, display: '₹0' },
  ];

  const chartData = Array.isArray(rawData) && rawData.length > 0 ? rawData : [
    { label: 'Start', value: 0, display: '0' },
    { label: 'Current', value: 1, display: '1' },
  ];

  const [activeIdx, setActiveIdx] = useState(chartData.length - 1);
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger draw animation on mount and whenever activePeriod or chartData changes
  useEffect(() => {
    setIsAnimated(false);
    setActiveIdx(chartData.length - 1);
    const timer = setTimeout(() => setIsAnimated(true), 60);
    return () => clearTimeout(timer);
  }, [activePeriod, chartData.length]);

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    if (selectedPeriod === undefined) {
      setInternalPeriod(val);
    }
    if (onPeriodChange) {
      onPeriodChange(val);
    }
  };

  const w = 540;
  const h = 180;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 24;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  // Extract numeric values and determine dynamic ceiling
  const numericValues = chartData.map((d) =>
    typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0
  );
  const rawMax = Math.max(...numericValues, 0);
  const totalSum = numericValues.reduce((acc, v) => acc + v, 0);
  const avgVal = chartData.length > 0 ? Math.round(totalSum / chartData.length) : 0;
  const peakVal = rawMax;

  let maxVal = rawMax;
  if (rawMax <= 0) {
    maxVal = 10;
  } else if (rawMax <= 5) {
    maxVal = 5;
  } else if (rawMax <= 10) {
    maxVal = 10;
  } else if (rawMax <= 50) {
    maxVal = Math.ceil(rawMax / 10) * 10;
  } else if (rawMax <= 100) {
    maxVal = Math.ceil(rawMax / 20) * 20;
  } else if (rawMax <= 1000) {
    maxVal = Math.ceil(rawMax / 100) * 100;
  } else if (rawMax <= 100000) {
    maxVal = Math.ceil(rawMax / 10000) * 10000;
  } else {
    maxVal = Math.ceil(rawMax / 50000) * 50000;
  }

  const formatTick = (val) => {
    if (val >= 100000) {
      const lakhs = val / 100000;
      return `${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `${k % 1 === 0 ? k : k.toFixed(1)}k`;
    }
    return Math.round(val).toString();
  };

  const computedYLabels = yAxisLabels || [
    formatTick(maxVal),
    formatTick(maxVal * 0.66),
    formatTick(maxVal * 0.33),
    '0',
  ];

  const points = chartData.map((d, i) => {
    const numVal = typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0;
    const x = padLeft + (i / Math.max(chartData.length - 1, 1)) * chartW;
    const y = padTop + chartH - (numVal / maxVal) * chartH;
    return { x, y, ...d, numVal };
  });

  // Generate smooth cubic Bézier spline curve
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;
  const activePoint = points[activeIdx] || points[points.length - 1];

  // Headline animated count-up if numeric value exists
  const matchNumeric = typeof headline === 'string' ? headline.match(/([^\d]*)([\d,]+)(\.?\d*)(.*)/) : null;
  const headlineNum = matchNumeric
    ? parseFloat(matchNumeric[2].replace(/,/g, ''))
    : typeof headline === 'number'
    ? headline
    : null;
  const countUpValue = useCountUp(headlineNum !== null ? headlineNum : 0, 850);

  let animatedHeadline = headline;
  if (matchNumeric && headlineNum !== null) {
    const formattedCount = headlineNum >= 1000 ? countUpValue.toLocaleString() : countUpValue;
    animatedHeadline = `${matchNumeric[1]}${formattedCount}${matchNumeric[4] || ''}`;
  }

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:shadow-xl transition-all duration-300 relative overflow-hidden group flex flex-col min-w-0 font-sans ${className}`}>
      {/* Ambient Radial Mesh Glows */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-sky-400/8 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header & KPI Summary Section */}
      <div className="pb-4 border-b border-slate-100 relative z-10 space-y-3.5">
        {/* Title & Filter Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center icon-3d shadow-md shadow-blue-500/25 shrink-0 group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300">
                <Icon className="w-6 h-6 drop-shadow-sm" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold font-sans tracking-tight text-slate-900 truncate">
                {title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate font-normal">
                Live telemetry &bull; Interactive monthly spline trend
              </p>
            </div>
          </div>

          {/* Timeframe Dropdown */}
          <div className="relative self-start sm:self-auto shrink-0">
            <select
              value={activePeriod}
              onChange={handlePeriodChange}
              className="text-xs font-semibold text-slate-700 bg-slate-50/90 hover:bg-slate-100 border border-slate-200/90 rounded-xl px-3.5 py-2 cursor-pointer outline-none transition-all shadow-2xs font-sans hover:border-blue-300"
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Headline & Quick Stats Pill Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-sans text-slate-900 tracking-tight tabular-nums">
              {animatedHeadline}
            </div>
            {trendBadge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {trendBadge}
              </span>
            )}
          </div>

          {/* Mini Telemetry Metric Chips */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 font-sans">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-[11px]">
              <span className="text-slate-400 font-normal">Monthly Avg:</span>
              <span className="font-bold text-slate-800">₹{avgVal.toLocaleString('en-IN')}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-[11px] hidden sm:inline-flex">
              <span className="text-slate-400 font-normal">Peak:</span>
              <span className="font-bold text-slate-800">₹{peakVal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Inset Chart Plate Canvas */}
      <div className="relative w-full flex-1 min-h-[230px] sm:min-h-[270px] mt-4 rounded-2xl bg-gradient-to-b from-slate-50/70 via-slate-50/30 to-blue-50/15 border border-slate-200/70 p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Crisp HTML Y-Axis Column on Left */}
        <div className="absolute left-3 top-3 bottom-14 flex flex-col justify-between text-[11px] font-semibold text-slate-400 pointer-events-none select-none z-10 font-sans">
          {computedYLabels.map((lbl, idx) => (
            <span key={lbl + idx} className="leading-none tabular-nums text-right pr-2">
              {lbl}
            </span>
          ))}
        </div>

        {/* Empty state pill if all values are 0 */}
        {rawMax <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12 z-10">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-500 text-xs font-semibold shadow-xs font-sans">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Awaiting session billing for {activePeriod}
            </span>
          </div>
        )}

        {/* SVG Drawing Canvas (Curves, Glows, Crosshairs & Points) */}
        <div className="relative w-full flex-1 min-h-[175px]">
          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="w-full h-full min-h-[175px] overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Premium Area Gradient with Dual Glow */}
              <linearGradient id="ultraAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="45%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="90%" stopColor="#93c5fd" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>

              {/* Glowing Spline Stroke Gradient */}
              <linearGradient id="ultraStrokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>

              {/* Glow Filter for Stroke & Nodes */}
              <filter id="ultraGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Horizontal Gridlines */}
            {computedYLabels.map((_, idx) => {
              const y = padTop + (idx / Math.max(computedYLabels.length - 1, 1)) * chartH;
              return (
                <line
                  key={idx}
                  x1={padLeft}
                  y1={y}
                  x2={w - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
              );
            })}

            {/* Vertical Crosshair Guide Line on Active Month */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + chartH}
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={isAnimated ? 0.8 : 0}
                style={{ transition: 'x1 0.2s ease, x2 0.2s ease' }}
              />
            )}

            {/* Area Gradient with smooth fade-in */}
            <path
              d={areaD}
              fill="url(#ultraAreaGradient)"
              style={{
                opacity: isAnimated ? 1 : 0,
                transition: 'opacity 0.9s ease-out 0.2s',
              }}
            />

            {/* Spline Line with Stroke Gradient & Drop Shadow Glow */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#ultraStrokeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ultraGlow)"
              strokeDasharray="1000"
              strokeDashoffset={isAnimated ? 0 : 1000}
              style={{
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* Interactive Data Points (Nodes) */}
            {points.map((p, i) => {
              const isActive = i === activeIdx;
              return (
                <g
                  key={p.label + i}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => setActiveIdx(i)}
                >
                  {/* Outer Pulsing Halo Ring on Active */}
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="13"
                      fill="#6366f1"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                  )}
                  {/* Outer Shadow Ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? '7' : '4.5'}
                    fill={isActive ? '#4f46e5' : '#3b82f6'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    style={{
                      transformOrigin: `${p.x}px ${p.y}px`,
                      transform: isAnimated ? 'scale(1)' : 'scale(0)',
                      transition: `transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.08 + i * 0.05}s, r 0.2s ease`,
                    }}
                  />
                  {/* Center Specular Glint */}
                  {isActive && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="2"
                      fill="#ffffff"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Premium Floating Glassmorphic Tooltip Badge */}
          {activePoint && (
            <div
              className="absolute z-30 pointer-events-none transition-all duration-200 ease-out flex flex-col items-center"
              style={{
                left: `${(activePoint.x / w) * 100}%`,
                top: `${(activePoint.y / h) * 100}%`,
                transform: 'translate(-50%, -130%)',
              }}
            >
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/95 text-white shadow-2xl shadow-indigo-950/40 border border-slate-700/70 backdrop-blur-md whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-cyan-300 font-mono tracking-wider uppercase">
                  {activePoint.label}:
                </span>
                <span className="text-xs font-extrabold text-white font-sans tracking-tight tabular-nums">
                  {activePoint.display || (typeof activePoint.value === 'number' ? `₹${activePoint.value.toLocaleString('en-IN')}` : activePoint.value)}
                </span>
              </div>
              {/* Downward Caret with Border & Shadow */}
              <div className="w-2.5 h-2.5 bg-slate-950/95 rotate-45 -mt-1.5 border-r border-b border-slate-700/70 shadow-sm" />
            </div>
          )}
        </div>

        {/* Clean Interactive Timeline Row for Months */}
        <div className="flex items-center justify-between pl-8 pr-2 pt-2.5 border-t border-slate-200/70 mt-2 select-none font-sans">
          {chartData.map((d, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={d.label + i}
                type="button"
                onClick={() => setActiveIdx(i)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center font-sans ${
                  isActive
                    ? 'text-indigo-600 bg-white shadow-sm ring-1 ring-slate-200/80 scale-105'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Multi-Segment Donut Chart (Spacious, non-cramped with clean legend)
 */
export function MultiSegmentDonut({
  title = 'Session Status',
  icon: Icon,
  segments = [],
  centerValue = '0%',
  centerLabel = 'Closed',
  className = '',
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Compute total mathematically
  const total = segments.reduce((sum, s) => sum + (parseFloat(s.value) || 0), 0);
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Active item is hovered OR selected
  const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activeSegment = activeIdx !== null && segments[activeIdx] ? segments[activeIdx] : null;

  // Active values for display in center
  const displayVal = activeSegment
    ? parseFloat(activeSegment.value) || 0
    : typeof centerValue === 'number'
    ? centerValue
    : total;

  const displayLabel = activeSegment ? activeSegment.label : centerLabel;
  const displayPercent = activeSegment
    ? total > 0
      ? Math.round(((parseFloat(activeSegment.value) || 0) / total) * 100)
      : 0
    : null;

  const animatedVal = useCountUp(displayVal, 400);

  let cumulativePercent = 0;
  const nonZeroSegments = segments.filter((s) => (parseFloat(s.value) || 0) > 0);

  const handleSelect = (idx) => {
    setSelectedIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center icon-3d shadow-md shadow-blue-500/25 shrink-0">
              <Icon className="w-5 h-5 drop-shadow-sm" />
            </div>
          )}
          <h2 className="text-sm font-bold font-display tracking-tight text-slate-800 truncate">
            {title}
          </h2>
        </div>

        {selectedIdx !== null ? (
          <button
            onClick={() => setSelectedIdx(null)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer shrink-0"
            title="Click to view full distribution"
          >
            Reset View
          </button>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-full font-mono shrink-0">
            Click to Filter
          </span>
        )}
      </div>

      {/* Donut and Legend row - No overflow, properly bounded */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-4 my-auto w-full min-w-0">
        {/* Donut circle */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* If total is 0, show neutral placeholder ring */}
            {total === 0 && (
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="#cbd5e1"
                strokeWidth={strokeWidth}
                strokeDasharray="4 6"
                fill="none"
              />
            )}

            {/* Colored arcs */}
            {total > 0 &&
              segments.map((seg, idx) => {
                const segVal = parseFloat(seg.value) || 0;
                if (segVal <= 0) return null;

                const segPercent = (segVal / total) * 100;
                const strokeDash = isMounted ? (segPercent / 100) * circumference : 0;
                const strokeOffset = -((cumulativePercent / 100) * circumference);
                cumulativePercent += segPercent;

                const isSelected = selectedIdx === idx;
                const isHovered = hoveredIdx === idx;
                const isActive = isSelected || isHovered;
                const isDimmed = activeIdx !== null && !isActive;

                return (
                  <circle
                    key={idx}
                    cx="65"
                    cy="65"
                    r={radius}
                    stroke={seg.color}
                    strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${Math.max(strokeDash - (nonZeroSegments.length > 1 ? 2 : 0), 0)} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    fill="none"
                    onClick={() => handleSelect(idx)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      opacity: isDimmed ? 0.35 : 1,
                      filter: isActive ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' : 'none',
                      transition:
                        'stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.25s ease, opacity 0.25s ease',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
          </svg>

          {/* Centered label with smooth animation */}
          <div
            onClick={() => setSelectedIdx(null)}
            className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer select-none px-2"
            title="Click to reset view"
          >
            <span className="text-3xl font-black font-display text-slate-900 tracking-tight leading-none tabular-numbers transition-all">
              {animatedVal}
            </span>
            <span className="text-[11px] font-bold text-slate-500 mt-1 truncate max-w-[85px] leading-tight transition-colors">
              {displayPercent !== null ? `${displayPercent}%` : displayLabel}
            </span>
            {displayPercent !== null && (
              <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[90px] mt-0.5">
                {displayLabel}
              </span>
            )}
          </div>
        </div>

        {/* Legend - Responsive, properly wrapped with zero overflow */}
        <div className="space-y-1.5 w-full sm:flex-1 min-w-0 pr-1">
          {segments.map((seg, idx) => {
            const segVal = parseFloat(seg.value) || 0;
            const pct = total > 0 ? Math.round((segVal / total) * 100) : 0;
            const isSelected = selectedIdx === idx;
            const isHovered = hoveredIdx === idx;
            const isActive = isSelected || isHovered;
            const isDimmed = activeIdx !== null && !isActive;

            return (
              <div
                key={idx}
                onClick={() => handleSelect(idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between gap-2.5 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-200/90 shadow-2xs font-bold text-blue-900'
                    : isHovered
                    ? 'bg-slate-100/90 border-slate-200 shadow-2xs scale-[1.01]'
                    : isDimmed
                    ? 'opacity-40 border-transparent hover:opacity-80'
                    : 'hover:bg-slate-50/80 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${seg.dotClass} shrink-0 shadow-2xs transition-transform ${
                      isActive ? 'scale-125' : ''
                    }`}
                  />
                  <span className="text-slate-700 font-semibold truncate leading-tight">
                    {seg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono tabular-numbers shrink-0">
                  <span className="font-bold text-slate-900">{segVal}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

