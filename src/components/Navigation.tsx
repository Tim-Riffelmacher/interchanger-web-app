import { useState } from "react";
import { Badge, Button, Container, Form, ProgressBar } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Preset } from "../data/presets";
import InfoTooltip from "./InfoTooltip";
import TutorialModal from "./TutorialModal";

export type DrawModeAction = "Ok" | "Cancel";
export type ClearScope = "Connections" | "All";
export type RunSpeed = 0.5 | 1.0 | 2.0 | "Skip";

function Navigation({
  drawModeActive,
  runProgress,
  runSpeed,
  layout,
  phaseNumber,
  progressBarVariant,
  onDrawModeChange,
  onLayoutChange,
  onRunSpeedChange,
  onConnectNNearestNodes,
  onConnectAllNodes,
  onDeleteUnmarkedEdges,
  onLoadPreset,
  onClear,
  onAddNode,
  onRun,
  onStop,
  onSkip,
}: {
  layout: cytoscape.LayoutOptions;
  drawModeActive: boolean;
  runProgress?: number;
  runSpeed: RunSpeed;
  phaseNumber?: number;
  progressBarVariant: "primary" | "warning";
  onDrawModeChange: (active: boolean, action?: DrawModeAction) => void;
  onRunSpeedChange: (runSpeed: RunSpeed) => void;
  onLayoutChange: (layout: cytoscape.LayoutOptions) => void;
  onConnectNNearestNodes: () => void;
  onConnectAllNodes: () => void;
  onDeleteUnmarkedEdges: () => void;
  onLoadPreset: (preset: Preset) => void;
  onClear: (deleteScope: ClearScope) => void;
  onAddNode: () => void;
  onRun: () => void;
  onStop: () => void;
  onSkip: () => void;
}) {
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  return (
    <>
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
                    variant={runProgress ? "success" : "warning"}
                    onClick={runProgress ? onSkip : onRun}
                    className="me-4"
                  >
                    <i
                      className={`bi me-1 ${
                        runProgress ? "bi-skip-forward-fill" : "bi-play-fill"
                      }`}
                    ></i>
                    {runProgress ? "Skip" : "Run"}
                  </Button>
                  {runProgress ? (
                    <div className="d-flex align-items-center">
                      <Button
                        variant="danger"
                        onClick={onStop}
                        className="me-4"
                      >
                        <i className="bi bi-stop-fill me-1"></i>
                        Stop
                      </Button>
                      <ProgressBar
                        className="me-4"
                        variant={progressBarVariant}
                        animated
                        style={{ width: "20rem" }}
                        now={runProgress}
                      />
                      <Badge className="me-4" bg="primary">
                        {phaseNumber}
                      </Badge>
                      <InfoTooltip infoText="The number on the left displays the highest node degree."></InfoTooltip>
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
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={onAddNode}
                      >
                        <i className="bi bi-signpost-split-fill me-1"></i>Add
                        interchange
                      </Button>
                      <NavDropdown
                        title={`Layout (${layout.name})`}
                        id="collasible-nav-dropdown-change-layout"
                      >
                        <NavDropdown.Item
                          onClick={() =>
                            onLayoutChange({ name: "circle", animate: true })
                          }
                        >
                          Circle
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          onClick={() =>
                            onLayoutChange({
                              name: "concentric",
                              minNodeSpacing: 100,
                              concentric: (node) => node.degree(),
                              animate: true,
                            })
                          }
                        >
                          Concentric
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          onClick={() =>
                            onLayoutChange({ name: "grid", animate: true })
                          }
                        >
                          Grid
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item
                          onClick={() =>
                            onLayoutChange({
                              name: "avsdf",
                              nodeSeparation: 200,
                            } as cytoscape.LayoutOptions)
                          }
                        >
                          Least overlapping
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          onClick={() =>
                            onLayoutChange({
                              name: "preset",
                              animate: true,
                            })
                          }
                        >
                          <i className="bi bi-wrench me-1"></i>Custom
                        </NavDropdown.Item>
                      </NavDropdown>
                      <NavDropdown title="Toolbox">
                        <NavDropdown.Item
                          onClick={() => onConnectNNearestNodes()}
                        >
                          <i className="bi-diagram-3-fill me-1"></i>
                          Connect 5 nearest interchanges
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => onConnectAllNodes()}>
                          <i className="bi-star-fill me-1"></i>
                          Connect all interchanges
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item
                          onClick={() => onDeleteUnmarkedEdges()}
                        >
                          <i className="bi bi-car-front-fill me-1"></i>Keep
                          roads only
                        </NavDropdown.Item>
                      </NavDropdown>
                      <NavDropdown
                        title="Load preset"
                        id="collasible-nav-dropdown-load-preset"
                      >
                        <NavDropdown.Item
                          onClick={() => onLoadPreset("Germany")}
                        >
                          Germany
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => onLoadPreset("Star")}>
                          Star
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item
                          onClick={() => onLoadPreset("Random")}
                        >
                          <i className="bi bi-shuffle me-1"></i>Random
                        </NavDropdown.Item>
                      </NavDropdown>
                      <NavDropdown
                        title="Clear"
                        id="collasible-nav-dropdown-delete"
                      >
                        <NavDropdown.Item
                          onClick={() => onClear("Connections")}
                        >
                          Connections
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => onClear("All")}>
                          All
                        </NavDropdown.Item>
                      </NavDropdown>
                    </div>
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
                  <Nav.Link onClick={() => setShowTutorialModal(true)}>
                    Tutorial?
                  </Nav.Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <TutorialModal
        show={showTutorialModal}
        onShowChange={(show) => setShowTutorialModal(show)}
      ></TutorialModal>
    </>
  );
}

export default Navigation;
