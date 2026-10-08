import React, {useState, useEffect} from "react";
import { getVehicleImageUrl } from '../../utils/vehicleImage';
import {Link} from "react-router-dom";
import {
  FileCheck,
  Check,
  X,
  ExternalLink,
  Car,
  ShieldCheck,
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  RefreshCw,
  Search,
  Loader2,
} from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import adminApi from "../../api/adminApi";
import Modal, {ConfirmDialog} from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import {TableRowSkeleton} from "../../components/common/Skeleton";
import {useToast} from "../../context/ToastContext";

export const AdminVerificationPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmModal, setConfirmModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);

  const {success, error: toastError} = useToast();

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPendingVerifications();
      setPendingVehicles(res?.vehicles || []);
    } catch (err) {
      console.warn("Failed to load pending verifications:", err.message);
      setPendingVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVehicles = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllVehiclesAdmin({
        limit: 50,
      });
      setAllVehicles(res?.vehicles || []);
    } catch (err) {
      console.warn("Failed to load all vehicles:", err.message);
      setAllVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPending();
    } else {
      fetchAllVehicles();
    }
  }, [activeTab]);

  const handleReview = async () => {
    if (!confirmModal) {
      return;
    }

    const {id, status} = confirmModal;

    try {
      setSubmitting(true);

      await adminApi.reviewVehicleVerification(id, status);

      success(
        `Vehicle verification ${
          status === "verified" ? "approved" : "rejected"
        }. Host has been notified!`,
      );

      setConfirmModal(null);

      if (activeTab === "pending") {
        fetchPending();
      } else {
        fetchAllVehicles();
      }
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          "Verification review failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getDocumentInfo = (document) => {
    if (!document) {
      return null;
    }

    if (typeof document === "string") {
      return {
        exists: Boolean(document),
        originalName: document,
      };
    }

    return {
      exists: Boolean(document.publicId || document.originalName),
      originalName: document.originalName || "Verification document",
    };
  };

  const openDocument = async (vehicle, documentType, title) => {
    try {
      setDocumentLoading(true);

      const response = await adminApi.getVehicleVerificationDocument(
        vehicle._id,
        documentType,
      );

      const url = response?.url;

      if (!url) {
        throw new Error("Document URL was not returned by the server.");
      }

      setPreviewDoc({
        url,
        title,
        type: "pdf",
      });
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          err.message ||
          "Unable to open verification document.",
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  const openDocumentInNewTab = async (vehicle, documentType) => {
    try {
      setDocumentLoading(true);

      const response = await adminApi.getVehicleVerificationDocument(
        vehicle._id,
        documentType,
      );

      const url = response?.url;

      if (!url) {
        throw new Error("Document URL was not returned by the server.");
      }

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          err.message ||
          "Unable to open verification document.",
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  const displayedVehicles = (
    activeTab === "pending" ? pendingVehicles : allVehicles).filter((v) => {
    if (!searchQuery.trim()) {
      return true;
    }

    const q = searchQuery.toLowerCase();

    const make = v.make?.toLowerCase() || "";

    const model = v.model?.toLowerCase() || "";

    const plate = v.vehicleNumber?.toLowerCase() || "";

    const host = v.owner?.name?.toLowerCase() || "";

    return (
      make.includes(q) ||
      model.includes(q) ||
      plate.includes(q) ||
      host.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AdminSidebar />

        <div className="flex-1 w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rx-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-rx-accent uppercase tracking-wider">
                  Admin Verification Control
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
                Vehicle Document Verification
              </h1>

              <p className="text-xs sm:text-sm text-rx-muted mt-1">
                Inspect registration certificates (RC) & insurance policies.
                Approve host listings for the marketplace.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                activeTab === "pending" ? fetchPending() : fetchAllVehicles()
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-rx-card hover:bg-rx-surface border border-rx-border rounded-xl text-xs font-bold text-rx-main transition-colors cursor-pointer self-start sm:self-auto shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 text-rx-accent" />
              <span>Refresh Queue</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-rx-card p-1.5 rounded-2xl border border-rx-border w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "pending" ?
                    "bg-rx-accent text-rx-on-accent shadow-md"
                  : "text-rx-muted hover:text-rx-main"
                }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Verification</span>

                {pendingVehicles.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === "pending" ?
                        "bg-rx-page text-rx-accent"
                      : "bg-rx-surface text-rx-main"
                    }`}>
                    {pendingVehicles.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all" ?
                    "bg-rx-accent text-rx-on-accent shadow-md"
                  : "text-rx-muted hover:text-rx-main"
                }`}>
                <Car className="w-3.5 h-3.5" />
                <span>All Vehicles Fleet</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-rx-muted" />

              <input
                type="text"
                placeholder="Search make, model, plate, host..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-rx-card border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent"
              />
            </div>
          </div>

          {loading ?
            <div className="bg-rx-card rounded-3xl border border-rx-border p-8 shadow-xl">
              <table className="w-full">
                <tbody>
                  <TableRowSkeleton cols={5} />
                  <TableRowSkeleton cols={5} />
                </tbody>
              </table>
            </div>
          : displayedVehicles.length > 0 ?
            <div className="space-y-4">
              {displayedVehicles.map((v) => {
                const owner = v.owner || {};
                const verif = v.verification || {};
                const verifStatus = verif.status || "pending";

                const registrationInfo = getDocumentInfo(
                  verif.registrationDocument,
                );

                const insuranceInfo = getDocumentInfo(verif.insuranceDocument);

                return (
                  <div
                    key={v._id}
                    className="bg-rx-card rounded-3xl border border-rx-border p-6 shadow-xl space-y-5 transition-all hover:border-rx-border/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rx-border">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getVehicleImageUrl(v)}
                          alt={v.model}
                          className="w-16 h-12 object-cover rounded-xl shrink-0 border border-rx-border bg-rx-page"
                        />

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-rx-main text-base">
                              {v.make} {v.model}
                            </h3>

                            <span className="text-rx-muted font-medium text-xs">
                              ({v.year})
                            </span>

                            {v.vehicleNumber && (
                              <span className="px-2 py-0.5 rounded bg-rx-page text-rx-accent border border-rx-border text-[10px] font-mono font-bold uppercase">
                                {v.vehicleNumber}
                              </span>
                            )}

                            <Badge status={verifStatus}>{verifStatus}</Badge>
                          </div>

                          <p className="text-xs text-rx-muted mt-1">
                            Car Host:{" "}
                            <strong className="text-rx-main">
                              {owner.name || "Registered Host"}
                            </strong>{" "}
                            &bull; {owner.email || "No email"} &bull;{" "}
                            {owner.phone || "No phone"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-rx-accent">
                            ${v.rentalPricePerDay}/day
                          </span>

                          <span className="text-[10px] text-rx-muted block">
                            {v.location || "Location set"}
                          </span>
                        </div>

                        <Link
                          to={`/cars/${v._id}`}
                          className="p-2 rounded-xl border border-rx-border bg-rx-surface text-rx-muted hover:text-rx-main hover:border-rx-accent/50 transition-colors"
                          title="View live vehicle listing">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-rx-surface rounded-2xl border border-rx-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rx-muted font-bold">
                            <FileText className="w-4 h-4 text-rx-accent" />
                            <span>Vehicle Registration Certificate (RC)</span>
                          </div>

                          {registrationInfo?.exists ?
                            <span className="text-[10px] font-bold text-rx-accent bg-rx-accent-soft/40 px-2 py-0.5 rounded border border-rx-accent-border/60">
                              Attached
                            </span>
                          : <span className="text-[10px] font-bold text-rx-accent bg-rx-accent-soft/40 px-2 py-0.5 rounded border border-rx-accent-border/60">
                              Missing
                            </span>
                          }
                        </div>

                        {registrationInfo?.exists ?
                          <div className="flex items-center justify-between pt-1 gap-2">
                            <span className="truncate text-rx-muted font-mono text-[11px]">
                              {registrationInfo.originalName}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                disabled={documentLoading}
                                onClick={() =>
                                  openDocument(
                                    v,
                                    "registrationDocument",
                                    `${v.make} ${v.model} - Registration Certificate (RC)`,
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rx-card hover:bg-rx-border text-rx-muted rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rx-border disabled:opacity-50 disabled:cursor-not-allowed">
                                {documentLoading ?
                                  <Loader2 className="w-3.5 h-3.5 text-rx-accent animate-spin" />
                                : <Eye className="w-3.5 h-3.5 text-rx-accent" />
                                }
                                <span>Preview</span>
                              </button>

                              <button
                                type="button"
                                disabled={documentLoading}
                                onClick={() =>
                                  openDocumentInNewTab(
                                    v,
                                    "registrationDocument",
                                  )
                                }
                                className="p-1.5 text-rx-muted hover:text-rx-accent transition-colors disabled:opacity-50 cursor-pointer"
                                title="Open in new tab">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        : <p className="text-rx-accent text-xs italic">
                            No RC document uploaded by host yet.
                          </p>
                        }
                      </div>

                      <div className="p-4 bg-rx-surface rounded-2xl border border-rx-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rx-muted font-bold">
                            <ShieldCheck className="w-4 h-4 text-rx-accent" />
                            <span>Insurance Policy Certificate</span>
                          </div>

                          {insuranceInfo?.exists ?
                            <span className="text-[10px] font-bold text-rx-accent bg-rx-accent-soft/40 px-2 py-0.5 rounded border border-rx-accent-border/60">
                              Attached
                            </span>
                          : <span className="text-[10px] font-bold text-rx-accent bg-rx-accent-soft/40 px-2 py-0.5 rounded border border-rx-accent-border/60">
                              Missing
                            </span>
                          }
                        </div>

                        {insuranceInfo?.exists ?
                          <div className="flex items-center justify-between pt-1 gap-2">
                            <span className="truncate text-rx-muted font-mono text-[11px]">
                              {insuranceInfo.originalName}
                            </span>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                disabled={documentLoading}
                                onClick={() =>
                                  openDocument(
                                    v,
                                    "insuranceDocument",
                                    `${v.make} ${v.model} - Insurance Policy`,
                                  )
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rx-card hover:bg-rx-border text-rx-muted rounded-lg text-xs font-bold transition-colors cursor-pointer border border-rx-border disabled:opacity-50 disabled:cursor-not-allowed">
                                {documentLoading ?
                                  <Loader2 className="w-3.5 h-3.5 text-rx-accent animate-spin" />
                                : <Eye className="w-3.5 h-3.5 text-rx-accent" />
                                }
                                <span>Preview</span>
                              </button>

                              <button
                                type="button"
                                disabled={documentLoading}
                                onClick={() =>
                                  openDocumentInNewTab(v, "insuranceDocument")
                                }
                                className="p-1.5 text-rx-muted hover:text-rx-accent transition-colors disabled:opacity-50 cursor-pointer"
                                title="Open in new tab">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        : <p className="text-rx-accent text-xs italic">
                            No insurance document uploaded by host yet.
                          </p>
                        }
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-rx-border flex-wrap gap-3">
                      <div className="text-xs text-rx-muted">
                        {verif.verifiedAt ?
                          <span className="inline-flex items-center gap-1 text-rx-accent">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified on{" "}
                            {new Date(verif.verifiedAt).toLocaleDateString()}
                          </span>
                        : <span className="inline-flex items-center gap-1 text-rx-accent">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting admin decision
                          </span>
                        }
                      </div>

                      {verifStatus === "pending" && (
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                id: v._id,
                                status: "rejected",
                                title: "Reject Vehicle Verification?",
                                message: `Decline verification for ${v.make} ${v.model} (${v.vehicleNumber || "No Plate"})? The host will be notified immediately.`,
                              })
                            }
                            className="flex items-center gap-1.5 px-4 py-2 border border-rx-accent-border/60 bg-rx-accent-soft/20 text-rx-accent hover:bg-rx-accent-soft/40 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs">
                            <X className="w-4 h-4" />
                            <span>Reject Documents</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                id: v._id,
                                status: "verified",
                                title: "Approve & Verify Vehicle?",
                                message: `Confirm that documents for ${v.make} ${v.model} (${v.vehicleNumber || "No Plate"}) are authentic. The host will receive the Verified Badge and the vehicle will go live on the marketplace.`,
                              })
                            }
                            className="flex items-center gap-1.5 px-5 py-2 bg-rx-accent hover:bg-rx-accent-soft text-rx-main rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer">
                            <Check className="w-4 h-4" />
                            <span>Approve & Verify Vehicle</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          : <EmptyState
              icon={FileCheck}
              title={
                activeTab === "pending" ?
                  "All Verifications Cleared"
                : "No Vehicles Found"
              }
              description={
                activeTab === "pending" ?
                  "There are currently no vehicle verification requests awaiting administrative approval."
                : "No vehicle listings matched your filter query."
              }
            />
          }
        </div>
      </div>

      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title="Document Inspection Preview"
          subtitle={previewDoc.title}
          maxWidth="max-w-3xl">
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-rx-border bg-rx-page flex items-center justify-center min-h-[360px] max-h-[550px] p-2">
              <iframe
                src={previewDoc.url}
                title="Document Preview"
                className="w-full h-[500px] rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rx-accent hover:underline">
                <ExternalLink className="w-4 h-4" />
                <span>Open Original File in New Tab</span>
              </a>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-rx-surface text-rx-muted rounded-xl text-xs font-bold hover:bg-rx-border transition-colors cursor-pointer">
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        onConfirm={handleReview}
        loading={submitting}
        title={confirmModal?.title || "Review Verification"}
        message={
          confirmModal?.message || "Proceed with this verification decision?"
        }
        confirmText={
          confirmModal?.status === "verified" ?
            "Confirm Approval"
          : "Confirm Rejection"
        }
        isDanger={confirmModal?.status === "rejected"}
      />
    </div>
  );
};

export default AdminVerificationPage;
