/* global URLSearchParams */
import { useLocation } from "react-router-dom";

function useGetParameter(name) {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  return query.get(name);
};

export default useGetParameter;