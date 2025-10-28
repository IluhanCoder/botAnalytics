import authService from '../auth/auth-service';
import User from './user-model';

export default new class UserService {
  getUsers = async () => {
    return await User.find().select('-password');
  }

  createSpecialist = async (userData: any) => {
    return await authService.registerUser({...userData, role: "specialist"});
  }

  // Admin methods
  getAllUsers = async () => {
    return await User.find().select('-password');
  }

  deleteUser = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return await User.findByIdAndDelete(userId);
  }

  updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = role;
    return await user.save();
  }
};