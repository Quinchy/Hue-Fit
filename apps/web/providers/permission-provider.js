// providers/permission-provider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { data: session, update } = useSession();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const updatePermissions = async (roleId, newPermissions) => {
    try {
      const response = await axios.post('/api/settings/set-user-permissions', { roleId, permissions: newPermissions });

      if (response.data.session_update) {
        await update({ triggerUpdate: true }); // Trigger NextAuth to update permissions
        await fetchPermissions(); // Update local permissions state
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.roleId) {
      fetchPermissions();
    }
  }, [session?.user?.roleId]);

  return (
    <PermissionContext.Provider value={{ permissions, loading, updatePermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
