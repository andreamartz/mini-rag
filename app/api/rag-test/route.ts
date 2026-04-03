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
		const { query, topK } = ragTestSchema.parse(body);

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
		if (error instanceof z.ZodError) {
			console.error('Error: Invalid request body: ', error.issues);
			const errors = error.issues.map((issue) => {
				const field = issue.path.length ? issue.path.join('.') : 'body';
				return `${field}: ${issue.message}`;
			});
			return NextResponse.json(
				{ error: 'Invalid request body', errors, details: error.issues },
				{ status: 400 }
			);
		}
		console.error('Error finding similar documents: ', error);
		return NextResponse.json(
			{ 
				error: 'Failed to find search documents',
				details: error instanceof Error ? error.message : 'Unknown error',
			 },
			{ status: 500 }
		);
	}
}





// export async function POST(request: NextRequest) {
// 	try {
// 		const body = await request.json();
// 		const { query, topK } = ragTestSchema.parse(body);

// 		const results = await searchDocuments(query, topK);

// 		const formattedResults = results.map((doc) => ({
// 			id: doc.id,
// 			score: doc.score,
// 			// Check both field names - 'text' is standard, 'content' is legacy
// 			content: doc.metadata?.text ?? doc.metadata?.content ?? '',
// 			source: doc.metadata?.source || 'unknown',
// 			chunkIndex: doc.metadata?.chunkIndex,
// 			totalChunks: doc.metadata?.totalChunks,
// 		}));

// 		return NextResponse.json({
// 			query,
// 			resultsCount: formattedResults.length,
// 			results: formattedResults,
// 		});
// 	} catch (error) {
// 		if (error instanceof z.ZodError) {
// 			console.error('Error: Invalid request body: ', error.issues);
// 			return NextResponse.json(
// 				{ error: 'Invalid request body', details: error.issues },
// 				{ status: 400 }
// 			);
// 		}
// 		console.error('Error finding similar documents: ', error);
// 		return NextResponse.json(
// 			{ 
// 				error: 'Failed to find search documents',
// 				details: error instanceof Error ? error.message : 'Unknown error',
// 			 },
// 			{ status: 500 }
// 		);
// 	}
// }