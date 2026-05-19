import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

import {
  setDashboardStats,
  setLoading,
  setError,
} from "../redux/earthquakeSlice";

const useGetDashboardStats = (range) => {

  const backendUri =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:8000";

  const dispatch = useDispatch();

  const fetchDashboardStats = useCallback(async () => {

    try {

      dispatch(setLoading(true));

      const res = await axios.get(
        `${backendUri}/api/earthquake/dashboardStat?range=${range}`
      );

      if (res.data.success) {

        dispatch(setDashboardStats(res.data.stats));

      } else {

        dispatch(setError(res.data.message));

      }

    } catch (error) {

      console.log(error);

      dispatch(
        setError(
          error?.response?.data?.message || "Something went wrong"
        )
      );

      toast.error("Failed to fetch dashboard stats");

    } finally {

      dispatch(setLoading(false));

    }

  }, [backendUri, dispatch, range]);

  useEffect(() => {

    fetchDashboardStats();

    // Poll every 60 sec
    const interval = setInterval(() => {

      fetchDashboardStats();

    }, 60000);

    return () => clearInterval(interval);

  }, [fetchDashboardStats]);

};

export default useGetDashboardStats;