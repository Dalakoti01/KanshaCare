import { useEffect, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";

import { setAllEarthquakes } from "../redux/earthquakeSlice";

const useGetAllEarthquakes = (page = 1, limit = 20) => {

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const backendUri =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:8000";

  const fetchAllEarthquakes = useCallback(async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${backendUri}/api/earthquake/allEarthquakeFromModel?page=${page}&limit=${limit}`
      );

      if (res.data.success) {

        dispatch(setAllEarthquakes(res.data.allEarthquakes));

      }

    } catch (error) {

      console.log(error);

      toast.error(error?.response?.data?.message || "Something went wrong");

    } finally {

      setLoading(false);

    }

  }, [backendUri, dispatch, page, limit]);

  useEffect(() => {

    fetchAllEarthquakes();

  }, [fetchAllEarthquakes]);

  return { loading };

};

export default useGetAllEarthquakes;