
const DEFAULT_IMAGE_PATH = "ProductImages/default-placeholder.png";
const API_BASE_URL = "http://localhost:4000";

export const getImageUrl = (imagePath: string | null | undefined, apiUrl: string = API_BASE_URL): string => {
  if (!imagePath || imagePath.trim() === "") {
    return `${apiUrl}/${DEFAULT_IMAGE_PATH}`;
  }
  return `${apiUrl}/${imagePath}`;
};

export const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement;
  
  if (img.hasAttribute('data-error-handled')) {
    console.warn('Image failed to load (both original and default)', img.src);
    return;
  }
  
  img.setAttribute('data-error-handled', 'true');
  
  const defaultImageUrl = `${API_BASE_URL}/${DEFAULT_IMAGE_PATH}`;
  
  if (img.src !== defaultImageUrl) {
    img.src = defaultImageUrl;
  }
};

export const getDefaultImageUrl = (apiUrl: string = API_BASE_URL): string => {
  return `${apiUrl}/${DEFAULT_IMAGE_PATH}`;
};

export const DEFAULT_IMAGE_URL = DEFAULT_IMAGE_PATH;
