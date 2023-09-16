import { Alert } from "react-bootstrap";

/**
 * The window on the side for showing hints while the algorithm is executed.
 */
function DebugInfo({ title, text }: { title: string; text: string }) {
  return (
    <Alert
      variant="info"
      className="position-absolute start-0 top-50 translate-middle-y z-10 w-25"
    >
      <Alert.Heading>{title}</Alert.Heading>
      <hr />
      <p>{text}</p>
    </Alert>
  );
}

export default DebugInfo;
