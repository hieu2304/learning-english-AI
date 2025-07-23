import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { OpenAiService } from './utils/openAI/service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule,UsersModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, OpenAiService],
  exports: [OpenAiService],
})
export class AppModule {}
