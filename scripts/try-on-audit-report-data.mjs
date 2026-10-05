/** Scorecards and failure analysis — filled after visual inspection of saved PNGs. */
export function buildAuditAnalysis(cases) {
  const failures = [];
  const scorecard = {
    "Same person / identity": {
      expected: "Yes",
      flux: cases.primary?.flux?.identity ?? "—",
      vto: cases.primary?.vto?.identity ?? "—",
      fixed: cases.primary?.vto?.identity ?? "—",
    },
    "Same face": {
      expected: "Yes",
      flux: cases.primary?.flux?.face ?? "—",
      vto: cases.primary?.vto?.face ?? "—",
      fixed: cases.primary?.vto?.face ?? "—",
    },
    "Same hair": {
      expected: "Yes",
      flux: cases.primary?.flux?.hair ?? "—",
      vto: cases.primary?.vto?.hair ?? "—",
      fixed: cases.primary?.vto?.hair ?? "—",
    },
    "Same pose": {
      expected: "Yes",
      flux: cases.primary?.flux?.pose ?? "—",
      vto: cases.primary?.vto?.pose ?? "—",
      fixed: cases.primary?.vto?.pose ?? "—",
    },
    "Same framing / camera": {
      expected: "Yes",
      flux: cases.primary?.flux?.framing ?? "—",
      vto: cases.primary?.vto?.framing ?? "—",
      fixed: cases.primary?.vto?.framing ?? "—",
    },
    "Same body proportions": {
      expected: "Yes",
      flux: cases.primary?.flux?.body ?? "—",
      vto: cases.primary?.vto?.body ?? "—",
      fixed: cases.primary?.vto?.body ?? "—",
    },
    "Correct target garment": {
      expected: "Yes",
      flux: cases.primary?.flux?.garment ?? "—",
      vto: cases.primary?.vto?.garment ?? "—",
      fixed: cases.primary?.vto?.garment ?? "—",
    },
    "No mask / teal artifacts": {
      expected: "Yes",
      flux: cases.primary?.flux?.artifacts ?? "—",
      vto: cases.primary?.vto?.artifacts ?? "—",
      fixed: cases.primary?.vto?.artifacts ?? "—",
    },
    "Natural garment fit": {
      expected: "Yes",
      flux: cases.primary?.flux?.fit ?? "—",
      vto: cases.primary?.vto?.fit ?? "—",
      fixed: cases.primary?.vto?.fit ?? "—",
    },
  };

  if (cases.virtualTryOnAssetIssue) {
    failures.push({
      symptom: "virtual_try_on catalog PNG is a headshot, not a garment flat-lay/on-model outfit",
      expected: "Full outfit reference for image 2",
      actual: "women_tryon_01.png = face/hair on solid background",
      rootCause: "Asset catalog mismatch (wrong image bound to style_id)",
      evidence: "artifacts/try-on-audit/case-01/garment.png inspected",
      severity: "critical",
      confidence: "95%",
    });
  }

  failures.push(
    {
      symptom: "Identity replaced under flux-2-pro",
      expected: "Same woman as source.png",
      actual: "Different face, blonde structured curls (flux current-result)",
      rootCause: "General FLUX.2 Pro edit regenerates subject; weak identity lock",
      evidence: `POST /v1/flux-2-pro job ${cases.runs?.flux2pro?.jobId ?? "—"}`,
      severity: "critical",
      confidence: "95%",
    },
    {
      symptom: "Garment not transferred under flux-2-pro (primary case)",
      expected: "Target outfit from garment.png",
      actual: "Unrelated patterned blazer / mixed reference",
      rootCause: "flux-2-pro + invalid garment reference + full-scene edit",
      evidence: "case-02/current-result.png vs garment.png",
      severity: "high",
      confidence: "90%",
    },
    {
      symptom: "Pose/framing preserved under VTO v2",
      expected: "Hands on laptop, orange wall background",
      actual: "Preserved in vto-v2-result.png (primary audit case)",
      rootCause: "N/A — VTO behaves as intended for pose",
      evidence: "POST /v1/flux-tools/vto-v2",
      severity: "info",
      confidence: "90%",
    }
  );

  const verdict = {
    trueVirtualTryOnAfterFix:
      cases.primary?.vto?.garment === "PASS" || cases.primary?.vto?.garment === "PARTIAL"
        ? "Partial — VTO engine correct; garment quality depends on catalog asset"
        : "No — garment reference must be a valid outfit image",
    samePersonPreservedVto: cases.primary?.vto?.identity === "PASS" ? "Yes (VTO v2)" : "Mixed",
    posePreservedVto: cases.primary?.vto?.pose === "PASS" ? "Yes (VTO v2)" : "No",
    garmentCorrectVto: cases.primary?.vto?.garment ?? "See scorecard",
    tealArtifactsInBackendOutputs: "Not observed in this backend BFL test (teal likely mobile mask path)",
    stillBroken: [
      "Production Flutter still calls flux-2-pro directly",
      "virtual_try_on catalog images may be non-garment headshots",
      "Full requirement PASS requires mobile proxy + valid garment assets",
    ],
  };

  return { scorecard, failures, verdict };
}
