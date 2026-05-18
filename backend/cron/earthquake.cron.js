import cron from "node-cron";
import { syncHourlyEarthquakesService } from "../services/earthquake.service.js";

const startEarthquakeCron = () => {

   cron.schedule("* * * * *", async () => {

      console.log("Running earthquake hourly sync...");

      try {

         await syncHourlyEarthquakesService();

         console.log("Hourly earthquake sync completed");

      } catch(error) {

         console.log("Cron Sync Error");

         console.log(error);

      }

   });

};

export default startEarthquakeCron;