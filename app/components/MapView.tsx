"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), { ssr: false });

export default function MapView() {
  return (
    <div className="h-full w-full min-h-[50vh]">
      <Map />
    </div>
  );
}
