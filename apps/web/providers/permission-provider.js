// providers/permission-provider.js
import React, { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import useSWR from 'swr';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { data: session, update } = useSession();

  const fetcher = (url, roleId) =>
    axios.post(url, { roleId }).then((res) => res.data.permissions);

  const { data: permissions, error, mutate } = useSWR(
    session?.user?.roleId ? ['/api/settings/get-user-permissions', session.user.roleId] : null,
    fetcher
  );

  const loading = !permissions && !error;

  const updatePermissions = async (roleId, newPermissions) => {
    try {
      const response = await axios.post('/api/settings/set-user-permissions', {
        roleId,
        permissions: newPermissions,
      });

      if (response.data.session_update) {
        await update({ triggerUpdate: true });
        await mutate(); // Re-fetch permissions
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  return (
    <PermissionContext.Provider value={{ permissions, loading, updatePermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
