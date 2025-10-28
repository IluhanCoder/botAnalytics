import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import userService from "./user-service";
import { IUser } from "../../../shared/types/user-types";

const AdminPanelPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Не вдалося завантажити користувачів");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await userService.updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      setError("Не вдалося змінити роль користувача");
    }
  };

  const handleDeleteClick = (user: IUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      await userService.deleteUser(selectedUser._id);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      setError("Не вдалося видалити користувача");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-6 w-full p-6">
      <Typography variant="h4" className="text-center">
        🔧 Панель адміністратора
      </Typography>

      {error && (
        <Paper className="p-3 bg-red-50 border border-red-300 w-full max-w-4xl">
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      <Paper elevation={3} className="p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Управління користувачами</Typography>
          <Button variant="outlined" onClick={loadUsers} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "🔄 Оновити"}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-6">
            <CircularProgress />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Роль</strong></TableCell>
                  <TableCell><strong>Дії</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <Typography variant="caption" className="font-mono">
                        {user._id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" style={{ minWidth: 120 }}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value as 'user' | 'admin')}
                        >
                          <MenuItem value="user">User</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Видалити
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && users.length === 0 && (
          <Typography className="text-center p-4" color="textSecondary">
            Користувачів не знайдено
          </Typography>
        )}
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити користувача <strong>{selectedUser?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Скасувати</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPanelPage;
