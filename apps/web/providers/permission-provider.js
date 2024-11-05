// providers/permission-provider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

// Create a context for permissions
const PermissionContext = createContext();

// Define the provider component
export const PermissionProvider = ({ children }) => {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch permissions when the session changes or on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user?.roleId) return;

      try {
        setLoading(true);
        const response = await axios.post('/api/settings/get-user-permissions', {
          roleId: session.user.roleId,
        });
        setPermissions(response.data.permissions);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [session?.user?.roleId]);

  return (
    <PermissionContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionContext.Provider>
  );
};

// Custom hook to access permissions from anywhere in the app
export const usePermissions = () => useContext(PermissionContext);