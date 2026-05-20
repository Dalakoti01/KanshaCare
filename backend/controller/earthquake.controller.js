import axios from "axios";
import { Earthquake } from "../models/earthquake.model.js";
import { syncHourlyEarthquakesService } from "../services/earthquake.service.js";
import { SyncLog } from "../models/synclogs.models.js";

export const   getAllEarthquakes = async (req, res) =>{
  try {

    const response = await axios.get(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
    );

    const earthquakes = response.data.features;

    const bulkOperations = earthquakes.map((quake) => {

      return {
        updateOne: {

          filter: {
            earthquakeId: quake.id
          },

          update: {

            $set: {

              earthquakeId: quake.id,

              magnitude: quake.properties.mag,

              place: quake.properties.place,

              title: quake.properties.title,

              eventTime: new Date(quake.properties.time),

              updatedTime: new Date(quake.properties.updated),

              status: quake.properties.status,

              tsunami: quake.properties.tsunami,

              alertLevel: quake.properties.alert,

              significance: quake.properties.sig,

              feltReports: quake.properties.felt,

              cdi: quake.properties.cdi,

              mmi: quake.properties.mmi,

              magType: quake.properties.magType,

              gap: quake.properties.gap,

              rms: quake.properties.rms,

              nst: quake.properties.nst,

              dmin: quake.properties.dmin,

              earthquakeType: quake.properties.type,

              location: {
                type: "Point",
                coordinates: [
                  quake.geometry.coordinates[0], // longitude
                  quake.geometry.coordinates[1]  // latitude
                ]
              },

              depth: quake.geometry.coordinates[2],

              rawData: quake
            }
          },

          upsert: true
        }
      };
    });

    const result = await Earthquake.bulkWrite(bulkOperations);

    return res.status(200).json({
      message: "Earthquake data synced successfully",
      success: true,

      totalFetched: earthquakes.length,

      insertedCount: result.upsertedCount,

      modifiedCount: result.modifiedCount
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
}

export const syncHourlyEarthquakes = async (req, res) => {

   try {

      const result = await syncHourlyEarthquakesService();

      return res.status(200).json({

         message: "Hourly earthquake sync completed successfully",

         success: true,

         ...result
      });

   } catch(error) {

      console.log(error);

      return res.status(500).json({
         message: "Internal Server Error",
         success: false
      });

   }
};

export const getAllEarthquakeFromModel = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const totalEarthquakes = await Earthquake.countDocuments();

    const allEarthquakes = await Earthquake.find()
      .sort({ eventTime: -1 })

      .select(
        "earthquakeId magnitude place title eventTime alertLevel significance tsunami location depth"
      )

      .skip(skip)
      .limit(limit)

      .lean();

    return res.status(200).json({
      message: "Earthquakes fetched successfully",
      success: true,

      currentPage: page,
      totalPages: Math.ceil(totalEarthquakes / limit),

      totalEarthquakes,

      earthquakesPerPage: limit,

      allEarthquakes,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const dashboardStats = async (req, res) => {

  try {

    // Get time range from query
    const range = req.query.range || "24h";

    // Current date
    const currentDate = new Date();

    // Calculate start date based on range
    let startDate = new Date();

    switch (range) {

      case "1h":
        startDate.setHours(currentDate.getHours() - 1);
        break;

      case "24h":
        startDate.setHours(currentDate.getHours() - 24);
        break;

      case "7d":
        startDate.setDate(currentDate.getDate() - 7);
        break;

      case "30d":
        startDate.setDate(currentDate.getDate() - 30);
        break;

      default:
        startDate.setHours(currentDate.getHours() - 24);
    }

    // Fetch earthquakes within selected time range
    const earthquakes = await Earthquake.find({
      eventTime: {
        $gte: startDate
      }
    }).lean();

    // Total earthquakes
    const totalEarthquakes = earthquakes.length;

    // High severity earthquakes
    const highSeverityCount = earthquakes.filter(
      (quake) => quake.magnitude >= 5
    ).length;

    // Tsunami warnings
    const tsunamiWarnings = earthquakes.filter(
      (quake) => quake.tsunami === 1
    ).length;

    // Average magnitude
    const averageMagnitude =
      totalEarthquakes > 0
        ? (
            earthquakes.reduce(
              (sum, quake) => sum + (quake.magnitude || 0),
              0
            ) / totalEarthquakes
          ).toFixed(1)
        : 0;

    // Strongest earthquake
    const strongestEarthquake =
      totalEarthquakes > 0
        ? Math.max(...earthquakes.map((quake) => quake.magnitude || 0))
        : 0;

    // Recent earthquakes in last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(currentDate.getHours() - 1);

    const recentEarthquakes = earthquakes.filter(
      (quake) => quake.eventTime >= oneHourAgo
    ).length;

    return res.status(200).json({

      message: "Dashboard stats fetched successfully",

      success: true,

      selectedRange: range,

      stats: {

        totalEarthquakes,

        highSeverityCount,

        tsunamiWarnings,

        averageMagnitude: Number(averageMagnitude),

        strongestEarthquake,

        recentEarthquakes
      }
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

export const incidentTracker = async (req, res) => {

  try {

    // Query Params
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const range = req.query.range || "24h";

    const skip = (page - 1) * limit;

    // Current Date
    const currentDate = new Date();

    // Time Filter
    let startDate = new Date();

    switch (range) {

      case "1h":
        startDate.setHours(currentDate.getHours() - 1);
        break;

      case "24h":
        startDate.setHours(currentDate.getHours() - 24);
        break;

      case "7d":
        startDate.setDate(currentDate.getDate() - 7);
        break;

      case "30d":
        startDate.setDate(currentDate.getDate() - 30);
        break;

      default:
        startDate.setHours(currentDate.getHours() - 24);
    }

    // Total Count
    const totalEarthquakes = await Earthquake.countDocuments({
      eventTime: {
        $gte: startDate
      }
    });

    // Fetch Incidents
    const incidents = await Earthquake.find({
      eventTime: {
        $gte: startDate
      }
    })

      .sort({ eventTime: -1 })

      .skip(skip)

      .limit(limit)

      .select(
        `
        earthquakeId
        magnitude
        place
        title
        eventTime
        alertLevel
        significance
        tsunami
        depth
        location
        `
      )

      .lean();

    return res.status(200).json({

      message: "Incident tracker data fetched successfully",

      success: true,

      currentPage: page,

      totalPages: Math.ceil(totalEarthquakes / limit),

      totalEarthquakes,

      incidentsPerPage: limit,

      incidents
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      message: "Internal Server Error",

      success: false
    });
  }
};




export const getSystemHealth = async (req, res) => {

  try {

    // Time Range -> Last 1 Hour
    const oneHourAgo = new Date(
      Date.now() - 60 * 60 * 1000
    );

    // Fetch Logs From Last Hour
    const lastHourLogs = await SyncLog.find({
      createdAt: { $gte: oneHourAgo },
    }).sort({ createdAt: -1 });

    // Total Logs
    const totalLogs = lastHourLogs.length;

    // Success Logs
    const successfulLogs = lastHourLogs.filter(
      (log) => log.status === "success"
    );

    // Failure Logs
    const failedLogs = lastHourLogs.filter(
      (log) => log.status === "failure"
    );

    // Latest Successful Poll
    const latestSuccessfulLog = successfulLogs[0];

    // Success Rate Calculation
    const successRate =
      totalLogs > 0
        ? (
            (successfulLogs.length / totalLogs) *
            100
          ).toFixed(2)
        : 0;

    // Average Execution Time
    const averageExecutionTime =
      successfulLogs.length > 0
        ? Math.round(

            successfulLogs.reduce(
              (sum, log) =>
                sum + (log.executionTimeMs || 0),
              0
            ) / successfulLogs.length
          )
        : 0;

    // Initial Backfill Status
    const totalEarthquakes =
      await Earthquake.countDocuments();

    const backfillCompleted =
      totalEarthquakes >= 10000;

    // Latest Failure Message
    const latestFailureLog = failedLogs[0];

    return res.status(200).json({

      message:
        "System health fetched successfully",

      success: true,

      systemHealth: {

        // Assignment Required
        lastSuccessfulPoll:
          latestSuccessfulLog?.createdAt || null,

        successRate: Number(successRate),

        currentFailures:
          failedLogs.length,

        backfillCompleted,

        // Extra Operational Metrics
        averageExecutionTime,

        totalSyncsLastHour: totalLogs,

        totalSuccessfulSyncs:
          successfulLogs.length,

        totalFailedSyncs:
          failedLogs.length,

        latestFailureMessage:
          latestFailureLog?.errorMessage || null,

        totalEarthquakes,
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