import { useEffect, useCallback } from "react";

import { useDispatch } from "react-redux";

import axios from "axios";

import toast from "react-hot-toast";

import {
  setSystemHealth,
  setLoading,
  setError,
} from "../redux/earthquakeSlice.js";

const useGetSystemHealth = () => {

  const dispatch = useDispatch();

  const backendUri =
    import.meta.env.VITE_BACKEND_URI ||
    "http://localhost:8000";

  const fetchSystemHealth = useCallback(async () => {

    try {

      dispatch(setLoading(true));

      const res = await axios.get(
        `${backendUri}/api/earthquake/systemHealth`
      );

      if (res.data.success) {

        dispatch(
          setSystemHealth(
            res.data.systemHealth
          )
        );

      } else {

        dispatch(
          setError(res.data.message)
        );

        toast.error(res.data.message);
      }

    } catch (error) {

      console.log(error);

      dispatch(
        setError(
          error?.response?.data?.message ||
          "Failed to fetch system health"
        )
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch system health"
      );

    } finally {

      dispatch(setLoading(false));
    }

  }, [backendUri, dispatch]);

  useEffect(() => {

    fetchSystemHealth();

    // Auto Refresh Every Minute
    const interval = setInterval(() => {

      fetchSystemHealth();

    }, 60000);

    return () => clearInterval(interval);

  }, [fetchSystemHealth]);
};

export default useGetSystemHealth;