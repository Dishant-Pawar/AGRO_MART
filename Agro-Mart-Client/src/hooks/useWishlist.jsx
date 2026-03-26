import React from "react";
import useAxiosSecure from "./useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";

const useWishlist = () => {
  const user = useAuth();
  const axiosSecure = useAxiosSecure();
  const { data: wishlist = [], refetch: wishRefetch } = useQuery({
    queryKey: ["wishlist", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await axiosSecure.get(`/wishlist/${user?.email}`);
      return data || [];
    },
    enabled: !!user?.email,
  });
  return [wishlist, wishRefetch];
};

export default useWishlist;
