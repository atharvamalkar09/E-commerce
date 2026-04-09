/**
 * Image utility for the frontend
 * Handles image path construction and error handling
 */

const DEFAULT_IMAGE_PATH = "ProductImages/default-placeholder.png";
const API_BASE_URL = "http://localhost:4000";

/**
 * Construct the full image URL from a product image path
 * @param imagePath - The image path from the backend
 * @param apiUrl - Optional API URL override
 * @returns The full image URL
 */
export const getImageUrl = (imagePath: string | null | undefined, apiUrl: string = API_BASE_URL): string => {
  if (!imagePath || imagePath.trim() === "") {
    return `${apiUrl}/${DEFAULT_IMAGE_PATH}`;
  }
  return `${apiUrl}/${imagePath}`;
};

/**
 * Handle image loading error - fallback to default image
 * Prevents infinite error loops by only attempting fallback once
 * @param event - The error event from img element
 */
export const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  
  // Prevent infinite error loop: only set fallback if not already attempted
  if (img.hasAttribute('data-error-handled')) {
    console.warn('Image failed to load (both original and default)', img.src);
    return;
  }
  
  // Mark that we're handling this error to prevent infinite loops
  img.setAttribute('data-error-handled', 'true');
  
  const defaultImageUrl = `${API_BASE_URL}/${DEFAULT_IMAGE_PATH}`;
  
  // Only set default if not already set to avoid loop
  if (img.src !== defaultImageUrl) {
    img.src = defaultImageUrl;
  }
};

/**
 * Get the default image URL
 */
export const getDefaultImageUrl = (apiUrl: string = API_BASE_URL): string => {
  return `${apiUrl}/${DEFAULT_IMAGE_PATH}`;
};

export const DEFAULT_IMAGE_URL = DEFAULT_IMAGE_PATH;
