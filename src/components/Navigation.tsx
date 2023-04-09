import { Button, Container, Form, ProgressBar } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Preset } from "../data/presets";
import InfoTooltip from "./InfoTooltip";

export type DrawModeAction = "Ok" | "Cancel";
export type ClearScope = "Connections" | "All";
export type RunSpeed = 0.5 | 1.0 | 2.0;

function Navigation({
  drawModeActive,
  runProgress,
  runSpeed,
  onDrawModeChange,
  onRunSpeedChange,
  onConnectNNearestNodes,
  onLoadPreset,
  onClear,
  onAddNode,
  onRun,
  onStop,
}: {
  drawModeActive: boolean;
  runProgress?: number;
  runSpeed: RunSpeed;
  onDrawModeChange: (active: boolean, action?: DrawModeAction) => void;
  onRunSpeedChange: (runSpeed: RunSpeed) => void;
  onConnectNNearestNodes: () => void;
  onLoadPreset: (preset: Preset) => void;
  onClear: (deleteScope: ClearScope) => void;
  onAddNode: () => void;
  onRun: () => void;
  onStop: () => void;
}) {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand className="me-5">
          <img
            alt=""
            src={`${process.env.PUBLIC_URL}/assets/branding/van.png`}
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          InterChanger
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {drawModeActive ? (
              <Button
                variant="danger"
                onClick={() => onDrawModeChange(false, "Cancel")}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>Undo
              </Button>
            ) : (
              <>
                <Button
                  variant={runProgress ? "danger" : "warning"}
                  onClick={runProgress ? onStop : onRun}
                  className="me-4"
                >
                  <i
                    className={`bi me-1 ${
                      runProgress ? "bi-stop-fill" : "bi-play-fill"
                    }`}
                  ></i>
                  {runProgress ? "Stop" : "Run"}
                </Button>
                {runProgress ? (
                  <div className="d-flex align-items-center">
                    <ProgressBar
                      className="me-4"
                      animated
                      style={{ width: "20rem" }}
                      now={runProgress}
                    />
                    <Form.Check
                      inline
                      checked={runSpeed === 0.5}
                      className="text-secondary"
                      label="x0.5"
                      onChange={() => onRunSpeedChange(0.5)}
                      type="radio"
                    />
                    <Form.Check
                      inline
                      checked={runSpeed === 1.0}
                      className="text-secondary"
                      label="x1.0"
                      onChange={() => onRunSpeedChange(1.0)}
                      type="radio"
                    />
                    <Form.Check
                      inline
                      checked={runSpeed === 2.0}
                      className="text-secondary"
                      label="x2.0"
                      onChange={() => onRunSpeedChange(2.0)}
                      type="radio"
                    />
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={onAddNode}
                    >
                      <i className="bi bi-signpost-split-fill me-1"></i>Add
                      interchange
                    </Button>
                    <NavDropdown
                      title="Toolbox"
                      id="collasible-nav-dropdown-load-preset"
                    >
                      <NavDropdown.Item
                        onClick={() => onConnectNNearestNodes()}
                      >
                        <i className="bi-bounding-box-circles me-1"></i>Connect
                        nearest interchanges
                      </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown
                      title="Load preset"
                      id="collasible-nav-dropdown-load-preset"
                    >
                      <NavDropdown.Item onClick={() => onLoadPreset("Germany")}>
                        Germany
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={() => onLoadPreset("Star")}>
                        Star
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item onClick={() => onLoadPreset("Random")}>
                        <i className="bi bi-shuffle me-1"></i>Random
                      </NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown
                      title="Clear"
                      id="collasible-nav-dropdown-delete"
                    >
                      <NavDropdown.Item onClick={() => onClear("Connections")}>
                        Connections
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={() => onClear("All")}>
                        All
                      </NavDropdown.Item>
                    </NavDropdown>
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav>
            {!!runProgress || (
              <div className="d-flex align-items-center">
                <Form.Check
                  inline
                  type="switch"
                  label="Draw"
                  checked={drawModeActive}
                  onChange={(event) =>
                    onDrawModeChange(event.target.checked, "Ok")
                  }
                  className="text-light"
                />
                <InfoTooltip infoText="Turn on/off draw mode. When draw mode is active you can create connections between interchanges. Do this by holding your mouse down on an interchange and dragging the line to the interchange you want to connect."></InfoTooltip>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
