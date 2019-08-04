import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { WinstonModule } from 'nest-winston';
import { TypeormModule } from './config/typeorm/typeorm.module';
import { GraphqlModule } from './config/graphql/graphql.module';
import { GraphqlService } from './config/graphql/graphql.service';
import { TypeormService } from './config/typeorm/typeorm.service';
import { CacheService } from './config/cache/cache.service';
import { UserModule } from './modules/user/user.module';
import { SiteModule } from './modules/site/site.module';
import * as winston from 'winston';



const {
  combine,
  json,
  timestamp,
  label,
  printf,
  prettyPrint,
  colorize,
} = winston.format;

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useClass: GraphqlService,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeormService,
    }),
    CacheModule.registerAsync({
      useClass: CacheService,
    }),
    WinstonModule.forRootAsync({
      useFactory: () => ({
        // options
        format: combine(
          label({ label: '🥢 Lunchapp2!' }),
          json(),
          timestamp(),
          // prettyPrint(),
          // colorize(),
          printf(({ level, message, label, timestamp }) => {
            console.log(level);
            return `{\n\tlabel: ${label},\n\ttimestamp: ${timestamp},\n\tlevel: ${level},\n\tmessage: ${message}\n},`;
          }),
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'src/logs/combined.log',
            level: 'info',
          }),
          new winston.transports.File({
            filename: 'src/logs/errors.log',
            level: 'error',
          }),
        ],
        exceptionHandlers: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: 'src/logs/exceptions.log',
          }),
        ],
      }),
      inject: [],
    }),
    UserModule,
    TypeormModule,
    GraphqlModule,
    SiteModule,
  ],
})
export class AppModule {}
