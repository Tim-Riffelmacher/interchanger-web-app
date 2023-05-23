import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import deepCopy from "../../utils/others/deepCopy";
import { v4 as uuidv4 } from "uuid";

const AUTO_HIDE_DELAY = 3000;

const ToastDepot = forwardRef(({}, ref) => {
  const [toasts, setToasts] = useState<
    {
      id: string;
      text: string;
      show: boolean;
      variant: "primary" | "warning";
    }[]
  >([]);

  useImperativeHandle(ref, () => ({
    show(text: string, variant: "primary" | "warning" = "primary") {
      const copiedToasts = deepCopy(toasts);
      const id = uuidv4();
      copiedToasts.push({
        text,
        id,
        show: true,
        variant,
      });
      setToasts(copiedToasts);
    },
  }));

  const hideToast = (id: string) => {
    const copiedToasts = deepCopy(toasts);
    const toast = copiedToasts.find((toast) => toast.id === id);
    if (!toast)
      throw new Error(
        "Toast cannot be hidden, because there is none with the provided id."
      );
    toast.show = false;
    setToasts(copiedToasts);
  };

  return (
    <ToastContainer position="bottom-end" className="p-4 z-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => hideToast(toast.id)}
          show={toast.show}
          delay={AUTO_HIDE_DELAY}
          autohide={true}
        >
          <Toast.Header>
            <strong className={`me-auto text-${toast.variant}`}>
              <i className="bi-exclamation-diamond-fill me-1"></i>
              InterChanger
            </strong>
            <small className="text-muted">just now</small>
          </Toast.Header>
          <Toast.Body>{toast.text}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
});

export default ToastDepot;
