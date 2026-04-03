import { NextRequest, NextResponse } from 'next/server';
import { DataProcessor } from '@/app/libs/dataProcessor';
import { openaiClient } from '@/app/libs/openai/openai';
import { pineconeClient } from '@/app/libs/pinecone';
import { z } from 'zod';

const uploadDocumentSchema = z.object({
	urls: z.array(z.string().url()).min(1),
});

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// TODO: Step 1 - Parse and validate the request body
		// Use uploadDocumentSchema.parse() to validate the incoming request
		const parsed = uploadDocumentSchema.parse(body);  // NOTE: parsed = { urls: [ 'https://react.dev/learn' ] } 

		// Extract the 'urls' array from the parsed body
		const { urls } = parsed;   // array of url strings

		// TODO: Step 2 - Scrape and chunk the content
		// Create a new DataProcessor instance
		const processor = new DataProcessor();
		// Use processor.processUrls() to scrape and chunk the URLs
		// This returns an array of text chunks with metadata
		const chunks = await processor.processUrls(urls);  // calls the scraping method under the hood with cheerio
		// console.log({ chunks });

		// TODO: Step 3 - Check if we got any content
		// If chunks.length === 0, return an error response
		// Status should be 400 with appropriate error message
		if (chunks.length === 0) {
			return NextResponse.json(
				{ error: 'No content found to process' },
				{ status: 400 }
			);
		}

		// TODO: Step 4 - Get Pinecone index
		// Use pineconeClient.Index() to get your index
		// The index name comes from process.env.PINECONE_INDEX
		const indexName = process.env.PINECONE_INDEX;
		if (!indexName) {
			throw new Error('PINECONE_INDEX environment variable not set');
		}
		const index = pineconeClient.Index(indexName);

		// TODO: Step 5 - Process chunks in batches
		// Pinecone recommends batching uploads (100 at a time)
		// Loop through chunks in batches
		const batchSize = 100;  // number of chunks to upload at a time
		let successCount = 0;
		let failCount = 0;

		for (let i = 0; i < chunks.length; i += batchSize) {
			const batch = chunks.slice(i, i + batchSize);
			console.log(
				`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
					chunks.length / batchSize
				)}...`
			);
			try {
				// TODO: Step 6 - Generate embeddings for each batch
				// Use openaiClient.embeddings.create()
				// Model: 'text-embedding-3-small'
				// Dimensions: 512
				// Input: array of chunk.content strings from the batch
				const embeddingResponse = await openaiClient.embeddings.create({
					model: 'text-embedding-3-small',
					dimensions: 512,
					input: batch.map((chunk) => chunk.content),
				});

				// TODO: Step 7 - Prepare vectors for Pinecone
				// Map each chunk to a vector object with:
				// - id: chunk.id
				// - values: the embedding array from embeddingResponse.data[idx].embedding
				// - metadata: { text: chunk.content, ...chunk.metadata }
				// IMPORTANT: Include text: chunk.content so the actual text is searchable!
				const vectors = batch.map((chunk, idx) => ({
					// id: `${chunk.metadata.url}-${chunk.metadata.chunkIndex}`,
					id: `${chunk.id}`,
					values: embeddingResponse.data[idx].embedding,
					metadata: {
						text: chunk.content,
						// url: chunk.metadata.url || '',
						// title: chunk.metadata.title || '',
						// chunkIndex: chunk.metadata.chunkIndex || 0,
						// totalChunks: chunk.metadata.totalChunks || 0,
						...chunk.metadata
					},
				}));
				// console.log({vectors});

				// TODO: Step 8 - Upload to Pinecone
				// Use index.upsert() to upload the vectors array
				// Increment successCount by batch.length
					await index.upsert(vectors);
					successCount += batch.length;
					console.log(`✅ Uploaded ${batch.length} vectors`);
			} catch (error) {
				failCount += batch.length;
				console.error(`❌ Failed to process batch:`, error);
			}
		}
		
		// TODO: Step 9 - Return success response
		// Return NextResponse.json() with:
		// - success: true
		// - chunksProcessed: chunks.length
		// - vectorsUploaded: successCount
		// - status: 200
		return NextResponse.json(
			{
				success: true,
				vectorsUploaded: successCount,
				chunksProcessed: chunks.length,
			}, 
			{ status: 200 }
		);
		// throw new Error('Upload document not fully implemented yet!');
	} catch (error) {
		console.error('Error uploading documents:', error);
		return NextResponse.json(
			{ error: 'Failed to upload documents' },
			{ status: 500 }
		);
	}
}
