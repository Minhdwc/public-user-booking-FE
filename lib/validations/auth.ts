import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(32, 'Mật khẩu không được quá 32 ký tự');

const vnPhoneSchema = z
  .string()
  .min(1, 'Số điện thoại là bắt buộc')
  .regex(/^(\+84|84|0)(3|5|7|8|9)\d{8}$/, 'Số điện thoại Việt Nam không hợp lệ');

export const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(100, 'Tên không được quá 100 ký tự'),
    username: z
      .string()
      .min(3, 'Username phải có ít nhất 3 ký tự')
      .max(50, 'Username không được quá 50 ký tự'),
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    phone: vnPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
