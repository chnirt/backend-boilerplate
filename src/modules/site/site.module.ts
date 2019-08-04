import { Module } from '@nestjs/common'
import { SiteService } from './site.service'
import { SiteResolver } from './site.resolver'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Site } from './site.entity'

@Module({
	imports: [TypeOrmModule.forFeature([Site])],
	providers: [SiteService, SiteResolver]
})
export class SiteModule {}
