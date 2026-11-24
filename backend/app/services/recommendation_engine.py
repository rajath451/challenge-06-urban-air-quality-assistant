from typing import List, Dict, Any, Optional
from app.schemas.models import (
    CurrentAirQuality, UserPreferences, DailyRoutinePlan, DailyRoutineScheduleItem,
    RecommendationItem, IndoorHack
)

INDOOR_HACKS_CATALOG: List[IndoorHack] = [
    IndoorHack(
        id="corsi-rosenthal-box",
        title="DIY Corsi-Rosenthal Box Air Purifier",
        difficulty="Easy",
        estimated_cost="$35 - $45 (vs $350+ commercial HEPA)",
        expected_benefit="85–90% reduction in indoor PM2.5 in 30 mins",
        icon_name="Wind",
        description="A proven open-source air filter made with a standard 20-inch box fan and four MERV-13 furnace filters taped into a cube. Delivers equal or higher Clean Air Delivery Rate (CADR) than high-end purifiers.",
        steps=[
            "Purchase one 20x20 inch box fan and four 20x20x1 or 20x20x2 MERV-13 filters.",
            "Form a 4-sided cube with the filters, ensuring the arrows on all filters point inward toward the center.",
            "Seal all edges and filter seams completely using duct tape or painter's tape.",
            "Tape a 20x20 cardboard sheet to the bottom to close the cube base.",
            "Mount the box fan on top, blowing upwards (pulling air through the 4 filter sides), and seal the fan perimeter.",
            "Add an optional cardboard circular shroud on the fan face to eliminate corner air back-draft."
        ],
        scientific_basis="Evaluated and validated by UC Davis and EPA researchers. Provides up to 600 CFM clean air delivery with low noise and minimal motor strain due to 4x surface area."
    ),
    IndoorHack(
        id="thermal-inversion-ventilation",
        title="Inversion-Aligned Smart Cross-Ventilation",
        difficulty="Easy",
        estimated_cost="Free ($0)",
        expected_benefit="Flushes indoor CO2 and VOCs without letting peak PM2.5 inside",
        icon_name="Clock",
        description="In severe winter smog, ground-level thermal inversions trap toxic exhaust between 6:00 AM and 10:30 AM. Ventilating only during afternoon convective heating prevents smoke ingress.",
        steps=[
            "Strictly seal all windows and exterior vents between 6:00 AM and 11:30 AM.",
            "Between 1:30 PM and 3:30 PM, check your AeroPulse dashboard. When ambient PM2.5 drops to its diurnal minimum, crack open two opposite-facing windows for exactly 15–20 minutes.",
            "Immediately reseal windows before sunset (4:30 PM) as surface cooling begins re-trapping emissions.",
            "Run your indoor filter at high speed for 15 minutes after resealing windows."
        ],
        scientific_basis="Atmospheric boundary layers expand during peak solar insolation (early afternoon), dispersing ground-level particulates by 40-60% compared to dawn hours."
    ),
    IndoorHack(
        id="damp-microfiber-mopping",
        title="Wet Dusting & Static Microfiber Protocol",
        difficulty="Easy",
        estimated_cost="$5 - $10",
        expected_benefit="Prevents up to 70% of settled fine particles from being resuspended",
        icon_name="Sparkles",
        description="Dry broom sweeping and feather dusters propel toxic heavy-metal particles and fine soot back into the air at head height. Wet wiping physically captures and neutralizes them.",
        steps=[
            "Never use dry brooms or vacuum cleaners without certified HEPA exhaust filters.",
            "Dampen a microfiber flat mop with clean warm water (with a drop of mild dish soap).",
            "Mop in smooth single-direction strokes from back rooms toward exits twice daily during smog weeks.",
            "Wipe tabletop and window ledge surfaces with moist microfiber cloths.",
            "Rinse mops thoroughly in a bucket to flush particulate directly down the drain."
        ],
        scientific_basis="Fine particulates (PM2.5) adhere electrostatically to moisture and microfiber loops, permanently removing them from aerosol suspension."
    ),
    IndoorHack(
        id="kitchen-exhaust-containment",
        title="Culinary Emission Zone Containment",
        difficulty="Medium",
        estimated_cost="$0 - $15",
        expected_benefit="Prevents indoor PM2.5 spikes from exceeding 400 µg/m³ during meals",
        icon_name="Flame",
        description="Frying, roasting, and tadka seasoning generate ultra-fine aerosols, aldehydes, and carbon monoxide that linger for hours if not immediately evacuated.",
        steps=[
            "Turn on the kitchen exhaust hood on HIGH 2 minutes before igniting gas burners.",
            "Keep the kitchen door closed to prevent aerosol migration into bedrooms and living rooms.",
            "Cover cooking pans with tight lids whenever boiling, simmering, or light frying.",
            "Leave the exhaust on for 5 to 7 minutes after finishing cooking to clear residual emissions.",
            "If using LPG or gas stoves, ensure a small fresh air crack in the kitchen window to prevent negative pressure combustion."
        ],
        scientific_basis="Cooking fumes without active exhaust represent the single largest indoor pollution spike in urban homes, frequently matching severe smog levels."
    ),
    IndoorHack(
        id="weatherstripping-sealing",
        title="Draft Sealing & Door Sweep Installation",
        difficulty="Medium",
        estimated_cost="$10 - $20",
        expected_benefit="Cuts exterior smog infiltration by 35–50%",
        icon_name="ShieldCheck",
        description="Winter winds and door drafts pull outdoor toxic smoke through microscopic door and window perimeter gaps through stack effect.",
        steps=[
            "Run your hand or a lit incense stick along exterior door bottoms and window frames to detect airflow leaks.",
            "Apply adhesive silicone or rubber weatherstripping tape along window perimeter channels.",
            "Install an adjustable twin-draft door sweep or heavy rolled towel at the base of main entrance doors.",
            "Seal AC sleeve gaps and wall pass-through conduits with removable silicone putty."
        ],
        scientific_basis="Reduces building air infiltration rate (ACH - Air Changes per Hour) from leaky 1.5 ACH down to 0.4 ACH, enabling purifiers to maintain clean air thresholds."
    ),
    IndoorHack(
        id="indoor-humidity-balance",
        title="Optimal Relative Humidity (40–50% RH)",
        difficulty="Easy",
        estimated_cost="$15 - $30 (or shallow bowls of water)",
        expected_benefit="Accelerates gravitational settling of airborne aerosols and protects mucosal barriers",
        icon_name="Droplets",
        description="Dry winter air (below 30% RH) dries out nasal mucosa and lets aerosol droplets float indefinitely. Balanced humidity causes fine particles to agglomerate and drop out of breathing zones.",
        steps=[
            "Monitor indoor humidity using a simple digital hygrometer.",
            "If humidity is below 35%, place wide, shallow pans of clean water near warm radiators, or use an ultrasonic humidifier with distilled/filtered water.",
            "Maintain humidity between 40% and 50% — never exceed 55% to prevent mold and dust mite proliferation.",
            "Clean humidifier tanks daily to prevent aerosolizing mineral or bacterial slime."
        ],
        scientific_basis="40–50% relative humidity optimizes human airway ciliary clearance and increases aerosol droplet mass, facilitating faster deposition onto floors where it can be damp-mopped."
    )
]

