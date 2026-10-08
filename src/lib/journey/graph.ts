/**
 * Pure layout for THE CONVERGENCE career graph.
 * Radial layer clusters around a central convergence node. Nodes/edges
 * switch on per scene (cumulative by layer order); scene 10 zooms out.
 */
import { JOURNEY_LAYERS, JOURNEY_NODES, type GraphLayerKey } from '@/content/journey';

export const JG_VIEW = { w: 1000, h: 620 } as const;
const CX = 500;
const CY = 322;
const RING = 236;

export type LayerSlot = {
  key: GraphLayerKey;
  label: string;
  x: number;
  y: number;
  angle: number;
  order: number;
};

/** 8 clusters evenly on a ring, starting at the top, clockwise. */
export const LAYER_SLOTS: LayerSlot[] = (Object.keys(JOURNEY_LAYERS) as GraphLayerKey[]).map((key, i, arr) => {
  const angle = (-90 + (360 / arr.length) * i) * (Math.PI / 180);
  return {
    key,
    label: JOURNEY_LAYERS[key].label,
    x: Math.round(CX + Math.cos(angle) * RING),
    y: Math.round(CY + Math.sin(angle) * RING * 0.86),
    angle,
    order: JOURNEY_LAYERS[key].order,
  };
});

export const SLOT_BY_KEY = Object.fromEntries(LAYER_SLOTS.map((s) => [s.key, s])) as Record<GraphLayerKey, LayerSlot>;

export const CONVERGENCE_POINT = { x: CX, y: CY } as const;

/** Orbit dots (decorative density cue) around a cluster node. */
export function orbitDots(slot: LayerSlot, count: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const a = slot.angle + Math.PI + ((Math.PI * 2) / count) * i;
    out.push({
      x: Math.round(slot.x + Math.cos(a) * 44),
      y: Math.round(slot.y + Math.sin(a) * 44),
    });
  }
  return out;
}

/** Layers visible once the visitor has reached scene with these layers (cumulative by order). */
export function visibleLayers(sceneLayers: GraphLayerKey[], all: GraphLayerKey[]): GraphLayerKey[] {
  const maxOrder = Math.max(...sceneLayers.map((l) => JOURNEY_LAYERS[l].order));
  return all.filter((l) => JOURNEY_LAYERS[l].order <= maxOrder);
}

/** Ring edges: consecutive visible layers chain toward the active one. */
export function chainEdges(visible: GraphLayerKey[]): { from: GraphLayerKey; to: GraphLayerKey }[] {
  const ordered = [...visible].sort((a, b) => JOURNEY_LAYERS[a].order - JOURNEY_LAYERS[b].order);
  const edges: { from: GraphLayerKey; to: GraphLayerKey }[] = [];
  for (let i = 1; i < ordered.length; i++) edges.push({ from: ordered[i - 1], to: ordered[i] });
  return edges;
}

/** Career-node connections mapped to layer edges (for the explorer). */
export const NODE_LAYER: Record<string, GraphLayerKey> = Object.fromEntries(
  JOURNEY_NODES.map((n) => [n.id, n.layer])
);
