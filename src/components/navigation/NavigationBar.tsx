import { useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Container,
  ProgressBar,
  Spinner,
} from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Preset } from "../../data/presets";
import DebugRunBar from "./DebugRunBar";
import ConnectNNearestNodesModal from "../modals/ConnectNNearestNodesModal";
import TutorialModal from "../modals/TutorialModal";
import AutoRunBar from "./AutoRunBar";
import { DebugAction } from "../Sandbox";

export type EditModeAction = "Ok" | "Cancel";
export type ClearScope = "Connections" | "All";
export type EditMode = "Move" | "Draw" | "Delete";
export type RunMode = "Auto" | "Debug" | "None";

/**
 * The navigation bar at the top that contains all necessary tools.
 */
function NavigationBar({
  showDebugHints,
  editMode,
  runProgress,
  runSpeed,
  autoDebugAction,
  phaseNumber,
  maxConnectNearestNodesN,
  progressBarVariant,
  runMode,
  algorithmIsLoading,
  onEditModeChange,
  onLayoutChange,
  onRunSpeedChange,
  onAutoDebugActionChange,
  onConnectNNearestNodes,
  onConnectAllNodes,
  onDeleteUnmarkedEdges,
  onLoadPreset,
  onClear,
  onAddNode,
  onRun,
  onAutoRun,
  onDebugRun,
  onStop,
  onSkip,
  onDebugBack,
  onDebugNext,
  onDebugSkipSubphase,
  onDebugSkipPhase,
  onShowDebugHints,
}: {
  showDebugHints: boolean;
  editMode: EditMode;
  runProgress?: number;
  autoDebugAction: DebugAction;
  runSpeed: number;
  phaseNumber?: number;
  maxConnectNearestNodesN: number;
  progressBarVariant: "primary" | "warning";
  runMode: RunMode;
  algorithmIsLoading: boolean;
  onEditModeChange: (editMode: EditMode, action?: EditModeAction) => void;
  onRunSpeedChange: (runSpeed: number) => void;
  onAutoDebugActionChange: (autoDebugAction: DebugAction) => void;
  onLayoutChange: (layout: cytoscape.LayoutOptions) => void;
  onConnectNNearestNodes: (n: number) => void;
  onConnectAllNodes: () => void;
  onDeleteUnmarkedEdges: () => void;
  onLoadPreset: (preset: Preset) => void;
  onClear: (deleteScope: ClearScope) => void;
  onAddNode: () => void;
  onRun: () => void;
  onAutoRun: () => void;
  onDebugRun: () => void;
  onStop: () => void;
  onSkip: () => void;
  onDebugBack: () => void;
  onDebugNext: () => void;
  onDebugSkipSubphase: () => void;
  onDebugSkipPhase: () => void;
  onShowDebugHints: (show: boolean) => void;
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
                  {runMode !== "None" ? (
                    <ButtonGroup className="me-4">
                      <Button
                        variant="outline-primary"
                        onClick={onAutoRun}
                        active={runMode === "Auto"}
                      >
                        <i className="bi-play-fill me-1"></i>
                        Auto
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={onDebugRun}
                        active={runMode === "Debug"}
                      >
                        <i className="bi-bug-fill me-1"></i>
                        Debug
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <Button
                      variant="outline-primary me-4"
                      onClick={onRun}
                      disabled={algorithmIsLoading}
                    >
                      {algorithmIsLoading ? (
                        <Spinner
                          className="me-1"
                          animation="border"
                          size="sm"
                        />
                      ) : (
                        <i className="bi-play-fill me-1"></i>
                      )}
                      Run
                    </Button>
                  )}
                  {runMode !== "None" ? (
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-warning"
                        onClick={onSkip}
                        className="me-4"
                      >
                        <i className="bi bi-infinity me-1"></i>
                        Skip
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={onStop}
                        className="me-4"
                      >
                        <i className="bi bi-stop-fill me-1"></i>
                        Stop
                      </Button>
                      <ProgressBar
                        className="me-4"
                        variant={progressBarVariant}
                        animated={runMode === "Auto"}
                        style={{ width: "20rem" }}
                        now={runProgress}
                      />
                      <Badge className="me-4" bg="primary">
                        Max. Degree: {phaseNumber}
                      </Badge>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={onAddNode}
                        disabled={algorithmIsLoading}
                      >
                        <i className="bi bi-signpost-split-fill me-1"></i>Add
                        interchange
                      </Button>
                      <NavDropdown
                        title="Change layout"
                        id="collasible-nav-dropdown-change-layout"
                        disabled={algorithmIsLoading}
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
                      </NavDropdown>
                      <NavDropdown
                        title="Toolbox"
                        disabled={algorithmIsLoading}
                      >
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
                        disabled={algorithmIsLoading}
                      >
                        <NavDropdown.Item
                          onClick={() => onLoadPreset("Germany")}
                        >
                          Germany
                        </NavDropdown.Item>
                        <NavDropdown.Item onClick={() => onLoadPreset("Star")}>
                          Star
                        </NavDropdown.Item>
                        <NavDropdown.Item
                          onClick={() => onLoadPreset("Square")}
                        >
                          Square
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
                        disabled={algorithmIsLoading}
                      >
                        <NavDropdown.Item
                          onClick={() => onClear("Connections")}
                        >
                          Links
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
              {runMode === "None" ? (
                <div className="d-flex align-items-center">
                  <ButtonGroup className="me-4" size="sm">
                    <Button
                      variant="outline-info"
                      onClick={() => onEditModeChange("Move")}
                      active={editMode === "Move"}
                      disabled={algorithmIsLoading}
                    >
                      Normal
                    </Button>
                    <Button
                      variant="outline-info"
                      onClick={() => onEditModeChange("Draw")}
                      active={editMode === "Draw"}
                      disabled={algorithmIsLoading}
                    >
                      Draw
                    </Button>
                    <Button
                      variant="outline-info"
                      onClick={() => onEditModeChange("Delete")}
                      active={editMode === "Delete"}
                      disabled={algorithmIsLoading}
                    >
                      Erase
                    </Button>
                  </ButtonGroup>
                  <Nav.Link
                    onClick={() => setShowTutorialModal(true)}
                    disabled={algorithmIsLoading}
                  >
                    Tutorial?
                  </Nav.Link>
                </div>
              ) : null}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {runMode === "Debug" ? (
        <DebugRunBar
          showDebugHints={showDebugHints}
          onBack={onDebugBack}
          onNext={onDebugNext}
          onSkipSubphase={onDebugSkipSubphase}
          onSkipPhase={onDebugSkipPhase}
          onShowDebugHints={onShowDebugHints}
        ></DebugRunBar>
      ) : runMode === "Auto" ? (
        <AutoRunBar
          runSpeed={runSpeed}
          autoDebugAction={autoDebugAction}
          onRunSpeedChange={onRunSpeedChange}
          onAutoDebugActionChange={onAutoDebugActionChange}
        ></AutoRunBar>
      ) : null}
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

export default NavigationBar;
