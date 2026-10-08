import React, {useState, useRef, useEffect} from "react";
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  Loader2,
  FileCheck,
} from "lucide-react";
import Modal from "../common/Modal";
import vehicleApi from "../../api/vehicleApi";
import {createVerificationFormData} from "../../api/uploadApi";
import {useToast} from "../../context/ToastContext";

export const VehicleVerificationModal = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess,
}) => {
  const [registrationDocument, setRegistrationDocument] = useState(null);

  const [insuranceDocument, setInsuranceDocument] = useState(null);

  const [regFileName, setRegFileName] = useState("");
  const [insFileName, setInsFileName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {success, error: toastError} = useToast();

  const regInputRef = useRef(null);
  const insInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setRegistrationDocument(null);
      setInsuranceDocument(null);
      setRegFileName("");
      setInsFileName("");
      setErrorMsg("");

      if (regInputRef.current) {
        regInputRef.current.value = "";
      }

      if (insInputRef.current) {
        insInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const validateFile = (file, documentName) => {
    if (!file) {
      return false;
    }

    if (file.type !== "application/pdf") {
      toastError(`${documentName} must be a PDF file.`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toastError(`${documentName} must be 10 MB or smaller.`);
      return false;
    }

    return true;
  };

  const handleRegFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMsg("");

    if (!validateFile(file, "Registration document")) {
      e.target.value = "";
      return;
    }

    setRegistrationDocument(file);
    setRegFileName(file.name);
  };

  const handleInsFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMsg("");

    if (!validateFile(file, "Insurance document")) {
      e.target.value = "";
      return;
    }

    setInsuranceDocument(file);
    setInsFileName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!registrationDocument) {
      setErrorMsg("Please select the vehicle registration certificate.");
      return;
    }

    if (!insuranceDocument) {
      setErrorMsg("Please select the insurance document.");
      return;
    }

    if (!vehicle?._id) {
      setErrorMsg("Vehicle information is missing. Please try again.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = createVerificationFormData(
        registrationDocument,
        insuranceDocument,
      );

      await vehicleApi.submitVerification(vehicle._id, formData);

      success(
        "Verification documents submitted! Admins have been notified to review your vehicle.",
      );

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to submit verification";

      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Vehicle Verification"
      subtitle={`Verify ${vehicle?.make || "Vehicle"} ${vehicle?.model || ""} ${
        vehicle?.vehicleNumber ? `(${vehicle.vehicleNumber})` : ""
      }`}
      maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-rx-main">
        {errorMsg && (
          <div className="p-3 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-xl flex items-start gap-2 text-xs text-rx-accent">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-3.5 bg-rx-surface border border-rx-border rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-rx-accent shrink-0 mt-0.5" />

          <div>
            <p className="text-xs text-rx-muted leading-relaxed">
              Upload your official vehicle registration certificate and
              insurance policy as PDF files. Once approved, your vehicle will
              receive the Verified Badge and can be listed on the RideX
              marketplace.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rx-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-rx-accent" />
              Vehicle Registration Certificate (RC) *
            </span>

            <span className="text-[10px] text-rx-muted">PDF only</span>
          </label>

          <input
            type="file"
            ref={regInputRef}
            onChange={handleRegFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          {registrationDocument ?
            <div className="p-3 bg-rx-surface border border-rx-accent-border/60 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-rx-accent shrink-0" />

                <span className="text-xs font-semibold text-rx-main truncate">
                  {regFileName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => regInputRef.current?.click()}
                disabled={submitting}
                className="text-xs text-rx-accent hover:underline font-bold shrink-0 cursor-pointer disabled:opacity-50">
                Change
              </button>
            </div>
          : <div
              onClick={() => !submitting && regInputRef.current?.click()}
              className="p-4 border border-dashed border-rx-border hover:border-rx-accent/60 bg-rx-surface/60 hover:bg-rx-surface rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
              <UploadCloud className="w-4 h-4 text-rx-accent" />

              <span className="text-xs font-semibold text-rx-main">
                Click to Upload RC Document
              </span>
            </div>
          }
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-rx-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rx-accent" />
              Insurance Policy Document *
            </span>

            <span className="text-[10px] text-rx-muted">PDF only</span>
          </label>

          <input
            type="file"
            ref={insInputRef}
            onChange={handleInsFileChange}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          {insuranceDocument ?
            <div className="p-3 bg-rx-surface border border-rx-accent-border/60 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-rx-accent shrink-0" />

                <span className="text-xs font-semibold text-rx-main truncate">
                  {insFileName}
                </span>
              </div>

              <button
                type="button"
                onClick={() => insInputRef.current?.click()}
                disabled={submitting}
                className="text-xs text-rx-accent hover:underline font-bold shrink-0 cursor-pointer disabled:opacity-50">
                Change
              </button>
            </div>
          : <div
              onClick={() => !submitting && insInputRef.current?.click()}
              className="p-4 border border-dashed border-rx-border hover:border-rx-accent/60 bg-rx-surface/60 hover:bg-rx-surface rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-2">
              <UploadCloud className="w-4 h-4 text-rx-accent" />

              <span className="text-xs font-semibold text-rx-main">
                Click to Upload Insurance Document
              </span>
            </div>
          }
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-rx-border">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-rx-muted bg-rx-surface hover:bg-rx-border rounded-xl transition-colors cursor-pointer border border-rx-border disabled:opacity-50">
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || !registrationDocument || !insuranceDocument}
            className="px-5 py-2 text-xs font-bold text-rx-on-accent bg-rx-accent hover:bg-rx-accent-hover rounded-xl transition-colors shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}

            <span>
              {submitting ? "Submitting..." : "Submit for Admin Review"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VehicleVerificationModal;
