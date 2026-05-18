import axios from "axios";
import { Earthquake } from "../models/earthquake.model.js";
import { syncHourlyEarthquakesService } from "../services/earthquake.service.js";

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