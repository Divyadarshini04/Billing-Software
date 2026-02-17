export const tokenManager = {
  getToken: () => sessionStorage.getItem("authToken"),
  setToken: (token) => {
    sessionStorage.setItem("authToken", token);
  },
  removeToken: () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
  }
};
