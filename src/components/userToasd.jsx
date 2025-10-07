import { useToastContext } from "./ToapsProvider";

export function useToast() {
    const { showToast } = useToastContext();
    return showToast;
}
