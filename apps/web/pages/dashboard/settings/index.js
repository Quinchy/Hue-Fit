import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-dropdown-menu";
import DashboardLayoutWrapper from "@/components/ui/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useCallback, useRef } from "react";
import { Formik, Form, Field } from "formik";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { SuccessMessage } from "@/components/ui/success-message";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingMessage } from "@/components/ui/loading-message";

export default function Settings() {
  const [data, setData] = useState({
    rolesAndPages: { roles: [], pages: [] },
    initialValues: {
      roleId: "",
      permissions: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dataFetchedRef = useRef(false);

  const fetchInitialData = useCallback(async () => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    setLoading(true);
    try {
      const response = await axios.post(`/api/settings/get-user-permissions`);
      const { pages, permissions, roles, currentRoleId } = response.data;

      const initialPermissions = pages.map((page) => {
        const perm = permissions.find((p) => p.pageId === page.id) || {};
        return {
          page: page.name,
          pageId: page.id,
          canView: perm.can_view || false,
          canEdit: perm.can_edit || false,
          canAdd: perm.can_add || false,
          canDelete: perm.can_delete || false,
        };
      });

      setData({
        rolesAndPages: { roles, pages },
        initialValues: {
          roleId: currentRoleId,
          permissions: initialPermissions,
        },
      });
      setLoading(false);
    } catch (error) {
      setErrorMessage("Failed to load permissions. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRoleChange = async (selectedRoleId) => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/settings/get-user-permissions`, {
        roleId: selectedRoleId,
      });
      const { permissions } = response.data;

      const updatedPermissions = data.rolesAndPages.pages.map((page) => {
        const perm = permissions.find((p) => p.pageId === page.id) || {};
        return {
          page: page.name,
          pageId: page.id,
          canView: perm.can_view || false,
          canEdit: perm.can_edit || false,
          canAdd: perm.can_add || false,
          canDelete: perm.can_delete || false,
        };
      });

      setData((prev) => ({
        ...prev,
        initialValues: {
          roleId: selectedRoleId,
          permissions: updatedPermissions,
        },
      }));
      setLoading(false);
    } catch (error) {
      setErrorMessage("Failed to change role. Please try again.");
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const permissions = values.permissions.map((perm) => ({
        pageId: perm.pageId,
        can_view: perm.canView,
        can_edit: perm.canEdit,
        can_add: perm.canAdd,
        can_delete: perm.canDelete,
      }));

      await axios.post(`/api/settings/set-user-permissions`, {
        roleId: values.roleId,
        permissions,
      });

      setSuccessMessage("Permissions updated successfully.");
    } catch (error) {
      setErrorMessage("Failed to update permissions. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayoutWrapper>
      <Formik
        enableReinitialize
        initialValues={data.initialValues}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form className="flex flex-col gap-5">
            <CardTitle className="text-4xl">User Permissions</CardTitle>
            <Card className="flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <Label className="text-lg font-medium">User Role</Label>
                {loading ? (
                  <Skeleton className="w-[180px] h-8" />
                ) : (
                  <Select
                    onValueChange={(value) =>
                      setFieldValue("roleId", parseInt(value, 10)) && handleRoleChange(parseInt(value, 10))
                    }
                    value={values.roleId ? values.roleId.toString() : ''}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a User Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.rolesAndPages.roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-lg font-medium">Permission Level</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Page</TableHead>
                      <TableHead>Can View</TableHead>
                      <TableHead>Can Edit</TableHead>
                      <TableHead>Can Add</TableHead>
                      <TableHead>Can Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Skeleton className="h-6 w-full" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-6 w-6" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-6 w-6" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-6 w-6" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-6 w-6" />
                            </TableCell>
                          </TableRow>
                        ))
                      : values.permissions.map((perm, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {perm.page}
                            </TableCell>
                            {["canView", "canEdit", "canAdd", "canDelete"].map(
                              (permType) => (
                                <TableCell className="text-left" key={permType}>
                                  <Checkbox
                                    checked={perm[permType]}
                                    onCheckedChange={(checked) =>
                                      setFieldValue(
                                        `permissions[${index}].${permType}`,
                                        checked
                                      )
                                    }
                                  />
                                </TableCell>
                              )
                            )}
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col">
                {!loading && (
                  <Button type="submit" className="w-[180px]" disabled={submitting}>
                    {submitting ? <LoadingMessage message="Saving changes..." /> : "Save Changes"}
                  </Button>
                )}
                <SuccessMessage message={successMessage} className="mt-4" />
                <ErrorMessage message={errorMessage} className="mt-4" />
              </div>
            </Card>
          </Form>
        )}
      </Formik>
    </DashboardLayoutWrapper>
  );
}
