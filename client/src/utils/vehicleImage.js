export const getVehicleImageUrl = (vehicle) => {
  const image = vehicle?.images?.[0];

  if (typeof image === 'string') {
    return image;
  }

  return image?.url || '';
};

export const getVehicleImageUrls = (vehicle) => {
  if (!Array.isArray(vehicle?.images)) {
    return [];
  }

  return vehicle.images
    .map((image) =>
      typeof image === 'string' ? image : image?.url
    )
    .filter(Boolean);
};