def generate_recommendations(aqi_data: CurrentAirQuality, prefs: UserPreferences) -> List[RecommendationItem]:
    items: List[RecommendationItem] = []
    aqi = aqi_data.aqi_us
    pm25 = aqi_data.pm2_5

    if aqi > 200:
        items.append(RecommendationItem(
            id="rec-urgent-mask",
            title="Wear Certified N95 / FFP2 Respirator Outdoors",
            category="health",
            severity="urgent",
            description=f"Current AQI is {aqi} (PM2.5: {pm25} µg/m³). Avoid cloth and surgical masks, which leak up to 80% of fine sub-micron smog particles.",
            why_it_matters="Fine particulates enter bloodstream directly, causing acute cardiovascular stress and throat irritation.",
            impact_metrics={"PM2.5 Filtration": "≥95%", "Respiratory Risk Cut": "65%"}
        ))
        items.append(RecommendationItem(
            id="rec-indoor-containment",
            title="Seal Bedroom & Run Continuous Filtration",
            category="indoor",
            severity="urgent",
            description="Keep all exterior windows shut during morning hours. Prioritize running your air purifier or DIY Corsi-Rosenthal unit in occupied bedrooms.",
            why_it_matters="Morning temperature inversion concentrates ground-level vehicular smoke until solar heat disperses it in the afternoon.",
            impact_metrics={"Indoor Exposure Avoided": "80 µg/m³", "Sleep Quality Gain": "+30%"}
        ))
    elif aqi > 100:
        items.append(RecommendationItem(
            id="rec-mod-routine",
            title="Shift Outdoor Exertion to Afternoon Window",
            category="routine",
            severity="moderate",
            description="Postpone brisk walks and grocery errands to 1:00 PM – 3:30 PM when surface thermal inversion breaks.",
            why_it_matters="Pollutant dispersion is 40% higher at solar peak than at 7:00 AM.",
            impact_metrics={"Diurnal Exposure Reduction": "35%", "Optimal Window": "1:00 - 3:30 PM"}
        ))

    # Commute recommendation based on user preferences
    if prefs.commute_mode in ["Car / Cab", "Motorcycle"]:
        items.append(RecommendationItem(
            id="rec-commute-shift",
            title="Shift Commute to Electric Metro / Group Carpool",
            category="commute",
            severity="moderate" if aqi > 150 else "optimal",
            description=f"Replacing your {prefs.daily_commute_km} km solo vehicle commute with metro rail or shared transit prevents direct exposure in bumper-to-bumper tailpipe plumes.",
            why_it_matters="Car cabin air during traffic jams contains 3x more toxic CO and benzene than ambient urban air.",
            impact_metrics={
                "Daily CO2 Saved": f"{round(prefs.daily_commute_km * 0.18, 1)} kg",
                "PM2.5 Avoided": f"{round(prefs.daily_commute_km * 3.2, 0)} µg"
            }
        ))
    else:
        items.append(RecommendationItem(
            id="rec-commute-metro",
            title="Sustain Low-Emission Commute on Mass Transit",
            category="commute",
            severity="optimal",
            description=f"You are already saving ~{round(prefs.daily_commute_km * 0.18, 1)} kg CO2 daily by riding public transit. Ensure you wear a mask while waiting on outdoor platforms.",
            why_it_matters="Reduces citywide congestion and avoids vehicle cold-start emissions.",
            impact_metrics={
                "Daily CO2 Saved": f"{round(prefs.daily_commute_km * 0.18, 1)} kg CO2",
                "Community Impact": "High"
            }
        ))

    # Household-specific item
    if prefs.has_children or prefs.has_elderly or prefs.has_respiratory_sensitivity:
        items.append(RecommendationItem(
            id="rec-sensitive-protect",
            title="High-Priority Protection for Vulnerable Household Members",
            category="health",
            severity="urgent" if aqi > 150 else "moderate",
            description="Children's airways and elderly cardiovascular systems are significantly more reactive to PM2.5 spikes. Keep physical activities indoor-only today.",
            why_it_matters="Children inhale 50% more air per kg than adults, amplifying internal dosage.",
            impact_metrics={"Vulnerability Index": "High Risk", "Action": "Strict Indoor Play"}
        ))

    return items

