import { useState } from "react";
import { Badge, Button, Container, Form, ProgressBar } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Preset } from "../data/presets";
import InfoTooltip from "./InfoTooltip";
import ConnectNNearestNodesModal from "./modals/ConnectNNearestNodesModal";
import TutorialModal from "./modals/TutorialModal";

export type EditModeAction = "Ok" | "Cancel";
export type ClearScope = "Connections" | "All";
export type RunSpeed = 0.5 | 1.0 | 2.0 | "Skip";
export type EditMode = "Move" | "Draw" | "Delete";

function Navigation({
  editMode,
  runProgress,
  runSpeed,
  layout,
  phaseNumber,
  maxConnectNearestNodesN,
  progressBarVariant,
  onEditModeChange,
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
  editMode: EditMode;
  runProgress?: number;
  runSpeed: RunSpeed;
  phaseNumber?: number;
  maxConnectNearestNodesN: number;
  progressBarVariant: "primary" | "warning";
  onEditModeChange: (editMode: EditMode, action?: EditModeAction) => void;
  onRunSpeedChange: (runSpeed: RunSpeed) => void;
  onLayoutChange: (layout: cytoscape.LayoutOptions) => void;
  onConnectNNearestNodes: (n: number) => void;
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
  const [showConnectNNearestNodesModal, setShowConnectNNearestNodesModal] =
    useState(false);

  const handleConnectNNearestNodes = (n: number) => {
    setShowConnectNNearestNodesModal(false);
    onConnectNNearestNodes(n);
  };

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
              {editMode === "Draw" ? (
                <span className="text-primary fs-5 animation-pulse">
                  You are drawing now <i className="bi-pencil-fill ms-1"></i>
                </span>
              ) : editMode === "Delete" ? (
                <span className="text-primary fs-5 animation-pulse">
                  You are erasing now <i className="bi-eraser-fill ms-1"></i>
                </span>
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
                          disabled={maxConnectNearestNodesN < 1}
                          onClick={() => setShowConnectNNearestNodesModal(true)}
                        >
                          <i className="bi-diagram-3-fill me-1"></i>
                          Connect n nearest interchanges
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          disabled={maxConnectNearestNodesN < 1}
                          onClick={() => onConnectAllNodes()}
                        >
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
                    checked={editMode === "Move"}
                    className="text-secondary"
                    label="Normal"
                    onChange={() => onEditModeChange("Move")}
                    type="radio"
                  />
                  <Form.Check
                    inline
                    checked={editMode === "Draw"}
                    className="text-secondary"
                    label="Draw"
                    onChange={() => onEditModeChange("Draw")}
                    type="radio"
                  />
                  <Form.Check
                    inline
                    checked={editMode === "Delete"}
                    className="text-secondary"
                    label="Erase"
                    onChange={() => onEditModeChange("Delete")}
                    type="radio"
                  />
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
      <ConnectNNearestNodesModal
        maxN={maxConnectNearestNodesN}
        show={showConnectNNearestNodesModal}
        onOk={handleConnectNNearestNodes}
        onCancel={() => setShowConnectNNearestNodesModal(false)}
      ></ConnectNNearestNodesModal>
    </>
  );
}

export default Navigation;
