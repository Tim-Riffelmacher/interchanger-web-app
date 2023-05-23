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
            <Accordion.Body>
              Simply put, this webapp is a sandbox. A highway network consisting
              of interchanges and roads can be modeled. Afterwards an algorithm
              can be executed to reduce the complexity of the modeled
              intersections. The algorithm used here is taken from the following
              book "The Design of Approximation Algorithms" by David P.
              Williamson and David B. Shmoys (
              <a href="https://www.designofapproxalgs.com/index.php">see</a>) .
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <span className="fw-semibold">Interchanges & Roads & Links</span>
            </Accordion.Header>
            <Accordion.Body>
              The highway intersections are represented by the nodes in the
              underlying graph. Care must be taken with the edges: These do not
              represent the roads but only potential roads, here called "links",
              between the interchanges. The finally calculated spanning tree
              represents the actual roads.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>
              <span className="fw-semibold">Edit modes</span>
            </Accordion.Header>
            <Accordion.Body>
              If the algorithm is not running, you can choose between 3
              different editing modes. In "Normal" mode you can add interchanges
              via the menu item "Add interchange" and move them around in the
              sandbox (by drag and drop). In "Draw" mode you can draw a line (by
              drag and drop) from interchange to interchange to connect them via
              a link. In "Erase" mode you can remove interchanges as well as
              links by simply clicking on them. Furthermore, in all modes you
              can change the name of an interchange by right-clicking on it.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3">
            <Accordion.Header>
              <span className="fw-semibold">Presets</span>
            </Accordion.Header>
            <Accordion.Body>
              There are several predefined highway networks that you can load if
              you just want to see how the algorithm works. To do this, go to
              the menu item "Load preset" and select the desired highway
              network.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4">
            <Accordion.Header>
              <span className="fw-semibold">Toolbox</span>
            </Accordion.Header>
            <Accordion.Body>
              The menu item "Toolbox" provides you with some auxiliary
              functions. You can automatically connect each interchange with the
              n closest interchanges or simply connect all of them. Furthermore,
              you can remove all links that do not represent a road, i.e. are
              not contained in the spanning tree after the end of the algorithm.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5">
            <Accordion.Header>
              <span className="fw-semibold">Layouts</span>
            </Accordion.Header>
            <Accordion.Body>
              If you want to arrange the highway network in a certain way, there
              are already predefined options in the "Layouts" menu item that can
              save you some work. You can automatically arrange the highway
              network in a circle or in a concentric circle sorted by the number
              of attached links (node degree). There is also the option to
              arrange the highway network in a grid or in a circle-like shape
              with as few overlapping links as possible.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="6">
            <Accordion.Header>
              <span className="fw-semibold">Run</span>
            </Accordion.Header>
            <Accordion.Body>
              After you have modeled your highway network or loaded it from the
              presets you can start the algorithm. Click on the menu item "Run".
              Depending on the size and complexity of the network, this may take
              some time. After the algorithm is finished, you will be in debug
              mode. Here you have the option to go through the algorithm step by
              step and get it explained. Depending on the desired level of
              detail, you can navigate through the individual steps ("Back" &
              "Next"), subphases ("Skip subphase") or phases ("Skip phase") of
              the algorithm. If you want more comfort, switch to "Auto" mode.
              Here the algorithm will be played automatically at the set speed.
              The level of detail can also be selected again. In addition, you
              can skip the run and go directly to the result via the menu item
              "Skip" or cancel the run via the menu item "Stop".
            </Accordion.Body>
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
