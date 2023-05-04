import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

function RenameNodeModal({
  show,
  oldName,
  onOk,
  onCancel,
}: {
  show: boolean;
  oldName: string;
  onOk: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => setName(oldName), [oldName]);

  return (
    <Modal show={show} onHide={onCancel} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Rename interchange</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(event) => event.preventDefault()}>
          <Form.Group>
            <Form.Label>Enter new name</Form.Label>
            <Form.Control
              type="text"
              name="Name"
              autoFocus={true}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => onOk(name)}>
          Ok
        </Button>
        <Button variant="warning" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RenameNodeModal;
