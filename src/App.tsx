import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "./Components/Layout/Sidebar";
import { AddSow } from "./Components/pages/AddSow";
import { Configuration } from "./Components/pages/Configuration";
import { RequirementObject } from "./Components/pages/Requirementobject";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 2,
            width: "100%",
            overflow: "auto",
          }}
        >
          <Switch>
            <Route exact path="/" component={AddSow} />
            <Route path="/page/:screenname/:id?" component={AddSow} />
            <Route path="/requirements" component={RequirementObject} />
            <Route path="/templates" component={Configuration} />
          </Switch>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
