import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function InfoTooltip({ infoText }: { infoText: string }) {
  return (
    <OverlayTrigger placement="auto" overlay={<Tooltip>{infoText}</Tooltip>}>
      <i className="bi bi-info-circle text-primary fs-5"></i>
    </OverlayTrigger>
  );
}
