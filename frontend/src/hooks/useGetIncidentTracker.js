import { useEffect, useCallback } from "react";

import { useDispatch } from "react-redux";

import axios from "axios";

import toast from "react-hot-toast";

import {
  setIncidentTracker,
  setIncidentPagination,
  setLoading,
  setError,
} from "../redux/earthquakeSlice";

const useGetIncidentTracker = (
  range = "24h",
  page = 1,
  limit = 10
) => {

  const dispatch = useDispatch();

  const backendUri =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:8000";

  const fetchIncidentTracker = useCallback(async () => {

    try {

      dispatch(setLoading(true));

      const res = await axios.get(
        `${backendUri}/api/earthquake/incidentTracker?range=${range}&page=${page}&limit=${limit}`
      );

      if (res.data.success) {

        dispatch(setIncidentTracker(res.data.incidents));

        dispatch(
          setIncidentPagination({
            currentPage: res.data.currentPage,
            totalPages: res.data.totalPages,
            totalEarthquakes: res.data.totalEarthquakes,
            incidentsPerPage: res.data.incidentsPerPage,
          })
        );

      } else {

        dispatch(setError(res.data.message));

      }

    } catch (error) {

      console.log(error);

      dispatch(
        setError(
          error?.response?.data?.message ||
            "Failed to fetch incident tracker"
        )
      );

      toast.error("Failed to fetch incidents");

    } finally {

      dispatch(setLoading(false));

    }

  }, [backendUri, dispatch, range, page, limit]);

  useEffect(() => {

    fetchIncidentTracker();

    // Poll every 60 seconds
    const interval = setInterval(() => {

      fetchIncidentTracker();

    }, 60000);

    return () => clearInterval(interval);

  }, [fetchIncidentTracker]);

};

export default useGetIncidentTracker;