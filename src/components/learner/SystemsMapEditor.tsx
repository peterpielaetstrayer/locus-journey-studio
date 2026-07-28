"use client";

import { useState } from "react";
import { useDemoStore } from "@/store/demo-store";
import type { SystemsMapEdge } from "@/types";
import { Button } from "@/components/shared/Button";
import { Label, Select } from "@/components/shared/FormFields";

type SystemsMapEditorProps = {
  learnerId: string;
};

export function SystemsMapEditor({ learnerId }: SystemsMapEditorProps) {
  const { systemsMaps, updateSystemsMap } = useDemoStore();
  const map = systemsMaps[learnerId];

  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");

  function addEdge() {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const edge: SystemsMapEdge = {
      id: `e-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
    };
    if (map.edges.some((e) => e.source === sourceId && e.target === targetId)) return;
    updateSystemsMap(learnerId, { ...map, edges: [...map.edges, edge] });
    setSourceId("");
    setTargetId("");
  }

  function toggleUncertainty(nodeId: string) {
    const nodes = map.nodes.map((n) =>
      n.id === nodeId ? { ...n, uncertain: !n.uncertain } : n,
    );
    updateSystemsMap(learnerId, { ...map, nodes });
  }

  return (
    <div className="space-y-4">
      <div
        className="relative h-72 rounded-xl border border-border bg-surface-raised p-4"
        role="img"
        aria-label="Editable systems map showing connections between landscape variables"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {map.edges.map((edge) => {
            const src = map.nodes.find((n) => n.id === edge.source);
            const tgt = map.nodes.find((n) => n.id === edge.target);
            if (!src || !tgt) return null;
            return (
              <line
                key={edge.id}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke="hsl(157 28% 43%)"
                strokeWidth="0.8"
                markerEnd="url(#arrow)"
              />
            );
          })}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(157 28% 43%)" />
            </marker>
          </defs>
          {map.nodes.map((node) => (
            <g key={node.id}>
              <rect
                x={node.x - 12}
                y={node.y - 5}
                width="24"
                height="10"
                rx="2"
                fill={node.uncertain ? "hsl(39 78% 61% / 0.3)" : "hsl(203 27% 25%)"}
                stroke={node.uncertain ? "hsl(39 78% 61%)" : "hsl(198 18% 28%)"}
                strokeWidth="0.5"
              />
              <text
                x={node.x}
                y={node.y + 1.5}
                textAnchor="middle"
                fill="hsl(42 35% 94%)"
                fontSize="2.8"
              >
                {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="sr-only">Add causal connection</legend>
        <div>
          <Label htmlFor="edge-source">From</Label>
          <Select id="edge-source" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            <option value="">Select…</option>
            {map.nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="edge-target">To</Label>
          <Select id="edge-target" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">Select…</option>
            {map.nodes.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="button" onClick={addEdge} variant="secondary" className="w-full">
            Add connection
          </Button>
        </div>
      </fieldset>

      <div>
        <p className="mb-2 text-sm font-medium">Mark uncertainty</p>
        <ul className="flex flex-wrap gap-2">
          {map.nodes.map((node) => (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => toggleUncertainty(node.id)}
                className={`min-h-11 rounded-lg border px-3 py-2 text-xs ${
                  node.uncertain
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border bg-surface-raised"
                }`}
                aria-pressed={node.uncertain}
              >
                {node.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted">
        {map.edges.length}/4 connections · Mark at least one uncertainty · Text-based list available below map
      </p>

      <ul className="text-sm space-y-1" aria-label="Systems map text alternative">
        {map.nodes.map((n) => (
          <li key={n.id}>
            {n.label}
            {n.uncertain && " (uncertain)"}
            {map.edges
              .filter((e) => e.source === n.id)
              .map((e) => {
                const target = map.nodes.find((t) => t.id === e.target);
                return target ? ` → ${target.label}` : "";
              })
              .join("")}
          </li>
        ))}
      </ul>
    </div>
  );
}
