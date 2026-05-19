import express from "express"
import { allLocations, createLocation, deleteLocation } from "../controller/location.controller.js";
const app = express();
const router = express.Router();

router.route('/create').post(createLocation)
router.route("/delete/:id").delete(deleteLocation);
router.route("/all").get(allLocations)
export default router