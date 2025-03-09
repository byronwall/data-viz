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
  const { isOpen, title, description, closeAlert, id } = useAlertStore();

  return (
    <AlertDialog
      key={id}
      open={isOpen}
      onOpenChange={(open) => !open && closeAlert(false)}
    >
      <AlertDialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const action = document.getElementById(`alert-dialog-action-${id}`);
          if (action) {
            action.focus();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => closeAlert(true)}
            autoFocus
            id={`alert-dialog-action-${id}`}
          >
            Continue
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={() => closeAlert(false)}
            autoFocus={false}
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
