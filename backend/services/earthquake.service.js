import axios from "axios";

import { Earthquake } from "../models/earthquake.model.js";
import { SyncLog } from "../models/synclogs.models.js";
import { checkHighSeverityAlerts, checkLocationBasedAlerts, checkSourceSilenceAlert } from "./alert.service.js";


export const syncHourlyEarthquakesService = async () => {

  console.log("Running earthquake hourly sync...");

  const startTime = Date.now();

  try {

    const response = await axios.get(

      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",

      {
        timeout: 10000,
      }
    );

    const earthquakes = response.data.features;

    const bulkOperations = earthquakes

      .filter(

        (quake) =>

          quake.geometry &&
          quake.geometry.coordinates &&
          quake.geometry.coordinates.length >= 3
      )

      .map((quake) => {

        return {

          updateOne: {

            filter: {
              earthquakeId: quake.id,
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
                    quake.geometry.coordinates[0],
                    quake.geometry.coordinates[1],
                  ],
                },

                depth: quake.geometry.coordinates[2],

                rawData: quake,
              },
            },

            upsert: true,
          },
        };
      });

    const result = await Earthquake.bulkWrite(
      bulkOperations
    );

    await checkHighSeverityAlerts();

    await checkSourceSilenceAlert();

    await checkLocationBasedAlerts();

    // SUCCESS LOG
    await SyncLog.create({

      status: "success",

      recordsFetched: earthquakes.length,

      insertedCount: result.upsertedCount,

      modifiedCount: result.modifiedCount,

      executionTimeMs:
        Date.now() - startTime,
    });

    console.log(
      "Hourly earthquake sync completed"
    );

    return {

      totalFetched: earthquakes.length,

      insertedCount: result.upsertedCount,

      modifiedCount: result.modifiedCount,
    };

  } catch(error) {

    console.log(
      "Hourly Earthquake Sync Failed"
    );

    console.log(error);

    // FAILURE LOG
    await SyncLog.create({

      status: "failure",

      errorMessage: error.message,

      executionTimeMs:
        Date.now() - startTime,
    });

    throw error;
  }
};