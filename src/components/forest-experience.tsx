"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { api, type ForestTreeItem } from "@/lib/api";
import { useEffect } from "react";

type SelectedTree = ForestTreeItem | null;

function Tree({ item, onSelect }: { item: ForestTreeItem; onSelect: (tree: ForestTreeItem) => void }) {
  const trunkHeight = item.growthStage === "seedling" ? 0.8 : item.growthStage === "young" ? 1.3 : 1.9;
  const canopyScale = item.species === "pine" ? [0.9, 1.3, 0.9] : item.species === "mangrove" ? [1.1, 0.8, 1.1] : [1.2, 1.0, 1.2];
  const canopyColor = item.species === "pine" ? "#1f7a3d" : item.species === "mangrove" ? "#2f8a57" : "#2f9a4d";

  return (
    <group position={[item.position.x, 0, item.position.z]} scale={[item.scale, item.scale, item.scale]} onClick={() => onSelect(item)}>
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, trunkHeight, 10]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>
      <mesh position={[0, trunkHeight + 0.45, 0]} castShadow>
        {item.species === "pine" ? <coneGeometry args={[0.65, 1.2, 10]} /> : <sphereGeometry args={[0.7, 10, 10]} />}
        <meshStandardMaterial color={canopyColor} />
      </mesh>
      {item.species !== "pine" ? (
        <mesh position={[0.2, trunkHeight + 0.2, -0.15]} scale={canopyScale as [number, number, number]} castShadow>
          <sphereGeometry args={[0.5, 10, 10]} />
          <meshStandardMaterial color={canopyColor} />
        </mesh>
      ) : null}
    </group>
  );
}

function ForestScene({ trees, onSelect }: { trees: ForestTreeItem[]; onSelect: (tree: ForestTreeItem) => void }) {
  return (
    <Canvas shadows camera={{ position: [0, 30, 40], fov: 52 }}>
      <color attach="background" args={["#ecf7ee"]} />
      <fog attach="fog" args={["#ecf7ee", 40, 140]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[16, 28, 12]} intensity={1.05} castShadow />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#cde8c8" />
      </mesh>

      {trees.map((tree) => (
        <Tree key={tree.id} item={tree} onSelect={onSelect} />
      ))}

      <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={18} maxDistance={90} />
    </Canvas>
  );
}

export function ForestExperience() {
  const [trees, setTrees] = useState<ForestTreeItem[]>([]);
  const [selected, setSelected] = useState<SelectedTree>(null);
  const [summary, setSummary] = useState<{
    totalTrees: number;
    totalActions: number;
    totalQuantity: number;
    averageConfidence: number;
    speciesBreakdown: Record<string, number>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const [treesResponse, summaryResponse] = await Promise.all([
          api.getForestTrees(),
          api.getForestSummary(),
        ]);
        setTrees(treesResponse.items);
        setSummary(summaryResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load forest");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const speciesText = useMemo(() => {
    if (!summary) return "";
    return Object.entries(summary.speciesBreakdown)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
  }, [summary]);

  return (
    <section className="border-2 border-black bg-white p-4 shadow-[8px_8px_0_0_#000] md:p-6">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">3D Reforestation</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight md:text-4xl">Growing Proof Forest</h2>
        <p className="mt-2 max-w-3xl text-sm text-zinc-600">
          Every approved sustainability action mints a tree in this shared forest. Add enough verified action and the digital biome becomes denser, richer, and harder to ignore.
        </p>
      </div>

      {error ? <p className="mb-3 text-sm font-bold text-red-600">{error}</p> : null}

      {summary ? (
        <div className="mb-4 grid gap-2 text-xs font-black uppercase tracking-wide md:grid-cols-4">
          <div className="border-2 border-black p-2">Trees: {summary.totalTrees}</div>
          <div className="border-2 border-black p-2">Actions: {summary.totalActions}</div>
          <div className="border-2 border-black p-2">Qty: {summary.totalQuantity}</div>
          <div className="border-2 border-black p-2">Avg confidence: {summary.averageConfidence}%</div>
        </div>
      ) : null}

      {summary ? <p className="mb-3 text-xs font-black uppercase tracking-wide text-zinc-600">Species: {speciesText}</p> : null}

      <div className="h-[520px] w-full border-2 border-black bg-[#ecf7ee]">
        {loading ? <div className="flex h-full items-center justify-center text-sm font-bold">Growing forest...</div> : <ForestScene trees={trees} onSelect={setSelected} />}
      </div>

      {selected ? (
        <div className="mt-4 border-2 border-black bg-zinc-50 p-3 text-xs font-bold uppercase tracking-wide">
          {selected.username} · {selected.actionType.replaceAll("_", " ")} · {selected.location} · qty {selected.quantity} · confidence {selected.confidence}% · stage {selected.growthStage}
        </div>
      ) : null}
    </section>
  );
}
