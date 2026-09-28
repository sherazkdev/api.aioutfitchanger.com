import type { AppMetadataDoc } from "@/lib/server/models/AppMetadata";
import type { OnboardingPageDoc } from "@/lib/server/models/OnboardingPage";
import type { AppLanguageDoc } from "@/lib/server/models/AppLanguage";

export function computeContentCompletion(
  meta: AppMetadataDoc,
  onboarding: OnboardingPageDoc[],
  languages: AppLanguageDoc[]
) {
  const metaChecks = [
    Boolean(meta.appName?.trim()),
    Boolean(meta.supportEmail?.trim()),
    Boolean(meta.minVersionIos?.trim()),
    Boolean(meta.minVersionAndroid?.trim()),
    Boolean(meta.privacyUrl?.trim()),
    Boolean(meta.termsUrl?.trim()),
    Boolean(meta.appStoreUrlIos?.trim()),
    Boolean(meta.appStoreUrlAndroid?.trim()),
  ];
  const metaScore = metaChecks.filter(Boolean).length / metaChecks.length;

  const onboardingScore =
    onboarding.length === 0
      ? 0
      : onboarding.filter((p) => p.title?.trim() && p.body?.trim() && p.imageUrl?.trim()).length / onboarding.length;

  const langScore =
    languages.length === 0 ? 0 : languages.filter((l) => l.enabled).length / languages.length;

  const percent = Math.round(((metaScore + onboardingScore + langScore) / 3) * 100);
  const draftChanges =
    (meta.draftPayload ? 1 : 0) +
    onboarding.filter((p) => !p.title?.trim() || !p.body?.trim()).length +
    languages.filter((l) => !l.enabled).length;

  return {
    completion_percent: percent,
    draft_changes: draftChanges,
  };
}
