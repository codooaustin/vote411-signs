"use server";

import { createClient } from "@/lib/supabase/server";
import type { MapClusterConfig } from "@/lib/db/types";

const DEFAULT_MAX_CLUSTER_RADIUS = 40;
const DEFAULT_DISABLE_CLUSTERING_AT_ZOOM = 15;
const DEFAULT_MAP_ZOOM = 12;

/** Get map cluster config (public read). Returns defaults if missing. */
export async function getAppConfig(): Promise<MapClusterConfig> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", [
      "clustering_enabled",
      "max_cluster_radius",
      "disable_clustering_at_zoom",
      "default_map_zoom",
    ]);

  const map: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    map[row.key] = row.value;
  });

  const clusteringEnabled = map.clustering_enabled === "true";
  const maxClusterRadius = parseInt(map.max_cluster_radius ?? "", 10);
  const disableClusteringAtZoom = parseInt(
    map.disable_clustering_at_zoom ?? "",
    10
  );
  const defaultMapZoom = parseInt(map.default_map_zoom ?? "", 10);

  return {
    clusteringEnabled: map.clustering_enabled !== undefined ? clusteringEnabled : true,
    maxClusterRadius: Number.isFinite(maxClusterRadius)
      ? maxClusterRadius
      : DEFAULT_MAX_CLUSTER_RADIUS,
    disableClusteringAtZoom: Number.isFinite(disableClusteringAtZoom)
      ? disableClusteringAtZoom
      : DEFAULT_DISABLE_CLUSTERING_AT_ZOOM,
    defaultMapZoom: Number.isFinite(defaultMapZoom)
      ? defaultMapZoom
      : DEFAULT_MAP_ZOOM,
  };
}

/** Update map cluster config (auth required). */
export async function updateMapClusterConfig(params: {
  clusteringEnabled?: boolean;
  maxClusterRadius?: number;
  disableClusteringAtZoom?: number;
  defaultMapZoom?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const MIN_RADIUS = 20;
  const MAX_RADIUS = 120;
  const MIN_ZOOM = 10;
  const MAX_ZOOM = 18;
  const MIN_MAP_ZOOM = 8;
  const MAX_MAP_ZOOM = 18;

  if (params.clusteringEnabled != null) {
    const { error } = await supabase
      .from("app_config")
      .update({ value: params.clusteringEnabled ? "true" : "false" })
      .eq("key", "clustering_enabled");
    if (error) return { ok: false, error: error.message };
  }

  if (params.maxClusterRadius != null) {
    const n = Number(params.maxClusterRadius);
    if (!Number.isInteger(n) || n < MIN_RADIUS || n > MAX_RADIUS) {
      return {
        ok: false,
        error: `maxClusterRadius must be an integer between ${MIN_RADIUS} and ${MAX_RADIUS}`,
      };
    }
    const { error } = await supabase
      .from("app_config")
      .update({ value: String(n) })
      .eq("key", "max_cluster_radius");
    if (error) return { ok: false, error: error.message };
  }

  if (params.disableClusteringAtZoom != null) {
    const n = Number(params.disableClusteringAtZoom);
    if (!Number.isInteger(n) || n < MIN_ZOOM || n > MAX_ZOOM) {
      return {
        ok: false,
        error: `disableClusteringAtZoom must be an integer between ${MIN_ZOOM} and ${MAX_ZOOM}`,
      };
    }
    const { error } = await supabase
      .from("app_config")
      .update({ value: String(n) })
      .eq("key", "disable_clustering_at_zoom");
    if (error) return { ok: false, error: error.message };
  }

  if (params.defaultMapZoom != null) {
    const n = Number(params.defaultMapZoom);
    if (!Number.isInteger(n) || n < MIN_MAP_ZOOM || n > MAX_MAP_ZOOM) {
      return {
        ok: false,
        error: `defaultMapZoom must be an integer between ${MIN_MAP_ZOOM} and ${MAX_MAP_ZOOM}`,
      };
    }
    const { error } = await supabase
      .from("app_config")
      .update({ value: String(n) })
      .eq("key", "default_map_zoom");
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}
