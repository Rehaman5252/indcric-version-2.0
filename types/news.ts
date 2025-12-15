export interface News {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  redirectUrl: string;
  position: number; // 1-8 slots
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export interface NewsStats {
  totalNews: number;
  activeNews: number;
  inactiveNews: number;
}

export interface NewsClickLog {
  id: string;
  newsId: string;
  userId: string;
  clickedAt: any;
}
