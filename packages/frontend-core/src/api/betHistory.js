import axiosInstance from "./axiosConfig";

export const betStatement = async (token, page = 1) => {
  //   const response = await axios.get(`${BASE_URL}/player/statement`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  // const response = await axiosInstance.get("/player/statement", {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  const response = await axiosInstance.get(`/player/statement?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
