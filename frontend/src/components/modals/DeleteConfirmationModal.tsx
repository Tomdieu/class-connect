import React, { useEffect } from "react";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useDeleteConfirmationStore } from "@/hooks/delete-confirmation-store";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";

interface DeleteConfirmationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

function DeleteConfirmationModal({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onConfirm: propOnConfirm,
  title: propTitle,
  description: propDescription,
  isLoading: propIsLoading,
}: DeleteConfirmationModalProps = {}) {
  const t = useI18n();
  const store = useDeleteConfirmationStore();

  // Use either props or store values
  const isOpen = propIsOpen ?? store.isOpen;
  const onClose = propOnClose ?? store.close;
  const onConfirm = propOnConfirm ?? store.onConfirm;
  const title = propTitle ?? store.title;
  const description = propDescription ?? store.description;
  const isLoading = propIsLoading ?? store.isLoading;

  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.refresh();
    }
  }, [isLoading, router]);

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>{title}</CredenzaTitle>
          <CredenzaDescription>{description}</CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {t("common.delete")}
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}

export default DeleteConfirmationModal;
