import pandas as pd
import streamlit as st

# Configure page layout and style
st.set_page_config(
    page_title="Shifa Saudi Clinics Analytics",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS styling to match original emerald & Slate theme
st.markdown(
    """
    <style>
    .main-header {
        background-color: #064e3b;
        color: white;
        padding: 1.25rem;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
    }
    .info-box {
        background-color: rgba(2, 44, 34, 0.6);
        border: 1px solid rgba(4, 120, 87, 0.6);
        border-radius: 0.5rem;
        padding: 0.75rem;
        font-size: 0.8rem;
        color: #ecfdf5;
    }
    .stMetric {
        background-color: #ffffff;
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #e2e8f0;
    }
    </style>
""",
    unsafe_allow_html=True,
)


# --- Helper Data Functions ---
def parse_uploaded_file(uploaded_file) -> pd.DataFrame:
    """Parses Excel or CSV uploads into a pandas DataFrame."""
    try:
        if uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
        else:
            df = pd.read_excel(uploaded_file)
        return df
    except Exception as e:
        st.error(f"Error reading file: {e}")
        return pd.DataFrame()


def calculate_metrics(df: pd.DataFrame) -> dict:
    """Calculates core funnel and accounting metrics."""
    if df.empty:
        return {
            "total_spend": 0.0,
            "total_revenue": 0.0,
            "total_leads": 0,
            "total_conversions": 0,
            "roas": 0.0,
            "net_roi": 0.0,
        }

    # Standard metric calculations (adjust column names to match your schema if necessary)
    spend = df["spend"].sum() if "spend" in df.columns else 0.0
    revenue = df["revenue"].sum() if "revenue" in df.columns else 0.0
    leads = df["leads"].sum() if "leads" in df.columns else 0
    conversions = df["conversions"].sum() if "conversions" in df.columns else 0

    roas = (revenue / spend) if spend > 0 else 0.0
    net_roi = ((revenue - spend) / spend * 100) if spend > 0 else 0.0

    return {
        "total_spend": spend,
        "total_revenue": revenue,
        "total_leads": leads,
        "total_conversions": conversions,
        "roas": roas,
        "net_roi": net_roi,
    }


# --- Placeholder Sub-Components ---
def render_metric_cards(metrics: dict):
    """Renders key metrics across columns."""
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Total Spend (SAR)", f"{metrics['total_spend']:,.2f}")
    c2.metric("Total Revenue (SAR)", f"{metrics['total_revenue']:,.2f}")
    c3.metric("Total Leads", f"{metrics['total_leads']:,}")
    c4.metric("ROAS", f"{metrics['roas']:.2f}x")
    c5.metric("Net ROI", f"{metrics['net_roi']:.1f}%")


def render_clinic_region_analysis(df: pd.DataFrame):
    """Placeholder view for Clinic & Region EDA."""
    st.subheader("Clinic & Regional Exploratory Data Analysis (EDA)")
    st.caption(
        "Multi-clinic revenue comparison, Saudi city distribution, and patient funnel progression."
    )
    if "city" in df.columns and "revenue" in df.columns:
        city_rev = df.groupby("city")["revenue"].sum().reset_index()
        st.bar_chart(data=city_rev, x="city", y="revenue")
    else:
        st.dataframe(df)


def render_platform_campaign_summary(df: pd.DataFrame):
    """Placeholder view for Platforms & Campaigns ROI Summary."""
    st.subheader("Advertising Platforms & Campaign ROI Summary")
    st.caption(
        "Channel efficiency, conversion rates, ROAS, and net ROI by platform and campaign."
    )
    if "platform" in df.columns and "spend" in df.columns:
        plat_spend = df.groupby("platform")["spend"].sum().reset_index()
        st.bar_chart(data=plat_spend, x="platform", y="spend")
    else:
        st.dataframe(df)


def render_dataset_explorer(df: pd.DataFrame):
    """Dataset Explorer / Raw Data Ledger."""
    st.subheader("Dataset Ledger & Data Explorer")
    st.dataframe(df, use_container_width=True)


# --- Application State Initialization ---
if "records" not in st.session_state:
    st.session_state.records = None
if "file_name" not in st.session_state:
    st.session_state.file_name = ""

# --- Header & Top Bar Navigation ---
st.title("Shifa Saudi Clinics Analytics")

# File Upload Section (Zone 3 Action)
uploaded_file = st.sidebar.file_uploader(
    "Upload Excel / CSV", type=["csv", "xlsx", "xls"]
)

if uploaded_file is not None:
    df = parse_uploaded_file(uploaded_file)
    if not df.empty:
        st.session_state.records = df
        st.session_state.file_name = uploaded_file.name

if st.sidebar.button("Clear Data", disabled=(st.session_state.records is None)):
    st.session_state.records = None
    st.session_state.file_name = ""
    st.rerun()

# --- Main App Layout ---
if st.session_state.records is None:
    # Empty Upload State
    st.info(
        "👋 Welcome! Please upload a CSV or Excel file in the sidebar to populate the dashboard."
    )
else:
    records_df = st.session_state.records

    # Revenue & Attribution Banner
    st.markdown(
        f"""
        <div class="main-header">
            <div style="font-size: 0.8rem; color: #a7f3d0; font-family: monospace;">
                Loaded Dataset: <strong>{st.session_state.file_name}</strong> · 
                {len(records_df):,} Ad Records
            </div>
            <h2 style="margin-top: 0.25rem; font-weight: 700;">
                Saudi Healthcare Clinics Acquisition, Funnel & Revenue Performance
            </h2>
            <div class="info-box" style="margin-top: 0.75rem;">
                <strong>Financial & Attribution Rule:</strong> Revenue is reported in 
                <strong>SAR (excluding VAT)</strong> and credited to the day the lead arrived. 
                Real clinic visits occur days later. Revenue represents gross top-line receipts, 
                not profit (excludes clinical treatment costs).
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Filter Workspace Options
    cities = (
        ["ALL"] + sorted(records_df["city"].dropna().unique().tolist())
        if "city" in records_df.columns
        else ["ALL"]
    )
    specialties = (
        ["ALL"] + sorted(records_df["specialty"].dropna().unique().tolist())
        if "specialty" in records_df.columns
        else ["ALL"]
    )
    platforms = (
        ["ALL"] + sorted(records_df["platform"].dropna().unique().tolist())
        if "platform" in records_df.columns
        else ["ALL"]
    )

    st.sidebar.markdown("### 🔍 Filter Workspace")
    selected_city = st.sidebar.selectbox("City", cities)

    # Dynamic filter: Clinics subset by city
    if "clinic" in records_df.columns:
        subset = (
            records_df
            if selected_city == "ALL"
            else records_df[records_df["city"] == selected_city]
        )
        clinics = ["ALL"] + sorted(subset["clinic"].dropna().unique().tolist())
    else:
        clinics = ["ALL"]

    selected_clinic = st.sidebar.selectbox("Clinic", clinics)
    selected_specialty = st.sidebar.selectbox("Specialty", specialties)
    selected_platform = st.sidebar.selectbox("Platform", platforms)

    # Apply Filters
    filtered_df = records_df.copy()
    if selected_city != "ALL" and "city" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["city"] == selected_city]
    if selected_clinic != "ALL" and "clinic" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["clinic"] == selected_clinic]
    if selected_specialty != "ALL" and "specialty" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["specialty"] == selected_specialty]
    if selected_platform != "ALL" and "platform" in filtered_df.columns:
        filtered_df = filtered_df[filtered_df["platform"] == selected_platform]

    # Metrics Summary
    metrics = calculate_metrics(filtered_df)
    render_metric_cards(metrics)

    st.markdown("---")

    # Section Navigation Tabs
    tab_overview, tab_clinics, tab_platforms, tab_ledger = st.tabs(
        [
            "Executive Overview",
            "Clinics & Regions",
            "Platforms & Campaigns",
            "Dataset Ledger",
        ]
    )

    with tab_overview:
        render_clinic_region_analysis(filtered_df)
        st.markdown("---")
        render_platform_campaign_summary(filtered_df)

    with tab_clinics:
        render_clinic_region_analysis(filtered_df)

    with tab_platforms:
        render_platform_campaign_summary(filtered_df)

    with tab_ledger:
        render_dataset_explorer(filtered_df)

    # Footer
    st.markdown("---")
    st.caption(
        "Shifa Saudi Clinics Marketing & Funnel Intelligence | "
        "All monetary values in SAR (excluding 15% VAT) · Gross Revenue credited to Lead Arrival Date"
    )
