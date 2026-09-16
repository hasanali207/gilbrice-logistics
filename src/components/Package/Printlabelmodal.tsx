"use client";

import { Download, Loader2, MessageCircle, Printer, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  getPackageLabelPdfBlob,
  isMobileDevice,
  openPackageLabelPdfBlob,
  printPackageLabelBlob,
  renderPackageLabelPreviewImage,
} from "./packageLabelPdf";

interface PrintLabelModalProps {
  open: boolean;
  onClose: () => void;
  // pdfMake document instance returned by generatePackageLabelPdf()
  pdfDoc: any;
  fileName: string;
  shareText?: string;
}

type BusyAction = "print" | "download" | "share" | null;

const PrintLabelModal = ({
  open,
  onClose,
  pdfDoc,
  fileName,
  shareText,
}: PrintLabelModalProps) => {
  const [busy, setBusy] = useState<BusyAction>(null);

  // ============================================================
  // PREVIEW — render page 1 to an image (works on desktop AND
  // mobile, unlike embedding the PDF directly in an <iframe>)
  // ============================================================

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open || !pdfDoc) {
      setPreviewImage(null);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      try {
        setPreviewLoading(true);

        const blob = await getPackageLabelPdfBlob(pdfDoc);

        if (cancelled) return;

        const dataUrl = await renderPackageLabelPreviewImage(blob);

        if (cancelled) return;

        setPreviewImage(dataUrl);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [open, pdfDoc]);

  if (!open || !pdfDoc) return null;

  // ============================================================
  // PRINT
  // - Desktop: loads the PDF into a hidden iframe and opens the
  //   native print dialog (Ctrl+P) silently.
  // - Mobile (iOS/Android): iframe.print() is unreliable, so the
  //   PDF opens in a new tab instead, where the user can use the
  //   browser/PDF viewer's own Share → Print action.
  // ============================================================

  const handlePrint = async () => {
    try {
      setBusy("print");

      const blob = await getPackageLabelPdfBlob(pdfDoc);

      if (isMobileDevice()) {
        openPackageLabelPdfBlob(blob);
      } else {
        // Fire-and-forget: printing continues in the background via
        // its own hidden iframe, regardless of whether this modal
        // stays open.
        printPackageLabelBlob(blob).catch((error) => {
          console.error(error);
        });
      }

      onClose();
    } catch (error) {
      console.error(error);

      toast.error("Failed to open print dialog");
    } finally {
      setBusy(null);
    }
  };

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const handleDownload = () => {
    try {
      setBusy("download");

      pdfDoc.download(fileName);

      toast.success("Label downloaded");

      onClose();
    } catch (error) {
      console.error(error);

      toast.error("Failed to download label");
    } finally {
      setBusy(null);
    }
  };

  // ============================================================
  // WHATSAPP SHARE
  // ============================================================

  const handleWhatsAppShare = async () => {
    try {
      setBusy("share");

      const blob = await getPackageLabelPdfBlob(pdfDoc);
      const file = new File([blob], fileName, { type: "application/pdf" });

      const nav: any = typeof navigator !== "undefined" ? navigator : null;

      if (nav?.canShare && nav.canShare({ files: [file] })) {
        // Native share sheet — user picks WhatsApp and the PDF goes as an attachment
        await nav.share({
          files: [file],
          title: fileName,
          text: shareText || "Package label",
        });
      } else {
        // Fallback: WhatsApp links can't carry a file attachment, so the PDF
        // is downloaded for the user and WhatsApp opens with a text message.
        pdfDoc.download(fileName);

        const message = encodeURIComponent(
          `${shareText || "Package label"}\n(Label PDF downloaded — please attach it manually)`,
        );

        window.open(`https://wa.me/?text=${message}`, "_blank");
      }

      onClose();
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error(error);

        toast.error("Failed to share label");
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* BACKDROP */}

      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* MODAL — capped to viewport height, laid out as
          header / scrollable body / actions so it can never
          grow taller than the screen. */}

      <div className="relative w-full max-w-md max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              Package Label
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Preview, then choose what you'd like to do
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE BODY — preview shrinks to fit the viewport
            instead of pushing the modal (and its buttons) off-screen */}

        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-3">
          <div className="flex justify-center">
            <div
              className="rounded-xl border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center"
              style={{
                aspectRatio: "283.46 / 425.2",
                height: "min(36vh, 300px)",
                width: "auto",
                maxWidth: "100%",
              }}
            >
              {previewLoading || !previewImage ? (
                <Loader2 size={20} className="animate-spin text-gray-400" />
              ) : (
                <img
                  src={previewImage}
                  alt="Package label preview"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          {isMobileDevice() && (
            <p className="text-xs text-gray-400 text-center mt-3">
              Print opens the PDF in a new tab — use Share → Print from there
            </p>
          )}
        </div>

        {/* ACTIONS — fixed 3-column grid so it always fits in one
            row (buttons shrink on small screens instead of
            wrapping to a new line) */}

        <div className="p-5 pt-3 border-t border-gray-100 shrink-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* PRINT */}

            <Button
              type="button"
              onClick={handlePrint}
              disabled={busy !== null}
              className="w-full h-auto flex-col gap-1 py-2.5 px-1 bg-secondary text-white"
            >
              {busy === "print" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Printer size={17} />
              )}
              <span className="text-xs sm:text-sm truncate">Print</span>
            </Button>

            {/* DOWNLOAD */}

            <Button
              type="button"
              onClick={handleDownload}
              disabled={busy !== null}
              className="w-full h-auto flex-col gap-1 py-2.5 px-1 bg-secondary text-white"
            >
              {busy === "download" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Download size={17} />
              )}
              <span className="text-xs sm:text-sm truncate">Download</span>
            </Button>

            {/* WHATSAPP SHARE */}

            <Button
              type="button"
              onClick={handleWhatsAppShare}
              disabled={busy !== null}
              className="w-full h-auto flex-col gap-1 py-2.5 px-1 bg-secondary text-white"
            >
              {busy === "share" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <MessageCircle size={17} />
              )}
              <span className="text-xs sm:text-sm truncate">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLabelModal;
