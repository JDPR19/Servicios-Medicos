import { useAlertContext } from './AlertProvider';

export function useAlert() {
    const { showAlert } = useAlertContext();
    return showAlert;
}
