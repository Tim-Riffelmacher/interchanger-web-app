import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ConnectNNearestNodesModal({
  show,
  maxN,
  onOk,
  onCancel,
}: {
  show: boolean;
  maxN: number;
  onOk: (n: number) => void;
  onCancel: () => void;
}) {
  const [n, setN] = useState(0);

  return (
    <Modal show={show} onHide={onCancel} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Connect n nearest interchanges</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate onSubmit={(event) => event.preventDefault()}>
          <Form.Group>
            <Form.Label>Enter n</Form.Label>
            <Form.Control
              type="number"
              name="N"
              autoFocus={true}
              value={n}
              onChange={(event) => setN(Number(event.target.value))}
              isInvalid={n < 0 || n > maxN}
            />
            <Form.Control.Feedback type="invalid">
              N has to be between 0 and {maxN}!
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => onOk(n)}>
          Ok
        </Button>
        <Button variant="warning" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConnectNNearestNodesModal;
