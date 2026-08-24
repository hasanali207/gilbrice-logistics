export interface IUser {
  id: string;
  username: string;
  name?: string;
  address?: string;
  phone?: string;
  image?: string;
  email: string;
  password?: string;
  role: string;

  userType: "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";
  partnerId?: string | null;
  isBlocked?: boolean;
  isDeleted?: boolean;
  bio?: string;
  price?: number;
  subjects?: string;
  gradeLevel?: string;
  averageRating?: number;
  profilePicture?: string;

  amdin?: {
    profilePicture?: string;
  };

  donor?: {
    profilePicture?: string;
  };

  student?: {
    profilePicture?: string;
  };

  teacher?: {
    profilePicture?: string;
  };

  availability?: {
    from: Date;
    to: Date;
  };

  createdAt?: Date;
  updatedAt?: Date;
}
