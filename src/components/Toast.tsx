import { toast } from "react-toastify";

type ToastType = "info" | "success" | "warning" | "error";

const useToast = () => {
  const showToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 3000
  ) => {
    toast[`${type}`](message, {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return showToast;
};

export default useToast;
