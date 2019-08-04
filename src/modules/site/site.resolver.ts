import { Resolver, Query, Args } from '@nestjs/graphql'
import { SiteService } from './site.service'
import { Site } from './site.entity'

@Resolver('Site')
export class SiteResolver {
	constructor(private readonly siteService: SiteService) {}

	@Query(() => Site)
	async site(@Args('_id') _id: string) {
		return await this.siteService.findById(_id)
	}
}
