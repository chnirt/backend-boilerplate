import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Site } from './site.entity'
import { MongoRepository } from 'typeorm'
import { ApolloError } from 'apollo-server-core'

@Injectable()
export class SiteService {
	constructor(
		@InjectRepository(Site)
		private readonly siteRepository: MongoRepository<Site>
	) {}

	async findById(_id: string): Promise<Site> {
		const message = 'Not Found: Site'
		const code = '404'
		const additionalProperties = {}

		const site = await this.siteRepository.findOne({ _id })

		if (!site) {
			throw new ApolloError(message, code, additionalProperties)
		}

		return site
	}
}
