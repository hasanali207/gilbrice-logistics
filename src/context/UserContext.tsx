"use client";

import { getCurrentUser } from "@/services/auth";
import { IUser } from "@/types/user";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface IUserJwtPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
  userType: "GILBRICE_STAFF" | "PARTNER_EMPLOYEE";
  partnerId?: string | null;
}

interface IUserProviderValues {
  user: IUser | null;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const UserContext = createContext<IUserProviderValues | undefined>(undefined);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUser = async () => {
      try {
        const jwtUser = (await getCurrentUser()) as IUserJwtPayload | null;

        console.log("CURRENT JWT USER:", jwtUser);

        if (jwtUser) {
          const mappedUser: IUser = {
            id: jwtUser.id,
            name: jwtUser.fullName,
            username: jwtUser.email,
            email: jwtUser.email,
            role: jwtUser.role,

            // এগুলো IUser-এ থাকলে রাখবে
            userType: jwtUser.userType,
            partnerId: jwtUser.partnerId ?? null,
          };

          setUser(mappedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    handleUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};

export default UserProvider;
