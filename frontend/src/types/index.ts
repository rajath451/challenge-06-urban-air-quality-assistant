// VayuCoach Type Definitions

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  state?: string;
  country?: string;
  station_name?: string;
  is_coastal?: boolean;
}

export interface EnvironmentalReadings {
  pm2_5: number;
  pm10: number;
  indian_naqi: number;
  indian_naqi_category: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | string;
  us_aqi: number;
  us_aqi_category: string;
  primary_pollutant: string;
  nitrogen_dioxide?: number;
  carbon_monoxide?: number;
  sulphur_dioxide?: number;
  ozone?: number;
  temperature: number;
  relative_humidity: number;
  wind_speed: number;
  wind_direction: number;
  weather_condition: string;
  timestamp: string;
  data_source: string;
  data_freshness_minutes: number;
  is_live: boolean;
}

export interface DecisionItem {
  activity_type: string;
  activity_title: string;
  recommendation: 'Recommended' | 'Proceed with Caution' | 'Modify Intensity/Time' | 'Avoid / Postpone' | string;
  recommendation_tier: 'optimal' | 'caution' | 'restricted' | 'avoid' | string;
  reason: string;
  environmental_rationale: string;
  key_metrics: Record<string, any>;
  alternative_action: string;
  best_time_window?: string;
  confidence_level: 'Higher confidence' | 'Moderate confidence' | 'Limited confidence' | 'Insufficient data' | string;
  confidence_reason: string;
  important_limitations: string;
}

export interface DecisionResponse {
  location: LocationInfo;
  readings: EnvironmentalReadings;
  overall_status: string;
  main_advice: string;
  decisions: DecisionItem[];
  generated_at: string;
}

export interface ActivitySlotForecast {
  hour: string;
  time_label: string;
  pm2_5: number;
  indian_naqi: number;
  naqi_category: string;
  temperature: number;
  relative_humidity: number;
  wind_speed: number;
  suitability_score: number;
  suitability_label: 'Optimal' | 'Acceptable' | 'Poor' | 'Hazardous' | string;
  ventilation_recommended: boolean;
  notes: string;
}

export interface BestWindow {
  window_label: string;
  avg_suitability: number;
  expected_avg_pm25: number;
  start_hour: number;
  recommendation: string;
}

export interface PlannerResponse {
  location: LocationInfo;
  activity_type: string;
  duration_minutes: number;
  best_windows: BestWindow[];
  hourly_schedule: ActivitySlotForecast[];
  confidence_level: string;
  uncertainty_explanation: string;
  disclaimer: string;
}

export interface IndoorSimulationDataPoint {
  minute: number;
  time_label: string;
  indoor_pm2_5: number;
  outdoor_pm2_5: number;
  indoor_naqi_category: string;
  active_sources: string;
}

export interface IndoorSimulationResponse {
  inputs_echo: Record<string, any>;
  peak_indoor_pm2_5: number;
  baseline_indoor_pm2_5: number;
  final_indoor_pm2_5: number;
  indoor_to_outdoor_ratio_peak: number;
  time_to_safe_baseline_minutes: number;
  trajectory: IndoorSimulationDataPoint[];
  counterfactual_scenario: {
    scenario: string;
    estimated_peak_pm25: number;
    reduction_percentage: string;
    benefit: string;
  };
  practical_action: string;
  model_assumptions: string[];
  uncertainty_warning: string;
}

export interface ExposureResponse {
  activity: string;
  duration_minutes: number;
  pm2_5_concentration: number;
  ventilation_rate_m3h: number;
  air_volume_inhaled_m3: number;
  inhaled_mass_micrograms: number;
  equivalent_baseline_hours: number;
  who_daily_budget_percentage: number;
  dose_comparison_clean_window: {
    clean_window_pm25: number;
    clean_window_dose_ug: number;
    dose_avoided_ug: number;
    percentage_saved: string;
  };
  scientific_basis: string;
  limitations_and_disclaimer: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AssistantChatResponse {
  reply: string;
  grounded_data: Record<string, any>;
  deterministic_recommendations: string[];
  confidence_level: string;
  data_limitations: string;
  is_fallback?: boolean;
}

export interface TransparencyInfo {
  connected_apis: Array<{
    name: string;
    purpose: string;
    status: string;
    refresh_interval: string;
    protocol: string;
  }>;
  data_availability_status: string;
  last_successful_sync: string;
  active_station: string;
  model_version: string;
  data_taxonomy: Record<string, string>;
  known_limitations: string[];
  attribution: Array<{ source: string; role: string }>;
}
