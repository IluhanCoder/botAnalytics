import { Response, NextFunction } from 'express';
import { ExtendedRequest } from './auth-middleware';

const adminMiddleware = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized - user not found' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ message: 'Forbidden - admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error in admin middleware' });
  }
};

export default adminMiddleware;
