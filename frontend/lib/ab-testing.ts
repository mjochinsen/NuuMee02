/**
 * A/B Testing Infrastructure
 *
 * Flexible system for running experiments with Firebase Remote Config.
 * Easy to add new experiments without modifying core logic.
 */

import { getRemoteConfig, fetchAndActivate, getString, getBoolean, getNumber } from 'firebase/remote-config';
import { app } from './firebase';

// ============ Experiment Definitions ============
// Add new experiments here - they'll automatically be available

export const EXPERIMENTS = {
  /**
   * Hero Video A/B Test
   * Tests different hero videos on the home page
   */
  hero_video: {
    key: 'hero_video_variant',
    variants: {
      control: '/hero-v4.mp4',     // Current video
      variant_b: '/hero-v5.mp4',   // IndianGamerSideBySide
      // Add more variants as needed:
      // variant_c: '/hero-v6.mp4',
    },
    defaultVariant: 'control' as const,
    description: 'Tests different hero videos on home page',
  },

  /**
   * CTA Button Text Test
   * Tests different call-to-action button text
   */
  cta_text: {
    key: 'cta_text_variant',
    variants: {
      control: 'Start Creating Free',
      variant_b: 'Try It Now - Free',
      variant_c: 'Create Your First Video',
    },
    defaultVariant: 'control' as const,
    description: 'Tests different CTA button text',
  },

  /**
   * Pricing Page Layout Test
   * Future experiment placeholder
   */
  pricing_layout: {
    key: 'pricing_layout_variant',
    variants: {
      control: 'cards',
      variant_b: 'table',
    },
    defaultVariant: 'control' as const,
    description: 'Tests different pricing page layouts',
  },
} as const;

export type ExperimentName = keyof typeof EXPERIMENTS;
export type ExperimentVariant<T extends ExperimentName> = keyof typeof EXPERIMENTS[T]['variants'];

// ============ Remote Config Setup ============

let remoteConfigInstance: ReturnType<typeof getRemoteConfig> | null = null;
let configFetched = false;

async function getRemoteConfigInstance() {
  if (typeof window === 'undefined') return null;

  if (!remoteConfigInstance) {
    try {
      remoteConfigInstance = getRemoteConfig(app);
      // Fetch every hour in production, every minute in dev
      remoteConfigInstance.settings.minimumFetchIntervalMillis =
        process.env.NODE_ENV === 'development' ? 60000 : 3600000;

      // Set defaults for all experiments
      const defaults: Record<string, string> = {};
      for (const [_, experiment] of Object.entries(EXPERIMENTS)) {
        defaults[experiment.key] = experiment.defaultVariant;
      }
      remoteConfigInstance.defaultConfig = defaults;
    } catch (error) {
      console.warn('[A/B] Failed to initialize Remote Config:', error);
      return null;
    }
  }

  if (!configFetched) {
    try {
      await fetchAndActivate(remoteConfigInstance);
      configFetched = true;
      console.log('[A/B] Remote Config fetched successfully');
    } catch (error) {
      console.warn('[A/B] Failed to fetch Remote Config, using defaults:', error);
    }
  }

  return remoteConfigInstance;
}

// ============ Public API ============

/**
 * Get the variant for an experiment
 *
 * @example
 * const videoSrc = await getExperimentVariant('hero_video');
 * // Returns '/hero-v4.mp4' or '/hero-v5.mp4'
 */
export async function getExperimentVariant<T extends ExperimentName>(
  experimentName: T
): Promise<string> {
  const experiment = EXPERIMENTS[experimentName];

  try {
    const config = await getRemoteConfigInstance();
    if (!config) {
      return experiment.variants[experiment.defaultVariant];
    }

    const variantKey = getString(config, experiment.key);

    // Validate that the variant exists
    if (variantKey in experiment.variants) {
      return experiment.variants[variantKey as keyof typeof experiment.variants];
    }

    console.warn(`[A/B] Unknown variant "${variantKey}" for ${experimentName}, using default`);
    return experiment.variants[experiment.defaultVariant];
  } catch (error) {
    console.warn(`[A/B] Error getting variant for ${experimentName}:`, error);
    return experiment.variants[experiment.defaultVariant];
  }
}

/**
 * Get the raw variant key (not the value) for analytics tracking
 */
export async function getExperimentVariantKey<T extends ExperimentName>(
  experimentName: T
): Promise<string> {
  const experiment = EXPERIMENTS[experimentName];

  try {
    const config = await getRemoteConfigInstance();
    if (!config) {
      return experiment.defaultVariant;
    }

    const variantKey = getString(config, experiment.key);

    if (variantKey in experiment.variants) {
      return variantKey;
    }

    return experiment.defaultVariant;
  } catch {
    return experiment.defaultVariant;
  }
}

/**
 * Track an A/B test conversion event
 */
export function trackExperimentConversion(
  experimentName: ExperimentName,
  variantKey: string,
  conversionType: 'view' | 'click' | 'signup' | 'purchase'
) {
  if (typeof window === 'undefined') return;

  // Track with GA4
  if (typeof (window as Window & { gtag?: Function }).gtag === 'function') {
    (window as Window & { gtag: Function }).gtag('event', 'experiment_conversion', {
      experiment_name: experimentName,
      variant: variantKey,
      conversion_type: conversionType,
    });
  }

  console.log(`[A/B] Tracked ${conversionType} for ${experimentName}:${variantKey}`);
}

// ============ React Hook ============

import { useState, useEffect } from 'react';

/**
 * React hook for using A/B test variants
 *
 * @example
 * function HeroSection() {
 *   const { variant, variantKey, isLoading } = useExperiment('hero_video');
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return <video src={variant} />;
 * }
 */
export function useExperiment<T extends ExperimentName>(experimentName: T) {
  const experiment = EXPERIMENTS[experimentName];
  const [variant, setVariant] = useState<string>(experiment.variants[experiment.defaultVariant]);
  const [variantKey, setVariantKey] = useState<string>(experiment.defaultVariant);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchVariant() {
      try {
        const [value, key] = await Promise.all([
          getExperimentVariant(experimentName),
          getExperimentVariantKey(experimentName),
        ]);

        if (mounted) {
          setVariant(value);
          setVariantKey(key);
          setIsLoading(false);

          // Track view
          trackExperimentConversion(experimentName, key, 'view');
        }
      } catch {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchVariant();

    return () => {
      mounted = false;
    };
  }, [experimentName]);

  return {
    variant,
    variantKey,
    isLoading,
    trackConversion: (type: 'click' | 'signup' | 'purchase') =>
      trackExperimentConversion(experimentName, variantKey, type),
  };
}
