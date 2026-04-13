
const BASE_URL = "http://localhost:4000/ProductImages/";
const DEFAULT_FILENAME = "default-placeholder.png";

export const getImagePath = (imagePath: string | null | undefined): string => {

  if (!imagePath || imagePath.trim() === "") {
    return `${BASE_URL}${DEFAULT_FILENAME}`;
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const fileName = imagePath.replace("ProductImages/", "").replace("ProductImages\\", "");

  return `${BASE_URL}${fileName}`;
};

export const ensureProductImages = (products: any[]): any[] => {
  if (!products) return [];
  return products.map((product) => ({
    ...product,
    imagePath: getImagePath(product.imagePath),
  }));
};

export const ensureProductImage = (product: any): any => {
  if (!product) return null;
  return {
    ...product,
    imagePath: getImagePath(product.imagePath),
  };
};

export const DEFAULT_IMAGE_URL = `${BASE_URL}${DEFAULT_FILENAME}`;
