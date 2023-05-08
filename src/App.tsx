import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sandbox from "./components/Sandbox";

function App() {
  return (
    <div
      //TODO(trm): Activate onContextMenu={(event) => event.preventDefault()}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <Sandbox></Sandbox>
    </div>
  );
}

export default App;
