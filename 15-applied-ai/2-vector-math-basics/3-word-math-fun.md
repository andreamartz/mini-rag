# Word Math: Vectors in Action

Let's have some fun and really drive home that words are just vectors!

---

## Video Walkthrough

Watch this fun exploration of word arithmetic:

<iframe src="https://share.descript.com/embed/gz3NfK2kCMl" width="640" height="360" frameborder="0" allowfullscreen></iframe>

---

## The Magic of Word Arithmetic

Remember: embeddings place similar words close together in vector space. This means we can do **math with words**!

---

## The Classic Example

```
king - man + woman ≈ queen
```

**Why it works:**

```
"king" embedding contains:
  - Royalty concept
  - Male concept
  - Power concept

Subtract "man":
  - Removes male concept

Add "woman":
  - Adds female concept

Result:
  - Royalty + Female ≈ "queen"!
```

---

## Exercise: Try Word Math

### Setup

The exercise is already set up for you at: `app/scripts/exercises/vector-word-arithmetic.ts`

```typescript
import { openaiClient } from '../libs/openai/openai';

async function getEmbedding(text: string): Promise<number[]> {
	const response = await openaiClient.embeddings.create({
		model: 'text-embedding-3-small',
		input: text,
	});
	return response.data[0].embedding;
}

function addVectors(a: number[], b: number[]): number[] {
	return a.map((val, i) => val + b[i]);
}

function subtractVectors(a: number[], b: number[]): number[] {
	return a.map((val, i) => val - b[i]);
}

async function findClosestWord(
	targetVector: number[],
	candidateWords: string[]
): Promise<{ word: string; similarity: number }> {
	// Get embeddings for all candidates
	const candidateEmbeddings = await Promise.all(
		candidateWords.map(async (word) => ({
			word,
			embedding: await getEmbedding(word),
		}))
	);

	// Find most similar
	let best = { word: '', similarity: -1 };
	for (const candidate of candidateEmbeddings) {
		const sim = cosineSimilarity(targetVector, candidate.embedding);
		if (sim > best.similarity) {
			best = { word: candidate.word, similarity: sim };
		}
	}

	return best;
}
```

### Try These Equations

```typescript
async function wordMathExamples() {
	// Example 1: king - man + woman ≈ queen
	console.log('\n🔮 Example 1: king - man + woman');
	const king = await getEmbedding('king');
	const man = await getEmbedding('man');
	const woman = await getEmbedding('woman');

	const result1 = addVectors(subtractVectors(king, man), woman);

	const answer1 = await findClosestWord(result1, [
		'queen',
		'princess',
		'prince',
		'duke',
		'emperor',
	]);

	console.log(`Answer: ${answer1.word} (${answer1.similarity.toFixed(3)})`);
	// Expected: queen

	// Example 2: Paris - France + Italy ≈ Rome
	console.log('\n🔮 Example 2: Paris - France + Italy');
	const paris = await getEmbedding('Paris');
	const france = await getEmbedding('France');
	const italy = await getEmbedding('Italy');

	const result2 = addVectors(subtractVectors(paris, france), italy);

	const answer2 = await findClosestWord(result2, [
		'Rome',
		'Milan',
		'Venice',
		'Florence',
		'Naples',
	]);

	console.log(`Answer: ${answer2.word} (${answer2.similarity.toFixed(3)})`);
	// Expected: Rome

	// Example 3: walking - walk + swim ≈ swimming
	console.log('\n🔮 Example 3: walking - walk + swim');
	const walking = await getEmbedding('walking');
	const walk = await getEmbedding('walk');
	const swim = await getEmbedding('swim');

	const result3 = addVectors(subtractVectors(walking, walk), swim);

	const answer3 = await findClosestWord(result3, [
		'swimming',
		'swam',
		'swimmer',
		'swims',
		'diving',
	]);

	console.log(`Answer: ${answer3.word} (${answer3.similarity.toFixed(3)})`);
	// Expected: swimming
}

// Run it!
wordMathExamples();
```

### Run the Exercise

```bash
yarn exercise:word-math
```

This runs the complete script at `app/scripts/exercises/vector-word-arithmetic.ts`

**Expected output:**

```
🔮 Example 1: king - man + woman
Answer: queen (0.892)

🔮 Example 2: Paris - France + Italy
Answer: Rome (0.847)

🔮 Example 3: walking - walk + swim
Answer: swimming (0.923)
```

---

## Create Your Own Equations

Try these patterns:

### Country → Capital

```typescript
// Tokyo - Japan + Germany ≈ ?
// Berlin!
```

### Adjective → Noun

```typescript
// biggest - big + small ≈ ?
// smallest!
```

### Verb Tenses

```typescript
// running - run + eat ≈ ?
// eating!
```

### Company → Product

```typescript
// iPhone - Apple + Microsoft ≈ ?
// Windows? Surface?
```

---

## What This Proves

**Words are truly just vectors!**

-   Semantics encoded as numbers
-   Relationships preserved in space
-   Math operations make sense
-   Similar meanings = similar vectors

This is why RAG works:

1. User query → vector
2. Documents → vectors
3. Find closest vectors
4. Return matching documents

The math handles the "understanding"!

---

## Challenge: Build Your Own

Create 3 word equations and test them:

```typescript
async function myEquations() {
	// Your equation 1:
	// ...
	// Your equation 2:
	// ...
	// Your equation 3:
	// ...
}
```

**Ideas:**

-   Plurals: dog - dogs + cat ≈ ?
-   Opposites: hot - cold + loud ≈ ?
-   Professions: doctor - hospital + school ≈ ?

---

## Why This Matters for RAG

Understanding word math helps you understand RAG:

**When user asks:** "How do I use React hooks?"

**The system:**

1. Converts query to vector
2. That vector is "near" vectors for:
    - "React useState tutorial"
    - "Understanding React hooks"
    - "Hooks in React"
3. But "far" from:
    - "Python data science"
    - "CSS styling tips"

**Result:** Relevant documents retrieved!

---

## 📝 Homework Assignment: Explain the Dot Product

**Assignment:** Record a ~5 minute video explaining the dot product to someone interested in learning about LLMs but without a math background.

**Requirements:**

1. **Explain what the dot product is:**
   - What it calculates (sum of element-wise products)
   - Simple visual or analogy (e.g., "measuring alignment")
   - Quick example with small vectors

2. **Why it matters for RAG:**
   - How it's used in cosine similarity
   - Why similarity matters for finding relevant documents
   - Connection to embeddings

3. **Use an analogy:**
   - Make it relatable (e.g., "like comparing shopping lists")
   - Avoid heavy math notation
   - Focus on intuition

**Tips:**
- Use visuals if possible (diagrams, slides, whiteboard)
- Test your explanation on someone non-technical
- Keep it conversational and engaging
- Assume your audience is smart but not math-trained

**What to Submit:**
- Video link (YouTube/Loom/Google Drive)
- Around 5 minutes

**Submit Link:** *[Submission form will be provided]*

**Due:** Before Module 4

**Why This Matters:** Being able to explain technical concepts simply is a critical skill. Understanding dot products deeply will help you debug and improve RAG systems.

---

## What's Next

You now understand the math! Time to build the actual Pinecone integration.
