import { useEffect, useCallback } from "react";

import { useDispatch } from "react-redux";

import axios from "axios";

import toast from "react-hot-toast";

import {
  setLocations,
  setLocationLoading,
  setLocationError,
} from "../redux/locationSlice.js";

const useGetAllLocations = () => {

  const dispatch = useDispatch();

  const backendUri =
    import.meta.env.VITE_BACKEND_URI ||
    "http://localhost:8000";

  const fetchAllLocations = useCallback(async () => {

    try {

      dispatch(setLocationLoading(true));

      const res = await axios.get(
        `${backendUri}/api/location/all`
      );

      if (res.data.success) {

        dispatch(
          setLocations(res.data.allLocations)
        );

      } else {

        dispatch(
          setLocationError(res.data.message)
        );

        toast.error(res.data.message);
      }

    } catch (error) {

      console.log(error);

      dispatch(
        setLocationError(
          error?.response?.data?.message ||
          "Failed to fetch locations"
        )
      );

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch locations"
      );

    } finally {

      dispatch(setLocationLoading(false));
    }

  }, [backendUri, dispatch]);

  useEffect(() => {

    fetchAllLocations();

  }, [fetchAllLocations]);
};

export default useGetAllLocations;