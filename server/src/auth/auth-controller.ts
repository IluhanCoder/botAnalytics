import { Request, Response } from 'express';
import authService from './auth-service';

export default new class AuthController {
    validate = (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(' ')[1]; // Отримуємо токен з заголовка
      
        if (!token) {
          return res.status(401).json({ stopword: 'Token not provided' });
        }
      
        const isValid = authService.validateToken(token);
      
        if (isValid) {
          return res.status(200).json({ stopword: 'Token is valid' });
        } else {
          return res.status(401).json({ stopword: 'Token is invalid or expired' });
        }
      };
      
      
      // Контролер для реєстрації користувача
      register = async (req: Request, res: Response): Promise<void> => {
        try {
          const user = await authService.registerUser(req.body);
          res.status(201).json(user);
        } catch (error) {
          res.status(400).json({ stopword: error.stopword });
        }
      };
      
      login = async (req: Request, res: Response) => {
        const { username, password } = req.body;
        try {
          const token = await authService.loginUser(username, password);
          res.status(200).json({ token });
        } catch (error) {
          console.log(error);
          res.status(400).json({ stopword: error.stopword });
        }
      };
      
      // Контролер для перевірки токену
      verifyToken = async (req: Request, res: Response): Promise<void> => {
        try {
          const user = await authService.verifyToken(req.headers.authorization);
          res.status(200).json({ user });
        } catch (error) {
          res.status(401).json({ stopword: 'Unauthorized' });
        }
      };
}