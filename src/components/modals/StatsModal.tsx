import { Alert, Button, Modal, Table } from "react-bootstrap";

export type Stats = {
  initialMaxNodeDegree: number;
  finalMaxNodeDegree: number;
  counts: {
    maxNodeDegree: number;
    localMoves: number;
    localMovesOfNodeOfDegreeK: number;
    localMovesOfNodeOfDegreeKMinus1: number;
  }[];
};

/**
 * The modal that shows the algorithm stats at the end.
 */
function StatsModal({
  show,
  stats,
  onShowChange,
}: {
  show: boolean;
  stats: Stats;
  onShowChange: (show: boolean) => void;
}) {
  const provideSumOfStatsCounts = (key: keyof Stats["counts"][0]) => {
    let sum = 0;
    for (const count of stats.counts) sum += count[key];
    return sum;
  };

  return (
    <Modal
      show={show}
      onHide={() => onShowChange(false)}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Statistics</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="primary">
          <span className="d-block">Improvement of maximum node degree</span>
          <span className="center fs-3">
            {stats.initialMaxNodeDegree}
            <i className="bi-arrow-right mx-2"></i>
            {stats.finalMaxNodeDegree}
          </span>
        </Alert>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Maximum node degree</th>
              <th>#Local moves</th>
              <th>#Local moves (of nodes of degree k)</th>
              <th>#Local moves (of reducible nodes)</th>
            </tr>
          </thead>
          <tbody>
            {stats.counts.map(
              ({
                maxNodeDegree,
                localMoves,
                localMovesOfNodeOfDegreeK,
                localMovesOfNodeOfDegreeKMinus1,
              }) => (
                <tr key={`key-${maxNodeDegree}`}>
                  <td>{maxNodeDegree}</td>
                  <td>{localMoves}</td>
                  <td>{localMovesOfNodeOfDegreeK}</td>
                  <td>{localMovesOfNodeOfDegreeKMinus1}</td>
                </tr>
              )
            )}
            <tr className="fw-bold">
              <td>Sum</td>
              <td>{provideSumOfStatsCounts("localMoves")}</td>
              <td>{provideSumOfStatsCounts("localMovesOfNodeOfDegreeK")}</td>
              <td>
                {provideSumOfStatsCounts("localMovesOfNodeOfDegreeKMinus1")}
              </td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => onShowChange(false)}>
          Understood
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
export default StatsModal;
