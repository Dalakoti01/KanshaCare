import { Earthquake } from "../models/earthquake.model.js";
import { Location } from "../models/location.model.js";
import { SyncLog } from "../models/synclogs.models.js";
import { TelegramSubscriber } from "../models/telegramSubscriber.model.js";
import bot from "./telegram.service.js";


export const checkHighSeverityAlerts =
async () => {

   try {

      const dangerousEarthquakes =
         await Earthquake.find({

            magnitude: { $gte: 5 },

            highSeverityAlertSent: false,
         });

      if (
         dangerousEarthquakes.length === 0
      ) return;

      const subscribers =
         await TelegramSubscriber.find();

      for (const quake of dangerousEarthquakes) {

         const message = `
🚨 HIGH SEVERITY EARTHQUAKE

Magnitude: ${quake.magnitude}

Location: ${quake.place}

Time:
${new Date(
   quake.eventTime
).toLocaleString()}

Significance:
${quake.significance}

Alert Level:
${quake.alertLevel || "Normal"}

Tsunami Risk:
${quake.tsunami ? "YES" : "NO"}

Dashboard:
https://kansha-care.vercel.app
`;

         for (const user of subscribers) {

            try {

               await bot.sendMessage(
                  user.chatId,
                  message
               );

            } catch(error) {

               console.log(error);
            }
         }

         // Prevent duplicate alerts
         quake.highSeverityAlertSent = true;

         await quake.save();
      }

   } catch(error) {

      console.log(error);
   }
};

export const checkSourceSilenceAlert = async () => {

   try {

      const latestSuccessfulSync =
         await SyncLog.findOne({

            status: "success",

         }).sort({ createdAt: -1 });

      if (!latestSuccessfulSync) return;

      const now = Date.now();

      const lastSuccess =
         new Date(
            latestSuccessfulSync.createdAt
         ).getTime();

      const differenceMinutes =
         (now - lastSuccess) / (1000 * 60);

      // More than 10 minutes silence
      if (differenceMinutes < 10) return;

      const subscribers =
         await TelegramSubscriber.find();

      const message = `
⚠️ SOURCE SILENCE ALERT

No successful USGS feed poll
for more than 10 minutes.

Last Successful Poll:
${new Date(
   latestSuccessfulSync.createdAt
).toLocaleString()}

Please investigate ingestion pipeline.
`;

      for (const user of subscribers) {

         try {

            await bot.sendMessage(
               user.chatId,
               message
            );

         } catch(error) {

            console.log(error);
         }
      }

   } catch(error) {

      console.log(error);
   }
};

export const checkLocationBasedAlerts =
async () => {

   try {

      const monitoredLocations =
         await Location.find();

      if (
         monitoredLocations.length === 0
      ) return;

      for (const location of monitoredLocations) {

         const nearbyDangerousEarthquakes =
            await Earthquake.find({

               magnitude: { $gte: 4 },

               locationAlertSent: false,

               location: {

                  $nearSphere: {

                     $geometry: {

                        type: "Point",

                        coordinates:
                           location.coordinates.coordinates,
                     },

                     $maxDistance:
                        500 * 1000,
                  },
               },
            });

         if (
            nearbyDangerousEarthquakes.length === 0
         ) continue;

         const subscribers =
            await TelegramSubscriber.find();

         for (
            const quake
            of nearbyDangerousEarthquakes
         ) {

            const message = `
📍 LOCATION ALERT

Monitored Location:
${location.cityName}

Earthquake Magnitude:
${quake.magnitude}

Earthquake Location:
${quake.place}

Time:
${new Date(
   quake.eventTime
).toLocaleString()}

Within 500 km monitoring radius.
`;

            for (const user of subscribers) {

               try {

                  await bot.sendMessage(
                     user.chatId,
                     message
                  );

               } catch(error) {

                  console.log(error);
               }
            }

            quake.locationAlertSent = true;

            await quake.save();
         }
      }

   } catch(error) {

      console.log(error);
   }
};