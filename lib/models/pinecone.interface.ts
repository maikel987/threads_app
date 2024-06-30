// Import the Pinecone package
import { Pinecone,CreateIndexRequestMetricEnum,IndexModel, Index } from '@pinecone-database/pinecone';

export class PineConeManager {
  private pc: Pinecone;
  private indexName: string;

  private dimension: number;
  private metric: CreateIndexRequestMetricEnum;
  private spec: any;

  constructor(apiKey: string, indexName: string, dimension: number, metric: string, spec: any) {
      this.pc = new Pinecone({ apiKey: apiKey });
      this.indexName = indexName;

      this.dimension = dimension;
      this.metric = metric as CreateIndexRequestMetricEnum;
      this.spec = spec;
      this.initializeIndex();
  }

  private async initializeIndex() {
    // Assuming that listIndexes returns an object that includes an array of IndexModel
    const response = await this.pc.listIndexes();
    if (!response.indexes || !Array.isArray(response.indexes)) {
        console.error('Invalid response structure from listIndexes:', response);
        return;
    }
    const exists = response.indexes.some((indexModel: IndexModel) => indexModel.name === this.indexName); 
    if (!exists) {
        await this.pc.createIndex({
            name: this.indexName,
            dimension: this.dimension,
            metric: this.metric,
            spec: this.spec
        });
    }
}

    // Upsert data into Pinecone
    async upsert(data: any[],namespace:string) {
        const index = this.pc.index(this.indexName);
        await index.namespace(namespace).upsert(data);
    }

    // Query data from Pinecone
    async query(vector: number[],namespace:string, filter: any, topK: number, includeValues: boolean) {
        const index = this.pc.index(this.indexName);
        return await index.namespace(namespace).query({
            vector,
            filter,
            topK,
            includeValues
        });
    }

    // Fetch specific records by ID
    async fetch(ids: string[],namespace:string) {
        const index = this.pc.index(this.indexName);
        return await index.namespace(namespace).fetch(ids);
    }

    // Update a record in Pinecone
    async update(data: any,namespace:string) {
        const index = this.pc.index(this.indexName);
        await index.namespace(namespace).update(data);
    }

    // Delete one or more records by ID
    async deleteOne(id: string,namespace:string) {
        const index = this.pc.index(this.indexName);
        await index.namespace(namespace).deleteOne(id);
    }

    async deleteMany(ids: string[],namespace:string) {
        const index = this.pc.index(this.indexName);
        await index.namespace(namespace).deleteMany(ids);
    }

    // List paginated results
    async listPaginated(prefix: string, namespace:string, paginationToken?: string) {
        const index = this.pc.index(this.indexName);
        return await index.namespace(namespace).listPaginated({
            prefix,
            paginationToken
        });
    }
    async fetchAllVectors(prefix: string, namespace: string) {
        let paginationToken: string | undefined = undefined;
        let allVectors = [];

        do {
            const results = await this.listPaginated(prefix, namespace, paginationToken);
            // Check if results and pagination are defined to satisfy TypeScript's strict null checks
            if (results && results.vectors) {
                allVectors.push(...results.vectors);
                paginationToken =results.pagination?results.pagination.next:undefined;  // Update paginationToken
            } else {
                // Handle the case where results might not have the expected structure
                throw new Error("Unexpected response structure from Pinecone listPaginated.");
            }
        } while (paginationToken);

        return allVectors;
    }

    

    // Describe index statistics
    async describeIndexStats() {
        const index = this.pc.index(this.indexName);
        return await index.describeIndexStats();
    }
}
