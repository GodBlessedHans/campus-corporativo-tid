import { createBrowserRouter, RouterProvider} from "react-router-dom";
import {routerApp} from "././router/routerApp";


function App() {
  return (
    RouterProvider({ router: createBrowserRouter(routerApp) })
  );
}


export default App;