import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, Lock, Sparkles, Zap } from "lucide-react";

import { useUser } from "~/store";

import {
  DEFAULT_INTENSITY_BY_MODE,
  getIntensityConfig,
  getModeConfig,
  GUEST_FREE_TRANSLATIONS_PER_DAY,
  GUEST_QUOTA_STORAGE_KEY,
  isLockedIntensity,
  MAX_TRANSLATION_INPUT_CHARS,
  TRANSLATION_INTENSITIES,
  TRANSLATION_MODES,
  type TranslationIntensity,
  type TranslationMode,
} from "./config";

type IntensityByMode = Record<TranslationMode, TranslationIntensity>;

interface GuestQuotaState {
  date: string;
  remaining: number;
}

const INITIAL_INTENSITY_BY_MODE: IntensityByMode = {
  "human-to-linkedin": DEFAULT_INTENSITY_BY_MODE["human-to-linkedin"],
  "linkedin-to-human": DEFAULT_INTENSITY_BY_MODE["linkedin-to-human"],
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readGuestQuota = (): GuestQuotaState => {
  if (typeof window === "undefined") {
    return {
      date: getTodayKey(),
      remaining: GUEST_FREE_TRANSLATIONS_PER_DAY,
    };
  }

  try {
    const raw = window.localStorage.getItem(GUEST_QUOTA_STORAGE_KEY);
    if (!raw) {
      return {
        date: getTodayKey(),
        remaining: GUEST_FREE_TRANSLATIONS_PER_DAY,
      };
    }

    const parsed = JSON.parse(raw) as Partial<GuestQuotaState>;
    const today = getTodayKey();
    if (parsed.date !== today) {
      return {
        date: today,
        remaining: GUEST_FREE_TRANSLATIONS_PER_DAY,
      };
    }

    return {
      date: today,
      remaining:
        typeof parsed.remaining === "number"
          ? Math.max(0, Math.min(parsed.remaining, GUEST_FREE_TRANSLATIONS_PER_DAY))
          : GUEST_FREE_TRANSLATIONS_PER_DAY,
    };
  } catch {
    return {
      date: getTodayKey(),
      remaining: GUEST_FREE_TRANSLATIONS_PER_DAY,
    };
  }
};

const persistGuestQuota = (quota: GuestQuotaState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_QUOTA_STORAGE_KEY, JSON.stringify(quota));
};

