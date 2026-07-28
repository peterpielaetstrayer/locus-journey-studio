"use client";

import {
  WaterFingerprintCapture,
  WaterFingerprintExperience,
} from "@/components/learner/WaterFingerprintCapture";

export default function WaterFingerprintsPage() {
  return (
    <article>
      <WaterFingerprintExperience />
      <div className="mt-6">
        <WaterFingerprintCapture />
      </div>
    </article>
  );
}
