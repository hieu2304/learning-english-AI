import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { RegisterDto, ConfirmDto, LoginDto } from './dto';
import * as nodemailer from 'nodemailer';



const pendingRegister = new Map<string, { username: string; password: string; code: string }>();

@Injectable()
export class AuthService {
  private supabase;
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }
  async sendMail(to: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Learning English AI" <${process.env.MAIL_USER}>`,
      to,
      subject: 'Mã xác nhận đăng ký',
      text: `Mã xác nhận của bạn là: ${code}`,
      html: `<b>Mã xác nhận của bạn là: ${code}</b>`,
    });
  }

  async register(dto: RegisterDto) {

    if (!/^[a-z0-9_]{6,}$/.test(dto.username)) {
      throw new BadRequestException('Username không hợp lệ');
    }
    if (dto.password.length < 6) {
      throw new BadRequestException('Password phải nhiều hơn 6 ký tự');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    pendingRegister.set(dto.email, { username: dto.username, password: dto.password, code });

    await this.sendMail(dto.email, code);
    return { message: 'Đã gửi mã xác nhận về email' };
  }

  async confirm(dto: ConfirmDto) {
    const pending = pendingRegister.get(dto.email);
    if (!pending || pending.code !== dto.code) {
      throw new BadRequestException('Mã xác nhận không đúng');
    }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: dto.email,
      password: pending.password,
      user_metadata: { username: pending.username },
      email_confirm: true,
    });
    if (error) {
      console.error('Supabase error:', error);
      throw new BadRequestException(error.message);
    }
    pendingRegister.delete(dto.email);
    return { message: 'Đăng ký thành công' };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