def generate_daily_routine_plan(aqi_data: CurrentAirQuality, prefs: UserPreferences) -> DailyRoutinePlan:
    aqi = aqi_data.aqi_us
    pm25 = aqi_data.pm2_5

    schedule: List[DailyRoutineScheduleItem] = [
        DailyRoutineScheduleItem(
            time_slot="06:30 AM – 08:30 AM",
            activity="Morning Wakeup & School/Work Prep",
            air_quality_risk="Extreme" if aqi > 200 else ("High" if aqi > 100 else "Moderate"),
            recommended_action="Keep windows sealed. Avoid early morning balcony exercises or jogging. Use wet mop for floor cleaning.",
            sustainable_alternative="Indoor yoga or bodyweight stretching; prepare a warm herbal tea to soothe airways.",
            pm25_exposure_saved_ug=round(pm25 * 0.75 * 1.5, 1),
            co2_saved_kg=0.0
        ),
        DailyRoutineScheduleItem(
            time_slot="08:30 AM – 09:30 AM",
            activity="Daily Work & School Commute",
            air_quality_risk="High" if aqi > 150 else "Moderate",
            recommended_action="Wear N95 respirator at bus stops/metro stations. Set car AC to Internal Recirculation mode.",
            sustainable_alternative=f"Opt for Electric Metro / Bus over single-occupancy cab. Saves {round(prefs.daily_commute_km * 0.18, 1)} kg CO2.",
            pm25_exposure_saved_ug=round(pm25 * 0.6 * 1.0, 1),
            co2_saved_kg=round(prefs.daily_commute_km * 0.18, 2)
        ),
        DailyRoutineScheduleItem(
            time_slot="12:30 PM – 03:00 PM",
            activity="Lunch & Daylight Convection Window",
            air_quality_risk="Moderate" if aqi > 150 else "Low",
            recommended_action="Optimal time of day! Crack open opposite windows for 15-20 mins for fresh air exchange if PM2.5 dips.",
            sustainable_alternative="Walk to lunch or nearby stores; run outdoor errands before sunset smog traps build.",
            pm25_exposure_saved_ug=round(pm25 * 0.3 * 1.0, 1),
            co2_saved_kg=0.4
        ),
        DailyRoutineScheduleItem(
            time_slot="05:30 PM – 07:00 PM",
            activity="Evening Return Commute",
            air_quality_risk="High" if aqi > 150 else "Moderate",
            recommended_action="Reseal windows before sunset. Avoid lingering near roadside food carts and idling vehicular traffic.",
            sustainable_alternative="Carpool with colleagues or take rapid transit; combine grocery errands into one single route.",
            pm25_exposure_saved_ug=round(pm25 * 0.5 * 1.2, 1),
            co2_saved_kg=0.6
        ),
        DailyRoutineScheduleItem(
            time_slot="07:30 PM – 10:30 PM",
            activity="Dinner & Bedtime Wind-Down",
            air_quality_risk="Extreme" if aqi > 200 else "High",
            recommended_action="Run kitchen exhaust hood on HIGH during cooking. Turn on bedroom air purifier 30 mins before sleep.",
            sustainable_alternative="Cover cooking pans with lids to trap aerosolized fats and cook in batches to save gas/power.",
            pm25_exposure_saved_ug=round(pm25 * 0.8 * 2.0, 1),
            co2_saved_kg=0.3
        )
    ]

    total_pm25 = sum(item.pm25_exposure_saved_ug for item in schedule)
    total_co2 = sum(item.co2_saved_kg for item in schedule)

    alert_summary = (
        f"Winter Smog Protocol Active: Current AQI is {aqi} ({aqi_data.aqi_category}). "
        f"Avoid morning outdoor exposure and leverage the 1:00–3:30 PM convective window."
        if aqi > 150 else
        f"Moderate Ambient Air Quality: Current AQI is {aqi}. General activities permitted; maintain afternoon ventilation timing."
    )

    return DailyRoutinePlan(
        summary=f"Personalized low-emission daily schedule for a household of {prefs.household_size} in {aqi_data.location.name}.",
        air_quality_alert=alert_summary,
        schedule=schedule,
        total_pm25_avoided_ug=round(total_pm25, 1),
        total_co2_saved_kg=round(total_co2, 2),
        sustainable_transport_advice=(
            "Combining errands and switching to electric mass transit avoids roadside exhaust tunnels "
            f"and saves an estimated {round(prefs.daily_commute_km * 0.18, 1)} kg CO2 per day."
        )
    )
