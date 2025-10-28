import { ExtendedRequest } from './../auth/auth-middleware';
import { Request, Response } from "express";
import userService from "./user-service";
import User from './user-model';

export default new class UserController {
    async getUserId (req: ExtendedRequest, res: Response) {
        try {
            const user = req.user;
            res.status(200).json({id: user._id as string});
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProfile(req: ExtendedRequest, res: Response) {
        try {
            const { username, email, cell, cardNumber } = req.body;
            const userId = req.user._id;

            const updatedUser = await User.findByIdAndUpdate(userId, { username, email, cell, cardNumber }, { new: true });
            res.status(200).json({ user: updatedUser });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

      async getProfile (req, res) {
        try {
          const userId = req.user._id;
      
          // Find the user by ID, excluding sensitive information like password
          const user = await User.findById(userId).select("-password");
      
          // If user not found, send an error response
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
      
          // Send the user profile data as a response
          res.status(200).json(user);
        } catch (error) {
          console.error("Failed to get profile", error);
          res.status(500).json({ message: "Server error" });
        }
      }

      // Admin-only methods
      async getAllUsers(req: ExtendedRequest, res: Response) {
        try {
          const users = await userService.getAllUsers();
          res.status(200).json(users);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      }

      async deleteUser(req: ExtendedRequest, res: Response) {
        try {
          const { userId } = req.params;
          await userService.deleteUser(userId);
          res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      }

      async updateUserRole(req: ExtendedRequest, res: Response) {
        try {
          const { userId } = req.params;
          const { role } = req.body;
          
          if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
          }

          const updatedUser = await userService.updateUserRole(userId, role);
          res.status(200).json(updatedUser);
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      }
}