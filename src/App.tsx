import { BrowserRouter, Route } from "react-router-dom";
import { AddSow } from "./Components/pages/AddSow";

function App() {
  return (
    <BrowserRouter>
      <div className="container-fluid" style={{ padding: 20 }}>
        <Route path="/page/:screenname/:id?" component={AddSow} />
        <Route exact path="/" component={AddSow} />
      </div>
    </BrowserRouter>
  );
}

export default App;
