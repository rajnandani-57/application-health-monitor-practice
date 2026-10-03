from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd


app = FastAPI()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def process_data():

    # Load dataset
    df = pd.read_csv("application_health_monitoring.csv")

    # -----------------------------
    # Feature Engineering
    # -----------------------------

    df["error_rate"] = (
        df["error_count"] / df["request_count"]
    )

    df["previous_response_time"] = (
        df.groupby("application_id")["response_time"]
        .shift(1)
    )

    df["change_in_response_time"] = (
        df["response_time"]
        - df["previous_response_time"]
    )

    # -----------------------------
    # Severity Classification
    # -----------------------------

    df.loc[
        df["error_rate"] > 0.10,
        "severity"
    ] = "Critical"

    df.loc[
        (df["error_rate"] > 0.05)
        & (df["error_rate"] <= 0.10),
        "severity"
    ] = "Warning"

    df.loc[
        df["error_rate"] <= 0.05,
        "severity"
    ] = "Healthy"

    return df


# Process the data
df = process_data()


# -----------------------------
# Application Summary
# -----------------------------

app_summary = (
    df.groupby("application_name")
    .agg(
        total_records=("application_name", "size"),

        critical_count=(
            "severity",
            lambda x: (x == "Critical").sum()
        ),

        warning_count=(
            "severity",
            lambda x: (x == "Warning").sum()
        ),

        avg_response_time=(
            "response_time",
            "mean"
        )
    )
    .reset_index()
)


# Determine overall application status

app_summary.loc[
    app_summary["critical_count"] > 0,
    "overall_status"
] = "Critical"


app_summary.loc[
    (app_summary["critical_count"] == 0)
    & (app_summary["warning_count"] > 0),
    "overall_status"
] = "Warning"


app_summary.loc[
    (app_summary["critical_count"] == 0)
    & (app_summary["warning_count"] == 0),
    "overall_status"
] = "Healthy"


# -----------------------------
# Critical Incidents
# -----------------------------

critical_incidents = df[
    df["severity"] == "Critical"
][
    [
        "timestamp",
        "application_name",
        "service_name",
        "error_type",
        "error_rate",
        "response_time"
    ]
]


# -----------------------------
# API Endpoints
# -----------------------------

@app.get("/")
def home():

    return {
        "message": "Application Health Monitoring API"
    }


@app.get("/health-summary")
def health_summary():

    return app_summary.to_dict(
        orient="records"
    )


@app.get("/critical-incidents")
def get_critical_incidents():

    return critical_incidents.to_dict(
        orient="records"
    )