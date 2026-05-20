import { Earthquake } from "../models/earthquake.model.js";
import { Location } from "../models/location.model.js";
import { SyncLog } from "../models/synclogs.models.js";
import { TelegramSubscriber } from "../models/telegramSubscriber.model.js";
import bot from "../services/telegram.service.js";


export const sendDailySummary =
async (req, res) => {

   try {

      const last24Hours = new Date(
         Date.now() - 24 * 60 * 60 * 1000
      );

      // Earthquakes
      const earthquakes =
         await Earthquake.find({

            eventTime: {
               $gte: last24Hours,
            },
         });

      const totalEarthquakes =
         earthquakes.length;

      // Magnitude Breakdown
      const mag0to2 =
         earthquakes.filter(
            q => q.magnitude < 2
         ).length;

      const mag2to4 =
         earthquakes.filter(
            q =>
               q.magnitude >= 2 &&
               q.magnitude < 4
         ).length;

      const mag4plus =
         earthquakes.filter(
            q => q.magnitude >= 4
         ).length;

      // Top Active Regions
      const regionCount = {};

      earthquakes.forEach((quake) => {

         const region =
            quake.place?.split(",").pop()?.trim();

         if (!region) return;

         regionCount[region] =
            (regionCount[region] || 0) + 1;
      });

      const topRegions =
         Object.entries(regionCount)

         .sort((a, b) => b[1] - a[1])

         .slice(0, 3);

      // System Health
      const totalLogs =
         await SyncLog.countDocuments({

            createdAt: {
               $gte: last24Hours,
            },
         });

      const successfulLogs =
         await SyncLog.countDocuments({

            status: "success",

            createdAt: {
               $gte: last24Hours,
            },
         });

      const successRate =
         totalLogs > 0

         ? (
            (successfulLogs / totalLogs) * 100
           ).toFixed(2)

         : 0;

      // Locations
      const locations =
         await Location.find();

      // Subscribers
      const subscribers =
         await TelegramSubscriber.find();

      const locationSummary =
         locations.map((location) => {

            return `
${location.cityName}
Risk Score:
${location.riskScore}%
`;
         }).join("\n");

      const message = `
📊 DAILY EARTHQUAKE SUMMARY

Total Earthquakes:
${totalEarthquakes}

Magnitude Breakdown:
0-2 : ${mag0to2}
2-4 : ${mag2to4}
4+ : ${mag4plus}

🌍 Top Active Regions:
${topRegions.map(
   ([region, count], index) =>

`${index + 1}. ${region} (${count})`
).join("\n")}

📍 Monitored Locations:
${locationSummary}

⚙️ System Health:
Success Rate:
${successRate}%
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

      return res.status(200).json({

         success: true,

         message:
            "Daily summary sent successfully",
      });

   } catch(error) {

      console.log(error);

      return res.status(500).json({

         success: false,

         message:
            "Internal Server Error",
      });
   }
};