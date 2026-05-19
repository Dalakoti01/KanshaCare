import axios from "axios";

import { Location } from "../models/location.model.js";

import { Earthquake } from "../models/earthquake.model.js";

export const createLocation = async (req, res) => {

  try {

    const {
      cityName,
      monitoringRadius = 500,
      alertMagnitudeThreshold = 4.0,
    } = req.body;

    // Validation
    if (!cityName) {

      return res.status(400).json({

        message: "City name is required",

        success: false,
      });
    }

    // Check Existing Location
    const existingLocation = await Location.findOne({
      cityName: cityName,
    });

    if (existingLocation) {

      return res.status(400).json({

        message: "Location already exists",

        success: false,
      });
    }

    // Convert City -> Coordinates using OpenStreetMap
    const geoResponse = await axios.get(

      `https://nominatim.openstreetmap.org/search?q=${cityName}&format=json&limit=1`,

      {
        headers: {
          "User-Agent": "earthquake-monitoring-app",
        },
      }
    );

    if (!geoResponse.data || geoResponse.data.length === 0) {

      return res.status(404).json({

        message: "Location not found",

        success: false,
      });
    }

    const locationData = geoResponse.data[0];

    const latitude = Number(locationData.lat);

    const longitude = Number(locationData.lon);

    // Nearby Earthquakes Query
    const nearbyEarthquakes = await Earthquake.find({

      location: {

        $nearSphere: {

          $geometry: {

            type: "Point",

            coordinates: [longitude, latitude],
          },

          $maxDistance: monitoringRadius * 1000, // km -> meters
        },
      },
    });

    // Analytics Calculations
    const nearbyCount = nearbyEarthquakes.length;

    const strongestEvent =
      nearbyEarthquakes.length > 0
        ? Math.max(
            ...nearbyEarthquakes.map((quake) => quake.magnitude || 0)
          )
        : 0;

    const averageMagnitude =
      nearbyEarthquakes.length > 0
        ? (
            nearbyEarthquakes.reduce(
              (sum, quake) => sum + (quake.magnitude || 0),
              0
            ) / nearbyEarthquakes.length
          ).toFixed(2)
        : 0;

    // Risk Score Formula
    let riskScore = 0;

    nearbyEarthquakes.forEach((quake) => {

      const magnitudeWeight = quake.magnitude || 0;

      const tsunamiBonus = quake.tsunami === 1 ? 10 : 0;

      riskScore += magnitudeWeight * 5 + tsunamiBonus;
    });

    riskScore = Math.min(Math.round(riskScore), 100);

    // Create Location
    const newLocation = await Location.create({

      cityName,

      country: locationData.display_name,

      coordinates: {

        type: "Point",

        coordinates: [longitude, latitude],
      },

      monitoringRadius,

      alertMagnitudeThreshold,

      riskScore,

      lastCalculatedAt: new Date(),
    });

    return res.status(201).json({

      message: "Location monitoring created successfully",

      success: true,

      location: newLocation,

      analytics: {

        nearbyEarthquakes: nearbyCount,

        strongestEvent,

        averageMagnitude,

        riskScore,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      message: "Internal Server Error",

      success: false,
    });
  }
};


export const deleteLocation = async (req, res) => {

  try {

    const { id } = req.params;

    // Validation
    if (!id) {

      return res.status(400).json({

        message: "Location id is required",

        success: false,
      });
    }

    // Find & Delete
    const deletedLocation = await Location.findByIdAndDelete(id);

    if (!deletedLocation) {

      return res.status(404).json({

        message: "Location not found",

        success: false,
      });
    }

    return res.status(200).json({

      message: "Location deleted successfully",

      success: true,

      deletedLocation,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      message: "Internal Server Error",

      success: false,
    });
  }
};

export const allLocations = async (req, res) => {

  try {

    const allLocations = await Location.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({

      message: "All monitored locations fetched successfully",

      success: true,

      totalLocations: allLocations.length,

      allLocations,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      message: "Internal Server Error",

      success: false,
    });
  }
};