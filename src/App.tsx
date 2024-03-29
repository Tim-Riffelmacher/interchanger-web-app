import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sandbox from "./components/Sandbox";

/**
 * The main ui displayed on the page.
 */
function App() {
  return (
    <div
      onContextMenu={(event) => event.preventDefault()}
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