export function TranslationInterface() {
  const credits = useUser((state) => state.credits);
  const user = useUser((state) => state.user);

  const [mode, setMode] = useState<TranslationMode>("human-to-linkedin");
  const [intensityByMode, setIntensityByMode] = useState<IntensityByMode>(
    INITIAL_INTENSITY_BY_MODE
  );
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [guestQuota, setGuestQuota] = useState<GuestQuotaState>({
    date: getTodayKey(),
    remaining: GUEST_FREE_TRANSLATIONS_PER_DAY,
  });

  useEffect(() => {
    const quota = readGuestQuota();
    setGuestQuota(quota);
    persistGuestQuota(quota);
  }, []);

  const selectedIntensity = intensityByMode[mode];
  const modeConfig = getModeConfig(mode);
  const hasPaidAccess = Boolean(user) && credits > 0;
  const selectedIntensityLocked = isLockedIntensity(
    selectedIntensity,
    hasPaidAccess
  );
  const hasFreeQuota = guestQuota.remaining > 0;
  const translateDisabled =
    status === "loading" ||
    !inputText.trim() ||
    selectedIntensityLocked ||
    (!hasPaidAccess && !hasFreeQuota);

  const helperCopy = useMemo(() => {
    if (hasPaidAccess) {
      return `Credits available: ${credits}. Extreme mode is unlocked.`;
    }

    if (guestQuota.remaining > 0) {
      return `Free today: ${guestQuota.remaining}/${GUEST_FREE_TRANSLATIONS_PER_DAY} translations left.`;
    }

    return "Free daily quota used up. Upgrade to keep translating and unlock Extreme.";
  }, [credits, guestQuota.remaining, hasPaidAccess]);

  const translateLabel = selectedIntensityLocked
    ? "Upgrade to use Extreme"
    : status === "loading"
      ? "Translating..."
      : "Translate";

  const handleModeChange = (nextMode: TranslationMode) => {
    setMode(nextMode);
    setOutputText("");
    setErrorMessage("");
    setStatus("idle");
  };

  const handleSwapMode = () => {
    handleModeChange(
      mode === "human-to-linkedin" ? "linkedin-to-human" : "human-to-linkedin"
    );
  };

  const handleIntensityChange = (nextIntensity: TranslationIntensity) => {
    if (isLockedIntensity(nextIntensity, hasPaidAccess)) {
      window.location.hash = "pricing";
      return;
    }

    setIntensityByMode((current) => ({
      ...current,
      [mode]: nextIntensity,
    }));
  };

  const consumeGuestQuota = () => {
    if (hasPaidAccess) return;

    setGuestQuota((current) => {
      const nextQuota = {
        date: getTodayKey(),
        remaining: Math.max(0, current.remaining - 1),
      };
      persistGuestQuota(nextQuota);
      return nextQuota;
    });
  };

  const handleTranslate = async () => {
    if (translateDisabled) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/translate/linkedin", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text: inputText.trim(),
          mode,
          intensity: selectedIntensity,
        }),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || "Translation request failed");
      }

      const result = (await response.json()) as { text?: string };
      const translatedText = result.text?.trim();
      if (!translatedText) {
        throw new Error("Empty response from translation service.");
      }

      setOutputText(translatedText);
      setStatus("success");
      consumeGuestQuota();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Translation failed. Please try again in a moment."
      );
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;

    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto rounded-[28px] border border-outline-variant bg-surface-container-lowest shadow-[0_24px_80px_rgba(8,26,39,0.08)] overflow-hidden">
      <div className="border-b border-outline-variant bg-[linear-gradient(135deg,rgba(0,90,140,0.08),rgba(255,255,255,0.92))] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
                Translation Interface 2.0
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-on-surface-variant">
                {helperCopy}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-on-surface md:text-3xl">
                Switch direction, keep your preferred intensity, and translate with clear system feedback.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSwapMode}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface transition hover:border-primary/30 hover:text-primary"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Swap mode
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {TRANSLATION_MODES.map((item) => {
            const active = item.value === mode;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleModeChange(item.value)}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition",
                  active
                    ? "border-primary bg-white shadow-[0_12px_32px_rgba(0,90,140,0.12)]"
                    : "border-outline-variant bg-white/65 hover:border-primary/30 hover:bg-white",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {item.shortLabel}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    {item.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {TRANSLATION_INTENSITIES.map((item) => {
            const active = item.value === selectedIntensity;
            const locked = isLockedIntensity(item.value, hasPaidAccess);

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleIntensityChange(item.value)}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-white hover:border-primary/25 hover:bg-surface-container-low",
                  locked ? "relative overflow-hidden" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.label}</span>
                      {locked && <Lock className="h-3.5 w-3.5" />}
                    </div>
                    <p
                      className={[
                        "mt-2 text-sm leading-relaxed",
                        active ? "text-white/80" : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      {item.description}
                    </p>
                  </div>
                  {active && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                </div>
                {locked && (
                  <div
                    className={[
                      "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                      active ? "bg-white/15 text-white" : "bg-primary/10 text-primary",
                    ].join(" ")}
                  >
                    <Sparkles className="h-3 w-3" />
                    {item.upgradeLabel}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid min-h-[440px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="border-b border-outline-variant p-6 md:p-8 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">
                {modeConfig.inputLabel}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {getIntensityConfig(selectedIntensity).label} intensity
              </p>
            </div>
            <span className="text-xs font-medium text-on-surface-variant">
              {inputText.length}/{MAX_TRANSLATION_INPUT_CHARS}
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(event) =>
              setInputText(event.target.value.slice(0, MAX_TRANSLATION_INPUT_CHARS))
            }
            placeholder={modeConfig.placeholder}
            className="mt-5 min-h-[260px] w-full resize-none rounded-3xl border border-outline-variant bg-surface px-5 py-4 text-base leading-7 text-on-surface outline-none transition focus:border-primary/40"
          />

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">
              {selectedIntensityLocked
                ? "Extreme is locked on free access. Upgrade below to unlock it."
                : !hasPaidAccess && !hasFreeQuota
                  ? "Daily free quota reached. Upgrade to continue."
                  : "Light and Standard stay free. Extreme is reserved for upgraded access."}
            </p>

            <button
              type="button"
              onClick={selectedIntensityLocked ? () => (window.location.hash = "pricing") : handleTranslate}
              disabled={translateDisabled && !selectedIntensityLocked}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : selectedIntensityLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {translateLabel}
            </button>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,rgba(241,244,246,0.72),rgba(255,255,255,0.96))] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/70">
                {modeConfig.outputLabel}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {status === "error"
                  ? "Needs another try"
                  : status === "success"
                    ? "Latest result"
                    : "Waiting for input"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputText}
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-5 min-h-[320px] rounded-3xl border border-dashed border-outline-variant bg-white/90 p-5">
            {status === "loading" ? (
              <div className="flex h-full min-h-[280px] items-center justify-center text-center">
                <div>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Zap className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-base font-semibold text-on-surface">
                    {modeConfig.loadingState}
                  </p>
                </div>
              </div>
            ) : status === "error" ? (
              <div className="flex h-full min-h-[280px] items-center">
                <div>
                  <p className="text-base font-semibold text-rose-600">
                    Translation failed
                  </p>
                  <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                    {errorMessage ||
                      "Something went wrong while contacting the translation service."}
                  </p>
                </div>
              </div>
            ) : outputText ? (
              <p className="whitespace-pre-wrap text-[17px] leading-8 text-on-surface">
                {outputText}
              </p>
            ) : (
              <div className="flex h-full min-h-[280px] items-center">
                <p className="max-w-md text-base leading-7 text-on-surface-variant">
                  {modeConfig.emptyState}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
