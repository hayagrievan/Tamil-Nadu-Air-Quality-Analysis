# Tamil Nadu Air Quality Analysis Using Remote Sensing

## Project Overview

This project analyzes satellite-derived atmospheric pollutant concentrations across Tamil Nadu, India, using Google Earth Engine (GEE). It compares selected periods before, during, and after the COVID-19 pandemic to examine spatial and temporal variations in atmospheric pollutants.

The project uses Sentinel-5P satellite datasets to visualize pollutant distributions, sample pollutant values at district centroids, compare different periods, and export the results for further analysis.

## Objectives

- Analyze atmospheric pollutants across Tamil Nadu.
- Compare pollutant levels before, during, and after the COVID-19 pandemic.
- Visualize the spatial distribution of selected atmospheric gases.
- Compare pollutant index values across districts and time periods.
- Generate charts for pollutant-wise and district-wise comparisons.
- Export the collected results as a CSV file for further analysis.

## Study Area

**Location:** Tamil Nadu, India

The project uses district boundaries from the FAO Global Administrative Unit Layers (GAUL) dataset available in Google Earth Engine. District geometries are simplified to improve processing efficiency.

## Study Periods

| Period | Date Range |
|---|---|
| Pre-COVID | January–December 2019 |
| During-COVID | January–December 2020 |
| Post-COVID | January 2021–December 2022 |

These periods are defined in the GEE script for comparative analysis.

## Data Sources

The project uses the following Sentinel-5P OFFL Level-3 datasets available in Google Earth Engine:

| Pollutant | Dataset ID | Selected Band |
|---|---|---|
| Nitrogen Dioxide (NO₂) | `COPERNICUS/S5P/OFFL/L3_NO2` | `NO2_column_number_density` |
| Carbon Monoxide (CO) | `COPERNICUS/S5P/OFFL/L3_CO` | `CO_column_number_density` |
| Sulphur Dioxide (SO₂) | `COPERNICUS/S5P/OFFL/L3_SO2` | `SO2_column_number_density` |
| Ozone (O₃) | `COPERNICUS/S5P/OFFL/L3_O3` | `O3_column_number_density` |
| Methane (CH₄) | `COPERNICUS/S5P/OFFL/L3_CH4` | `CH4_column_volume_mixing_ratio_dry_air` |

## Methodology

1. **Study area preparation:** Load Tamil Nadu district boundaries and simplify their geometries.
2. **Sampling locations:** Generate one centroid point for each district.
3. **Satellite data filtering:** Select pollutant datasets for each study period.
4. **Temporal aggregation:** Calculate the mean image for each pollutant and period.
5. **Index scaling:** Scale each pollutant's values to a nominal 0–500 range using the configured minimum and maximum values.
6. **Spatial visualization:** Display pollutant index maps and a combined maximum-index map for each period.
7. **District sampling:** Sample the scaled image