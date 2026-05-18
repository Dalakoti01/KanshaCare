import express from 'express';
import { getAllEarthquakes, syncHourlyEarthquakes } from '../controller/earthquake.controller.js';

const app = express();

const router = express.Router();

router.route('/allEarthquake').get(getAllEarthquakes)
router.route('/hourlyUpdate').get(syncHourlyEarthquakes)

export default router