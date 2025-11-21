
const USER_AGENT = "weather-app/1.0";

export async function makeNWSRequest<T>(url: string): Promise<T | null> {
    const headers = {
        "User-Agent": USER_AGENT,
        Accept: "application/geo+json"
    };

    try {
        const response = await fetch(url, { headers });
        if(!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making NWS request:", error);
        return null;
    }
}

interface AlertFeature {
    properties: {
        event?: string;
        areaDesc?: string;
        severity?: string;
        status?: string;
        headline?: string;
    };
}

export function formatAlert(feature: AlertFeature): string {
    const props = feature.properties;
    return [
        `Event: ${props.event || "UNknown"}`,
        `Area: ${props.areaDesc || "UNknown"}`,
        `Severity: ${props.severity || "UNknown"}`,
        `Status: ${props.status || "UNknown"}`,
        `Headline: ${props.headline || "No headline"}`,
        "---"
    ].join("\n");
}

export interface ForecastPeriod {
    name?: string;
    temperature?: number;
    temperatureUnit?: string;
    windSpeed?: string;
    windDirection?: string;
    shortForecast?: string;
}

export interface AlertsResponse {
    features: AlertFeature[];
}

export interface PointsResponse {
    properties: {
        forecast?: string;
    }
}

export interface ForecastResponse {
    properties: {
        periods: ForecastPeriod[];
    }
}