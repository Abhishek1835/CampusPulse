import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'super_secret_jwt_college_events_key_2025_987654321', {
    expiresIn: '7d'
  });
};

export const sendTokenResponse = (user, statusCode, res, message = 'Authenticated successfully') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        _id: user._id,
        usn: user.usn,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch,
        year: user.year,
        designation: user.designation,
        club: user.club,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      token
    }
  });
};
