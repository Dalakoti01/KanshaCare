import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
  name: "location",

  initialState: {
    locations: [],

    selectedLocation: null,

    locationAnalytics: {},

    loading: false,

    error: null,
  },

  reducers: {
    // Set All Locations
    setLocations: (state, action) => {
      state.locations = action.payload;
    },

    // Add New Location
    addLocation: (state, action) => {
      state.locations.push(action.payload);
    },

    removeLocation: (state, action) => {
      state.locations = state.locations.filter(
        (location) => location._id !== action.payload,
      );
    },

    // Selected Location
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },

    // Analytics
    setLocationAnalytics: (state, action) => {
      state.locationAnalytics = action.payload;
    },

    // Loading
    setLocationLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error
    setLocationError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLocations,

  addLocation,
  removeLocation,

  setSelectedLocation,

  setLocationAnalytics,

  setLocationLoading,

  setLocationError,
} = locationSlice.actions;

export default locationSlice.reducer;
