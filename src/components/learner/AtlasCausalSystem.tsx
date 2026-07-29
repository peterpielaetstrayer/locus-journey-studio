"use client";

import type { SystemsMap } from "@/types";

type AtlasCausalSystemProps = {
  systemsMap: SystemsMap;
  className?: string;
};

export function AtlasCausalSystem({ systemsMap, className }: AtlasCausalSystemProps) {
  const ariaLabel = systemsMap.edges
    .map((edge) => {
      const src = systemsMap.nodes.find((n) => n.id === edge.source);
      const tgt = systemsMap.nodes.find((n) => n.id === edge.target);
      return src && tgt ? `${src.label} connects to ${tgt.label}` : null;
    })
    .filter(Boolean)
    .join("; ");

  return (
    <section className={className} aria-label="Systems map">
      <h3 className="mb-3 text-[10px] uppercase tracking-[0.22em] opacity-60">System revealed</h3>
      <svg
        viewBox="0 0 100 70"
        className="h-44 w-full motion-systems-assemble md:h-52"
        role="img"
        aria-label={ariaLabel || "Learner systems diagram"}
      >
        <defs>
          <marker id="atlas-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="hsl(157 28% 35%)" />
          </marker>
        </defs>
        {systemsMap.edges.map((edge) => {
          const src = systemsMap.nodes.find((n) => n.id === edge.source);
          const tgt = systemsMap.nodes.find((n) => n.id === edge.target);
          if (!src || !tgt) return null;
          return (
            <line
              key={edge.id}
              x1={src.x}
              y1={src.y * 0.7}
              x2={tgt.x}
              y2={tgt.y * 0.7}
              stroke="hsl(157 28% 35%)"
              strokeWidth="0.5"
              strokeDasharray="1 0.5"
              markerEnd="url(#atlas-arrow)"
            />
          );
        })}
        {systemsMap.nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y * 0.7}
              r="2.5"
              fill="hsl(var(--parchment))"
              stroke="hsl(157 28% 35%)"
              strokeWidth="0.4"
            />
            <text
              x={node.x}
              y={node.y * 0.7 - 4}
              textAnchor="middle"
              fill="hsl(205 24% 18%)"
              fontSize="3.2"
              fontFamily="var(--font-serif), Georgia, serif"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <ul className="sr-only">
        {systemsMap.nodes.map((node) => (
          <li key={node.id}>{node.label}</li>
        ))}
      </ul>
    </section>
  );
}
