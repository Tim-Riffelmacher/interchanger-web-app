import { Accordion } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function TutorialModal({
  show,
  onShowChange,
}: {
  show: boolean;
  onShowChange: (show: boolean) => void;
}) {
  return (
    <Modal
      show={show}
      onHide={() => onShowChange(false)}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Tutorial</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <span className="fw-semibold">General</span>
            </Accordion.Header>
            <Accordion.Body>test</Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <span className="fw-semibold">Presets</span>
            </Accordion.Header>
            <Accordion.Body>
              There are mutlitple presets that you can load into the sandbox.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <span className="fw-semibold">Interchanges & Connections</span>
            </Accordion.Header>
            <Accordion.Body>test</Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>
              <span className="fw-semibold">Toolbox & More</span>
            </Accordion.Header>
            <Accordion.Body>test</Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>
              <span className="fw-semibold">Run</span>
            </Accordion.Header>
            <Accordion.Body>test</Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => onShowChange(false)}>
          Understood
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TutorialModal;
