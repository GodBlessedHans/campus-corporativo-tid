import Login from "../pages/auth/login";
import SignUp from "../pages/auth/signUp";
import ForgotPassword from "../pages/auth/forgotPassword";

export let routerApp = [
  { path: "/login",
     element: <Login /> },

  { path: "/signup",
     element: <SignUp /> },

  { path: "/forgot-password",
     element: <ForgotPassword /> }
];