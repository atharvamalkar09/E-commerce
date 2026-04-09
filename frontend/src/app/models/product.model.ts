export interface Taxonomy {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number; 
  imagePath: string;
  subCategory?: {
    id: number;
    name: string;
    category?: {
      id: number;
      name: string;
      type?: Taxonomy;
    };
  };
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}














// export interface Product{
//     id: number;
//     name: string;
//     description: string;
//     price: number;
//     stockQuantity: number;
//     image: string | null;
//     subCategory: string;
// };

// export interface ProductResponse{
//     items: Product[];
//     total: number;
//     page: number;
//     totalpages: number;
// }