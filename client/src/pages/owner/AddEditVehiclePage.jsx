import React, {useState, useEffect, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {
  Car,
  IndianRupee,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Sparkles,
  UploadCloud,
  X,
  Plus,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import OwnerSidebar from "../../components/owner/OwnerSidebar";
import CustomSelect from "../../components/common/CustomSelect";
import vehicleApi from "../../api/vehicleApi";
import {createVehicleFormData} from "../../api/uploadApi";
import {useToast} from "../../context/ToastContext";

export const AddEditVehiclePage = () => {
  const {id} = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const {success, error: toastError} = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    vehicleNumber: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vehicleType: "sedan",
    fuelType: "petrol",
    transmission: "automatic",
    seatingCapacity: 5,
    mileage: 28,
    rentalPricePerDay: 2500,
    location: "",
    description: "",
    images: [],
    driverAvailable: false,
    driverPricePerDay: 1200,
    features: ["Air Conditioning", "Bluetooth Audio", "Reverse Parking Camera"],
  });

  const availableFeatures = [
    "Air Conditioning",
    "Bluetooth Audio",
    "Reverse Parking Camera",
    "GPS Navigation",
    "Apple CarPlay / Android Auto",
    "Leather Seats",
    "Sunroof / Moonroof",
    "Rear AC Vents",
    "Keyless Entry",
    "360° Camera",
    "Hill Hold Assist",
    "Cooled Seats",
  ];

  useEffect(() => {
    if (!isEditing) return;

    let isMounted = true;

    const fetchVehicle = async () => {
      try {
        setLoading(true);

        const res = await vehicleApi.getVehicleById(id);
        const v = res?.vehicle;

        if (isMounted && v) {
          setFormData({
            vehicleNumber: v.vehicleNumber || "",
            make: v.make || "",
            model: v.model || "",
            year: v.year || new Date().getFullYear(),
            vehicleType: v.vehicleType || "sedan",
            fuelType: v.fuelType || "petrol",
            transmission: v.transmission || "automatic",
            seatingCapacity: v.seatingCapacity || 5,
            mileage: v.mileage || 18,
            rentalPricePerDay: v.rentalPricePerDay || 2500,
            location: v.location || "",
            description: v.description || "",
            images:
              Array.isArray(v.images) ?
                v.images
                  .map((image) =>
                    typeof image === "string" ? image : image.url,
                  )
                  .filter(Boolean)
              : [],
            driverAvailable: Boolean(v.driverAvailable),
            driverPricePerDay: v.driverPricePerDay || 0,
            features: Array.isArray(v.features) ? v.features : [],
          });
        }
      } catch (err) {
        toastError("Failed to load vehicle details");
        navigate("/owner/vehicles");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVehicle();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing, navigate, toastError]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);

      const updated =
        exists ?
          prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];

      return {
        ...prev,
        features: updated,
      };
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const currentFileCount = formData.images.filter(
      (image) => image instanceof File,
    ).length;

    if (currentFileCount + files.length > 8) {
      const remaining = Math.max(0, 8 - currentFileCount);

      if (remaining === 0) {
        toastError("You can upload a maximum of 8 vehicle photos.");
      } else {
        toastError(`You can upload only ${remaining} more vehicle photo(s).`);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        toastError(`${file.name}: Only JPG, PNG and WEBP images are allowed.`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toastError(`${file.name}: Image must be 5 MB or smaller.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles],
      }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const getImagePreview = (image) => {
    if (typeof image === "string") {
      return image;
    }

    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.vehicleNumber.trim()) {
      setErrorMsg("Vehicle Registration / Number Plate is required.");
      return;
    }

    if (
      !formData.make.trim() ||
      !formData.model.trim() ||
      !formData.location.trim()
    ) {
      setErrorMsg("Make, model, and location are required fields.");
      return;
    }

    if (formData.images.length === 0) {
      setErrorMsg("Upload at least one vehicle photo before saving.");
      return;
    }

    const newImages = formData.images.filter((image) => image instanceof File);

    if (!isEditing && newImages.length === 0) {
      setErrorMsg("Upload at least one vehicle photo before saving.");
      return;
    }

    const vehicleData = {
      vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
      make: formData.make.trim(),
      model: formData.model.trim(),
      year: Number(formData.year),
      vehicleType: formData.vehicleType,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      seatingCapacity: Number(formData.seatingCapacity),
      mileage: Number(formData.mileage),
      rentalPricePerDay: Number(formData.rentalPricePerDay),
      location: formData.location.trim(),
      description: formData.description.trim(),
      driverAvailable: Boolean(formData.driverAvailable),
      driverPricePerDay:
        formData.driverAvailable ? Number(formData.driverPricePerDay) : 0,
      features: formData.features,
    };

    try {
      setSubmitting(true);

      const payload = createVehicleFormData(vehicleData, newImages);

      if (isEditing) {
        await vehicleApi.updateVehicle(id, payload);

        success("Vehicle updated successfully!");
      } else {
        await vehicleApi.addVehicle(payload);

        success(
          "Vehicle added successfully! Submit verification docs to activate on marketplace.",
        );
      }

      navigate("/owner/vehicles");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save vehicle";

      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-rx-main">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <OwnerSidebar />

        <div className="flex-1 min-w-0 w-full space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-rx-border">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to="/owner/vehicles"
                  className="text-xs font-bold text-rx-muted hover:text-rx-main flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Fleet
                </Link>

                <span className="text-rx-muted">&bull;</span>

                <span className="text-xs font-semibold text-rx-accent">
                  {isEditing ? "Edit Vehicle" : "New Listing"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-rx-main tracking-tight">
                {isEditing ?
                  `Edit ${formData.make} ${formData.model}`
                : "List a New Vehicle"}
              </h1>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rx-accent-soft/50 border border-rx-accent-border/60 rounded-2xl flex items-start gap-2.5 text-xs text-rx-accent">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rx-accent" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ?
            <div className="bg-rx-card rounded-3xl p-12 text-center text-rx-muted">
              Loading vehicle details...
            </div>
          : <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-rx-card rounded-3xl border border-rx-border p-6 sm:p-7 shadow-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rx-muted flex items-center gap-2">
                  <Car className="w-4 h-4 text-rx-accent" />
                  Vehicle Identification & Specifications
                </h3>

                <div className="p-4 bg-rx-surface rounded-2xl border border-rx-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-rx-accent flex items-center gap-1.5 uppercase tracking-wide">
                      <ShieldAlert className="w-3.5 h-3.5 text-rx-accent" />
                      Vehicle Number / License Plate *
                    </label>

                    <span className="text-[10px] text-rx-muted">
                      Official Registration ID
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="e.g. MH-02-AB-1234 or DL-8C-AB-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) =>
                      handleChange(
                        "vehicleNumber",
                        e.target.value.toUpperCase(),
                      )
                    }
                    className="w-full px-3.5 py-2.5 bg-rx-card border border-rx-border rounded-xl text-sm font-mono font-bold text-rx-main placeholder-rx-muted uppercase tracking-wider focus:outline-none focus:border-rx-accent transition-all"
                  />

                  <p className="text-[11px] text-rx-muted">
                    Enter the exact vehicle number as registered on the vehicle
                    registration certificate (RC).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Make / Brand *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Maruti Suzuki, Tata, Mahindra"
                      value={formData.make}
                      onChange={(e) => handleChange("make", e.target.value)}
                      className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs font-semibold text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Model *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Swift, Nexon, XUV700"
                      value={formData.model}
                      onChange={(e) => handleChange("model", e.target.value)}
                      className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs font-semibold text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Model Year *
                    </label>

                    <input
                      type="number"
                      required
                      min="1995"
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs font-semibold text-rx-main focus:outline-none focus:border-rx-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Category
                    </label>

                    <CustomSelect
                      options={[
                        {
                          value: "sedan",
                          label: "Sedan",
                          icon: "🚘",
                        },
                        {
                          value: "suv",
                          label: "SUV",
                          icon: "🚙",
                        },
                        {
                          value: "hatchback",
                          label: "Hatchback",
                          icon: "🚗",
                        },
                        {
                          value: "muv",
                          label: "MUV / MPV",
                          icon: "🚐",
                        },
                        {
                          value: "luxury",
                          label: "Luxury & Exotic",
                          icon: "✨",
                        },
                        {
                          value: "sports",
                          label: "Sports",
                          icon: "🏎️",
                        },
                        {
                          value: "truck",
                          label: "Truck / Pickup",
                          icon: "🛻",
                        },
                        {
                          value: "van",
                          label: "Van / Minivan",
                          icon: "🚐",
                        },
                        {
                          value: "convertible",
                          label: "Convertible",
                          icon: "🏎️",
                        },
                      ]}
                      value={formData.vehicleType || "sedan"}
                      onChange={(val) => handleChange("vehicleType", val)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Transmission
                    </label>

                    <CustomSelect
                      options={[
                        {
                          value: "automatic",
                          label: "Automatic",
                        },
                        {
                          value: "manual",
                          label: "Manual",
                        },
                      ]}
                      value={formData.transmission || "automatic"}
                      onChange={(val) => handleChange("transmission", val)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Powertrain
                    </label>

                    <CustomSelect
                      options={[
                        {
                          value: "petrol",
                          label: "Petrol",
                          icon: "⛽",
                        },
                        {
                          value: "diesel",
                          label: "Diesel",
                          icon: "🛢️",
                        },
                        {
                          value: "electric",
                          label: "Electric (EV)",
                          icon: "⚡",
                          badge: "EV",
                        },
                        {
                          value: "hybrid",
                          label: "Hybrid",
                          icon: "🔋",
                          badge: "Hybrid",
                        },
                      ]}
                      value={formData.fuelType || "petrol"}
                      onChange={(val) => handleChange("fuelType", val)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Passenger Capacity
                    </label>

                    <input
                      type="number"
                      required
                      min="1"
                      max="15"
                      value={formData.seatingCapacity}
                      onChange={(e) =>
                        handleChange("seatingCapacity", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs font-semibold text-rx-main focus:outline-none focus:border-rx-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-rx-card rounded-3xl border border-rx-border p-6 sm:p-7 shadow-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rx-muted flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-rx-accent" />
                  Pricing & Availability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Rental Price Per Day (₹) *
                    </label>

                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.rentalPricePerDay}
                      onChange={(e) =>
                        handleChange("rentalPricePerDay", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs font-bold text-rx-accent focus:outline-none focus:border-rx-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-rx-muted">
                      Pickup Location / City *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru, Mumbai or Delhi"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full px-3 py-2 bg-rx-surface border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent"
                    />
                  </div>
                </div>

                <div className="p-4 bg-rx-surface rounded-2xl border border-rx-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="driverAvailable"
                      checked={formData.driverAvailable}
                      onChange={(e) =>
                        handleChange("driverAvailable", e.target.checked)
                      }
                      className="w-4 h-4 accent-rx-accent rounded border-rx-border cursor-pointer"
                    />

                    <div>
                      <label
                        htmlFor="driverAvailable"
                        className="text-xs font-bold text-rx-main cursor-pointer">
                        Provide Chauffeur / Driver Option
                      </label>

                      <p className="text-[11px] text-rx-muted">
                        Allow renters to request a dedicated professional driver
                        for an extra daily charge.
                      </p>
                    </div>
                  </div>

                  {formData.driverAvailable && (
                    <div className="w-48 space-y-1">
                      <label className="text-[10px] font-bold text-rx-muted uppercase">
                        Driver Rate (₹/day)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={formData.driverPricePerDay}
                        onChange={(e) =>
                          handleChange("driverPricePerDay", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 bg-rx-card border border-rx-border rounded-xl text-xs font-bold text-rx-main"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-rx-card rounded-3xl border border-rx-border p-6 sm:p-7 shadow-xl space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rx-muted flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-rx-accent" />
                    Actual Vehicle Photos & Description
                  </h3>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                />

                <div
                  onClick={() => !submitting && fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 border-rx-border hover:border-rx-accent/60 bg-rx-surface/60 hover:bg-rx-surface">
                  <div className="w-12 h-12 rounded-2xl bg-rx-card border border-rx-border flex items-center justify-center text-rx-accent">
                    {submitting ?
                      <Loader2 className="w-6 h-6 animate-spin text-rx-accent" />
                    : <UploadCloud className="w-6 h-6" />}
                  </div>

                  <div>
                    <span className="text-xs sm:text-sm font-bold text-rx-main block">
                      Click to Upload Vehicle Photos from Device
                    </span>

                    <span className="text-[11px] text-rx-muted block mt-0.5">
                      Supports JPG, PNG, WEBP up to 5 MB each. Maximum 8 photos.
                    </span>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-rx-muted">
                      <span className="font-semibold">
                        Vehicle Photos ({formData.images.length})
                      </span>

                      <span className="text-[10px]">
                        First photo will be the primary cover image
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formData.images.map((image, idx) => {
                        const preview = getImagePreview(image);

                        return (
                          <div
                            key={
                              typeof image === "string" ?
                                `${image}-${idx}`
                              : `${image.name}-${image.lastModified}-${idx}`
                            }
                            className="relative group aspect-16/10 rounded-xl overflow-hidden border border-rx-border bg-rx-page shadow-sm">
                            {preview && (
                              <img
                                src={preview}
                                alt={`Vehicle ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rx-accent text-rx-on-accent shadow-xs">
                                Cover
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rx-page/80 text-rx-muted hover:text-rx-main hover:bg-rx-accent-soft/80 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                              title="Remove photo">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      {formData.images.length < 8 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-16/10 rounded-xl border border-dashed border-rx-border hover:border-rx-accent bg-rx-surface/40 hover:bg-rx-surface flex flex-col items-center justify-center gap-1 text-rx-muted hover:text-rx-main transition-all cursor-pointer">
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-bold">
                            Add Photo
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-rx-muted">
                    Vehicle Description
                  </label>

                  <textarea
                    rows="4"
                    placeholder="Describe vehicle condition, premium features, pick-up instructions, and trip rules..."
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full p-3 bg-rx-surface border border-rx-border rounded-xl text-xs text-rx-main placeholder-rx-muted focus:outline-none focus:border-rx-accent transition-all"
                  />
                </div>
              </div>

              <div className="bg-rx-card rounded-3xl border border-rx-border p-6 sm:p-7 shadow-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rx-muted flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rx-accent" />
                  Installed Equipment & Features
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {availableFeatures.map((feat) => {
                    const isSelected = formData.features.includes(feat);

                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => toggleFeature(feat)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected ?
                            "bg-rx-accent-soft/40 border-rx-accent text-rx-main shadow-sm"
                          : "bg-rx-surface border-rx-border text-rx-muted hover:border-rx-border-strong"
                        }`}>
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-rx-accent" : "text-rx-muted"
                          }`}
                        />

                        <span className="truncate">{feat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-rx-border">
                <Link
                  to="/owner/vehicles"
                  className="px-5 py-2.5 bg-rx-surface hover:bg-rx-border text-rx-muted text-xs font-bold rounded-xl transition-colors border border-rx-border">
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50">
                  {submitting ?
                    <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}

                  <span>
                    {submitting ?
                      "Saving Vehicle..."
                    : isEditing ?
                      "Update Vehicle"
                    : "Publish Listing"}
                  </span>
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  );
};

export default AddEditVehiclePage;
