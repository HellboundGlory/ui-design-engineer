interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ values, width = 72, height = 24, color = "#38bdf8" }: SparklineProps) {
  if (values.length < 2) return <svg width={width} height={height} />;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
