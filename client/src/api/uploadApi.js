export const createVehicleFormData = (vehicleData, images = []) => {
  const formData = new FormData();

  Object.keys(vehicleData).forEach((key) => {
    if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
      if (Array.isArray(vehicleData[key])) {
        formData.append(key, vehicleData[key].join(","));
      } else {
        formData.append(key, vehicleData[key]);
      }
    }
  });

  images.forEach((image) => {
    formData.append("images", image);
  });

  return formData;
};

export const createVerificationFormData = (
  registrationDocument,
  insuranceDocument,
) => {
  const formData = new FormData();

  if (registrationDocument) {
    formData.append("registrationDocument", registrationDocument);
  }

  if (insuranceDocument) {
    formData.append("insuranceDocument", insuranceDocument);
  }

  return formData;
};

export default {
  createVehicleFormData,
  createVerificationFormData,
};
