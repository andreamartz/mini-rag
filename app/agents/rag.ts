import { AgentRequest, AgentResponse } from './types';
import { pineconeClient } from '@/app/libs/pinecone';
import { openaiClient } from '@/app/libs/openai/openai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function ragAgent(request: AgentRequest): Promise<AgentResponse> {
	// TODO: Implement the RAG agent
	//
	// Follow Module 9.1 in the curriculum to implement the 5-step RAG pipeline:
	//   1. Generate embedding for the query
	//   2. Query Pinecone for similar documents
	//   3. Extract text from results
	//   4. Build system prompt with context
	//   5. Stream the response
	//
	// Then follow Module 9.2 to add reranking for better retrieval quality.

	throw new Error('RAG agent not implemented yet!');
}
