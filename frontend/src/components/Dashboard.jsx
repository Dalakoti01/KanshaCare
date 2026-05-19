import { useState } from "react";

import { useSelector, useDispatch } from "react-redux";

import axios from "axios";

import toast from "react-hot-toast";

import useGetDashboardStats from "../hooks/useGetDashboardStats.js";

import useGetIncidentTracker from "../hooks/useGetIncidentTracker.js";

import {
  addLocation,
  removeLocation,
} from "../redux/locationSlice.js";
import useGetAllLocations from "../hooks/useGetAllLocations.js";

export default function Dashboard() {

  const dispatch = useDispatch();

  const [selectedRange, setSelectedRange] = useState("24h");

  const [currentPage, setCurrentPage] = useState(1);

  const [cityName, setCityName] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);

  const backendUri =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:8000";

  useGetDashboardStats(selectedRange);

  useGetIncidentTracker(selectedRange, currentPage, 10);

  useGetAllLocations()

  const {
    dashboardStats,
    incidentTracker,
    incidentPagination,
    loading,
  } = useSelector((store) => store.earthquake);

  const { locations } = useSelector(
    (store) => store.location
  );

  const getSeverityColor = (magnitude) => {

    if (magnitude >= 6) return "bg-red-500";

    if (magnitude >= 5) return "bg-orange-500";

    if (magnitude >= 4) return "bg-yellow-500";

    return "bg-green-500";
  };

  const handleDeleteLocation = async (locationId) => {

  try {

    const res = await axios.delete(
      `${backendUri}/api/location/delete/${locationId}`
    );

    if (res.data.success) {

      dispatch(removeLocation(locationId));

      toast.success(res.data.message);

    } else {

      toast.error(res.data.message);
    }

  } catch (error) {

    console.log(error);

    toast.error(
      error?.response?.data?.message ||
      "Failed to delete location"
    );
  }
};

  const handleAddLocation = async () => {

    try {

      if (!cityName.trim()) {

        return toast.error("City name is required");
      }

      if (locations.length >= 3) {

        return toast.error(
          "Maximum 3 monitored locations allowed"
        );
      }

      setLocationLoading(true);

      const res = await axios.post(
        `${backendUri}/api/location/create`,
        {
          cityName,
        }
      );

      if (res.data.success) {

        dispatch(
          addLocation({
            ...res.data.location,
            analytics: res.data.analytics,
          })
        );

        toast.success(res.data.message);

        setCityName("");

      } else {

        toast.error(res.data.message);
      }

    } catch (error) {

      console.log(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to create location"
      );

    } finally {

      setLocationLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#0b1120] text-white">

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-[#111827] px-6 py-4">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold tracking-wide">
              Earthquake Monitoring Dashboard
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Real-time global seismic intelligence system
            </p>

          </div>

          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-400 border border-green-500/30">

              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>

              LIVE

            </div>

            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition cursor-pointer">

              Refresh

            </button>

          </div>

        </div>

      </nav>

      <div className="p-6 space-y-8">

        {/* Global Stats */}
        <section>

          <div className="mb-5 flex items-center justify-between flex-wrap gap-4">

            <div>

              <h2 className="text-2xl font-semibold">
                Global Overview
              </h2>

              <p className="text-gray-400 text-sm mt-1">
                Worldwide earthquake activity monitoring
              </p>

            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">

              {[
                { label: "Last Hour", value: "1h" },
                { label: "24 Hours", value: "24h" },
                { label: "7 Days", value: "7d" },
                { label: "30 Days", value: "30d" },
              ].map((item) => (

                <button
                  key={item.value}

                  onClick={() => {
                    setSelectedRange(item.value);
                    setCurrentPage(1);
                  }}

                  className={`rounded-xl border px-4 py-2 text-sm transition cursor-pointer

                  ${
                    selectedRange === item.value
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >

                  {item.label}

                </button>

              ))}

            </div>

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            {/* Total Earthquakes */}
            <div className="rounded-3xl bg-gradient-to-br from-red-500/20 to-red-800/10 border border-red-500/20 p-6">

              <p className="text-sm text-red-300">
                Total Earthquakes
              </p>

              <h3 className="mt-3 text-4xl font-bold">

                {loading
                  ? "..."
                  : dashboardStats?.totalEarthquakes || 0}

              </h3>

              <p className="mt-2 text-xs text-gray-400">
                Total detected events
              </p>

            </div>

            {/* High Severity */}
            <div className="rounded-3xl bg-gradient-to-br from-orange-500/20 to-orange-800/10 border border-orange-500/20 p-6">

              <p className="text-sm text-orange-300">
                High Severity
              </p>

              <h3 className="mt-3 text-4xl font-bold">

                {loading
                  ? "..."
                  : dashboardStats?.highSeverityCount || 0}

              </h3>

              <p className="mt-2 text-xs text-gray-400">
                Magnitude above 5.0
              </p>

            </div>

            {/* Tsunami Warnings */}
            <div className="rounded-3xl bg-gradient-to-br from-cyan-500/20 to-cyan-800/10 border border-cyan-500/20 p-6">

              <p className="text-sm text-cyan-300">
                Tsunami Warnings
              </p>

              <h3 className="mt-3 text-4xl font-bold">

                {loading
                  ? "..."
                  : dashboardStats?.tsunamiWarnings || 0}

              </h3>

              <p className="mt-2 text-xs text-gray-400">
                Active global warnings
              </p>

            </div>

            {/* Average Magnitude */}
            <div className="rounded-3xl bg-gradient-to-br from-green-500/20 to-green-800/10 border border-green-500/20 p-6">

              <p className="text-sm text-green-300">
                Average Magnitude
              </p>

              <h3 className="mt-3 text-4xl font-bold">

                {loading
                  ? "..."
                  : dashboardStats?.averageMagnitude || 0}

              </h3>

              <p className="mt-2 text-xs text-gray-400">
                Selected time range
              </p>

            </div>

          </div>

        </section>

        {/* Incident Tracker + Map */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Incident Tracker */}
          <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-[#111827] p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  Incident Tracker
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Latest seismic events worldwide
                </p>

              </div>

              <button className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm hover:bg-white/10 transition cursor-pointer">

                View All

              </button>

            </div>

            <div className="space-y-4">

              {incidentTracker?.map((quake) => (

                <div
                  key={quake.earthquakeId}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition"
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold ${getSeverityColor(
                        quake.magnitude
                      )}`}
                    >

                      {quake.magnitude?.toFixed(1)}

                    </div>

                    <div>

                      <h3 className="text-lg font-semibold">
                        {quake.place}
                      </h3>

                      <p className="text-sm text-gray-400 mt-1">

                        {new Date(quake.eventTime).toLocaleString()}

                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        <span className="rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs text-red-300">

                          {quake.alertLevel || "Normal"} Alert

                        </span>

                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs text-cyan-300">

                          Significance {quake.significance}

                        </span>

                        {quake.tsunami === 1 && (

                          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs text-purple-300">

                            Tsunami Risk

                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">

              <button
                disabled={currentPage === 1}

                onClick={() => setCurrentPage((prev) => prev - 1)}

                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-40 cursor-pointer"
              >

                Previous

              </button>

              <p className="text-sm text-gray-400">

                Page {incidentPagination?.currentPage || 1} of{" "}
                {incidentPagination?.totalPages || 1}

              </p>

              <button
                disabled={
                  currentPage === incidentPagination?.totalPages
                }

                onClick={() => setCurrentPage((prev) => prev + 1)}

                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm disabled:opacity-40 cursor-pointer"
              >

                Next

              </button>

            </div>

          </div>

          {/* Map Placeholder */}
          <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">

            <div className="mb-6">

              <h2 className="text-xl font-semibold">
                Global Seismic Map
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Live earthquake hotspots visualization
              </p>

            </div>

            <div className="flex h-[500px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-center text-gray-400">

              Interactive Earthquake Map Placeholder

            </div>

          </div>

        </section>

        {/* Monitoring Status */}
        <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

          <div className="mb-6">

            <h2 className="text-2xl font-semibold">
              Monitoring Status
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Real-time ingestion pipeline monitoring
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

              <p className="text-sm text-gray-400">
                Last Data Refresh
              </p>

              <h3 className="mt-3 text-2xl font-bold text-green-400">

                22 sec ago

              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

              <p className="text-sm text-gray-400">
                Live Feed Reliability
              </p>

              <h3 className="mt-3 text-2xl font-bold text-cyan-400">

                99.2%

              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

              <p className="text-sm text-gray-400">
                Active Service Issues
              </p>

              <h3 className="mt-3 text-2xl font-bold text-red-400">

                0

              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

              <p className="text-sm text-gray-400">
                Historical Coverage
              </p>

              <h3 className="mt-3 text-2xl font-bold text-green-400">

                30 Days

              </h3>

            </div>

          </div>

        </section>

        {/* Per Location Monitoring */}
        <section>

          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-semibold">
                Per-Location Monitoring
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Personalized seismic intelligence dashboard
              </p>

            </div>

            <div className="flex gap-3 flex-wrap items-center">

              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Search city..."
                disabled={locations.length >= 3}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 outline-none placeholder:text-gray-500 disabled:opacity-40"
              />

              <button
                onClick={handleAddLocation}
                disabled={
                  locations.length >= 3 || locationLoading
                }
                className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-medium hover:bg-blue-600 transition cursor-pointer disabled:opacity-40"
              >

                {locationLoading
                  ? "Adding..."
                  : locations.length >= 3
                  ? "Limit Reached"
                  : "Add Location"}

              </button>

            </div>

          </div>

          {/* Limit Warning */}
          {locations.length >= 3 && (

            <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-300 text-sm">

              Maximum 3 monitored locations allowed.
              Remove one location to add another.

            </div>

          )}

          {/* Dynamic Location Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {locations.map((location) => (

              <div
                key={location._id}
                className="rounded-3xl border border-white/10 bg-[#111827] p-6"
              >

              <div className="flex items-start justify-between gap-4">

  <div>

    <h3 className="text-2xl font-semibold">
      {location.cityName}
    </h3>

    <p className="text-sm text-gray-400 mt-1">
      Active seismic monitoring
    </p>

  </div>

  <div className="flex flex-col items-end gap-3">

    <div className="rounded-full bg-red-500/10 border border-red-500/20 px-4 py-2 text-red-300 text-sm">

      Risk {location.riskScore}%

    </div>

    <button
      onClick={() =>
        handleDeleteLocation(location._id)
      }
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300 hover:bg-red-500/20 transition cursor-pointer"
    >

      Remove

    </button>

  </div>

</div>

                {/* Analytics */}
                <div className="mt-6 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

                    <p className="text-xs text-gray-400">
                      Nearby Events
                    </p>

                    <h4 className="mt-2 text-2xl font-bold">

                      {location.analytics?.nearbyEarthquakes || 0}

                    </h4>

                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

                    <p className="text-xs text-gray-400">
                      Strongest Event
                    </p>

                    <h4 className="mt-2 text-2xl font-bold text-orange-400">

                      M{" "}
                      {location.analytics?.strongestEvent || 0}

                    </h4>

                  </div>

                </div>

                {/* Alert Threshold */}
                <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">

                  <p className="text-xs text-blue-300 uppercase tracking-wide">

                    Active Alert Threshold

                  </p>

                  <h4 className="mt-2 text-lg font-semibold text-white">

                    Magnitude ≥{" "}
                    {location.alertMagnitudeThreshold}
                    {" "}within{" "}
                    {location.monitoringRadius} km

                  </h4>

                </div>

                {/* Additional Analytics */}
                <div className="mt-6 grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

                    <p className="text-xs text-gray-400">
                      Avg Magnitude
                    </p>

                    <h4 className="mt-2 text-2xl font-bold text-cyan-400">

                      {location.analytics?.averageMagnitude || 0}

                    </h4>

                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">

                    <p className="text-xs text-gray-400">
                      Monitoring Radius
                    </p>

                    <h4 className="mt-2 text-2xl font-bold text-green-400">

                      {location.monitoringRadius} km

                    </h4>

                  </div>

                </div>

                {/* Placeholder */}
                <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400 h-[180px] flex items-center justify-center">

                  Nearby Earthquake Mini Map / Activity Chart

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

    </div>
  );
}