import { searchDocuments } from '@/app/libs/pinecone';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ragTestSchema = z.object({
	query: z.string().min(1),
	topK: z.number().int().positive().default(5),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validationResult = ragTestSchema.safeParse(body);
		if (!validationResult.success) {
			const flattened = validationResult.error.flatten();
			return NextResponse.json(
				{ error: flattened },
				{ status: 400 },
			);
		}
		const { query, topK } = validationResult.data;

		const results = await searchDocuments(query, topK);
		const formattedResults = results.map((doc) => ({
			id: doc.id,
			score: doc.score,
			// Check both field names - 'text' is standard, 'content' is legacy
			content: doc.metadata?.text ?? doc.metadata?.content ?? '',
			source: doc.metadata?.source || 'unknown',
			chunkIndex: doc.metadata?.chunkIndex,
			totalChunks: doc.metadata?.totalChunks,
		}));

		return NextResponse.json({
			query,
			resultsCount: formattedResults.length,
			results: formattedResults,
		});
	} catch (error) {
		console.error('Search error: ', error);
		return NextResponse.json(
			{ 
				error: 'Failed to find search documents',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}