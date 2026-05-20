import express from 'express';
import { dashboardStats, getAllEarthquakeFromModel, getAllEarthquakes, getSystemHealth, incidentTracker, syncHourlyEarthquakes } from '../controller/earthquake.controller.js';

const app = express();

const router = express.Router();

router.route('/allEarthquake').get(getAllEarthquakes)
router.route('/hourlyUpdate').get(syncHourlyEarthquakes)
router.route('/allEarthquakeFromModel').get(getAllEarthquakeFromModel)
router.route('/dashboardStat').get(dashboardStats)
router.route('/incidentTracker').get(incidentTracker)
router.route("/systemHealth").get(getSystemHealth);

export default router