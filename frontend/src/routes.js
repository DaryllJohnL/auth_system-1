/* eslint-disable react/jsx-no-undef */
// Import necessary components
import Icon from "@mui/material/Icon"; // Import Icon from @mui/material
import Dashboard from "layouts/dashboard";
import Billing from "layouts/billing";
import Gcredit from "layouts/gcredit";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password";
import Logout from "actions/Logout"; // Adjust path as necessary

const routes = [
  {
    type: "collapse",
    name: "Accounts",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/Accounts",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Pay Bills",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/Pay-Bills",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "Gcredit",
    key: "gcredit",
    icon: <Icon fontSize="small">credit_card</Icon>,
    route: "/Gcredit",
    component: <Gcredit />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    hidden: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    hidden: true,
  },
  {
    type: "collapse",
    name: "Reset Password",
    key: "reset-password",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/reset-password",
    component: <ResetPassword />,
    hidden: true,
  },
  {
    type: "collapse",
    name: "Logout",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>, // Update icon to 'logout'
    route: "/logout",
    component: <Logout />,
  },
];

export default routes;
