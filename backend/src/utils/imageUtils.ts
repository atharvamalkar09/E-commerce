/**
 * Utility functions for handling product images
 */

// 1. Define the Base URL where your images are served
const BASE_URL = "http://localhost:4000/ProductImages/";
const DEFAULT_FILENAME = "default-placeholder.png";

/**
 * Builds a full URL for the frontend.
 * Prevents "ProductImages/ProductImages/" double-folder issues.
 */
export const getImagePath = (imagePath: string | null | undefined): string => {
  // If no path exists, return the full URL to the default placeholder
  if (!imagePath || imagePath.trim() === "") {
    return `${BASE_URL}${DEFAULT_FILENAME}`;
  }

  // If the path is already a full URL (starts with http), just return it
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // Clean the path: remove "ProductImages/" if it was already saved in the DB
  // to avoid: http://localhost:4000/ProductImages/ProductImages/file.jpg
  const fileName = imagePath.replace("ProductImages/", "").replace("ProductImages\\", "");

  return `${BASE_URL}${fileName}`;
};

/**
 * Ensure all products in a response have a valid full image URL
 */
export const ensureProductImages = (products: any[]): any[] => {
  if (!products) return [];
  return products.map((product) => ({
    ...product,
    imagePath: getImagePath(product.imagePath),
  }));
};

/**
 * Ensure a single product has a valid full image URL
 */
export const ensureProductImage = (product: any): any => {
  if (!product) return null;
  return {
    ...product,
    imagePath: getImagePath(product.imagePath),
  };
};

export const DEFAULT_IMAGE_URL = `${BASE_URL}${DEFAULT_FILENAME}`;










// /**
//  * Utility functions for handling product images
//  */

// const DEFAULT_IMAGE_PATH = "ProductImages/default-placeholder.png";

// /**
//  * Get the image path for a product, with fallback to default if not provided
//  * @param imagePath - The stored image path from the database
//  * @returns The final image path to use (either product image or default)
//  */
// export const getImagePath = (imagePath: string | null | undefined): string => {
//   if (imagePath && imagePath.trim() !== "") {
//     return imagePath;
//   }
//   return DEFAULT_IMAGE_PATH;
// };

// /**
//  * Ensure all products in a response have a valid image path
//  * @param products - Array of products to process
//  * @returns Products with guaranteed image paths
//  */
// export const ensureProductImages = (products: any[]): any[] => {
//   return products.map((product) => ({
//     ...product,
//     imagePath: getImagePath(product.imagePath),
//   }));
// };

// /**
//  * Ensure a single product has a valid image path
//  * @param product - Product to process
//  * @returns Product with guaranteed image path
//  */
// export const ensureProductImage = (product: any): any => {
//   return {
//     ...product,
//     imagePath: getImagePath(product.imagePath),
//   };
// };

// export const DEFAULT_IMAGE_URL = DEFAULT_IMAGE_PATH;
