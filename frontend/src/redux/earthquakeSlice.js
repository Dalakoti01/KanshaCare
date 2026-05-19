import { createSlice } from "@reduxjs/toolkit";

const earthquakeSlice = createSlice({

  name: "earthquake",

  initialState: {

    // Incident Tracker
    allEarthquakes: [],

    incidentTracker: [],

    incidentPagination: {
      currentPage: 1,
      totalPages: 1,
      totalEarthquakes: 0,
      incidentsPerPage: 10,
    },

    // Dashboard Global Stats
    dashboardStats: {
      totalEarthquakes: 0,
      highSeverityCount: 0,
      tsunamiWarnings: 0,
      averageMagnitude: 0,
    },

    // System Health
    systemHealth: {
      lastSuccessfulPoll: null,
      pollSuccessRate: 0,
      currentFailures: 0,
      backfillCompleted: false,
    },

    // Time Filter
    selectedTimeRange: "24h",

    // Location Monitoring
    selectedLocations: [],

    // Loading States
    loading: false,

    // Errors
    error: null,
  },

  reducers: {

    // All Earthquakes
    setAllEarthquakes: (state, action) => {
      state.allEarthquakes = action.payload;
    },

    // Dashboard Stats
    setDashboardStats: (state, action) => {
      state.dashboardStats = action.payload;
    },

    // System Health
    setSystemHealth: (state, action) => {
      state.systemHealth = action.payload;
    },

    // Incident Tracker
    setIncidentTracker: (state, action) => {
      state.incidentTracker = action.payload;
    },

    // Incident Pagination
    setIncidentPagination: (state, action) => {
      state.incidentPagination = action.payload;
    },

    // Time Filter
    setSelectedTimeRange: (state, action) => {
      state.selectedTimeRange = action.payload;
    },

    // Locations
    setSelectedLocations: (state, action) => {
      state.selectedLocations = action.payload;
    },

    // Loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {

  setAllEarthquakes,

  setDashboardStats,

  setSystemHealth,

  setIncidentTracker,

  setIncidentPagination,

  setSelectedTimeRange,

  setSelectedLocations,

  setLoading,

  setError,

} = earthquakeSlice.actions;

export default earthquakeSlice.reducer;