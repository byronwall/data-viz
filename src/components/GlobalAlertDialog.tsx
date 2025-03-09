import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlertStore } from "@/stores/alertStore";

export function GlobalAlertDialog() {
  const { isOpen, title, description, closeAlert } = useAlertStore();

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeAlert(false)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => closeAlert(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => closeAlert(true)} autoFocus>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
