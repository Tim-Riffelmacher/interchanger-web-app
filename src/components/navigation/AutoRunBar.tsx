import { Navbar, Container, Button, ButtonGroup } from "react-bootstrap";
import { DebugAction } from "../Sandbox";

function AutoRunBar({
  runSpeed,
  autoDebugAction,
  onRunSpeedChange,
  onAutoDebugActionChange,
}: {
  runSpeed: number;
  autoDebugAction: DebugAction;
  onRunSpeedChange: (runSpeed: number) => void;
  onAutoDebugActionChange: (autoDebugAction: DebugAction) => void;
}) {
  const handleRunSpeedChange = (newRunSpeed: number) => {
    if (newRunSpeed > 256 || newRunSpeed < 0.0625) return;
    onRunSpeedChange(newRunSpeed);
  };

  return (
    <Navbar
      className="border-top"
      collapseOnSelect
      expand="lg"
      bg="dark"
      variant="dark"
    >
      <Container>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <span className="text-secondary me-2">Granularity</span>
          <ButtonGroup className="me-5">
            <Button
              variant="outline-info"
              onClick={() => onAutoDebugActionChange("Next")}
              active={autoDebugAction === "Next"}
            >
              Micro
            </Button>
            <Button
              variant="outline-info"
              onClick={() => onAutoDebugActionChange("SkipSubphase")}
              active={autoDebugAction === "SkipSubphase"}
            >
              Subphases
            </Button>
            <Button
              variant="outline-info"
              onClick={() => onAutoDebugActionChange("SkipPhase")}
              active={autoDebugAction === "SkipPhase"}
            >
              Phases
            </Button>
          </ButtonGroup>
          <span className="text-secondary me-2">Speed</span>
          <div className="fs-5 d-flex align-items-center">
            <i
              className="bi-rewind-circle-fill me-2 text-info hover-icon"
              onClick={() => handleRunSpeedChange(runSpeed / 2)}
            ></i>
            <span
              className="text-info d-inline-block overflow-hidden text-center text-nowrap"
              style={{ width: "5rem" }}
            >
              {runSpeed} x
            </span>
            <i
              className="bi-fast-forward-circle-fill ms-2 text-info hover-icon"
              onClick={() => handleRunSpeedChange(runSpeed * 2)}
            ></i>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AutoRunBar;
