import { Navbar, Container, Button } from "react-bootstrap";

function DebugBar({
  onNext,
  onBack,
  onSkipSubphase,
  onSkipPhase,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkipSubphase: () => void;
  onSkipPhase: () => void;
}) {
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
          <Button variant="outline-success me-2" onClick={onBack}>
            <i className="bi-arrow-counterclockwise me-1"></i>
            Back
          </Button>
          <Button variant="outline-success me-2" onClick={onNext}>
            <i className="bi-bug-fill me-1"></i>
            Next
          </Button>
          <Button variant="outline-success me-2" onClick={onSkipSubphase}>
            <i className="bi-skip-end-fill me-1"></i>
            Skip subphase
          </Button>
          <Button variant="outline-success" onClick={onSkipPhase}>
            <i className="bi-skip-forward-fill me-1"></i>
            Skip phase
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DebugBar;
