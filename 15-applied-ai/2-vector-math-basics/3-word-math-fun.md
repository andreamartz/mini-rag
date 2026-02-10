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

**Important:** The `≈` symbol means "approximately equals" because we don't get the exact "queen" vector. Instead, we get a new vector that's *closest* to "queen" in vector space!

**How it works:**

```
"king" embedding contains:
  - Royalty concept      (+5 in some dimension)
  - Male concept         (+8 in another dimension)
  - Power concept        (+6 in another dimension)

Subtract "man":
  - Removes male concept (-8 in that dimension)

Add "woman":
  - Adds female concept  (+8 in the female dimension)

Result vector:
  - Royalty + Female + Power
  - This vector doesn't match ANY word exactly
  - But it's CLOSEST to "queen" in 512-dimensional space!
```

**Visualizing it in 2D (simplified):**

```
                queen •
                     /
                    / ← Our result lands near here
                   /
      king •      / • result
           \     /
            \   /
             \ /
         man • ----- • woman

After math: result is closest to "queen"!
```

**What actually happens:**

1. Do the math: `king - man + woman = [0.23, -0.41, 0.67, ...]`
2. This gives us a **new** vector (doesn't match any real word exactly)
3. We compare this result to candidate words
4. "queen" has the highest similarity score → That's our answer!

**Think of it like GPS:**
- You calculate a point in space
- Then find which real city is closest to that point
- The math doesn't create "queen" - it finds the nearest word to where we landed

---

## Exercise: Try Word Math

### Understanding Vector Addition and Subtraction

Before jumping into the code, let's understand what adding and subtracting vectors means:

**Adding vectors** = combining their directions and magnitudes:

```typescript
function addVectors(a: number[], b: number[]): number[] {
	return a.map((val, i) => val + b[i]);
}

// Example:
const v1 = [1, 2, 3];
const v2 = [4, 5, 6];
addVectors(v1, v2);  // [1+4, 2+5, 3+6] = [5, 7, 9]
```

**Geometrically:** Place vectors tip-to-tail:
```
    v1      v1 + v2
     \        ↗
      \      /
       \    /
        v2
```

**Subtracting vectors** = removing one direction from another:

```typescript
function subtractVectors(a: number[], b: number[]): number[] {
	return a.map((val, i) => val - b[i]);
}

// Example:
const v1 = [5, 7, 9];
const v2 = [1, 2, 3];
subtractVectors(v1, v2);  // [5-1, 7-2, 9-3] = [4, 5, 6]
```

**With word embeddings:**
- Adding = "combine these concepts"
- Subtracting = "remove this concept"

```
king [0.8, 0.3, 0.9, ...]  (royalty + male + power)
 - man [0.2, 0.9, 0.1, ...]  (remove male concept)
 = [0.6, -0.6, 0.8, ...]  (royalty + power, but less male)
```

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

**But remember:** The results are *approximate*, not exact!

```typescript
king - man + woman = [0.23, -0.41, 0.67, 0.82, ...]
                      ↑ This is a NEW vector

// We then find which word is closest:
cosineSimilarity(result, queenEmbedding)    // 0.89 ✅ Highest!
cosineSimilarity(result, princessEmbedding) // 0.76
cosineSimilarity(result, princeEmbedding)   // 0.62
cosineSimilarity(result, kingEmbedding)     // 0.54

// "queen" wins because it's nearest to our calculated vector
```

**Why it's not perfect:**
- Language is complex and context-dependent
- Embeddings capture *general* semantic relationships
- "king - man + woman" creates a vector in the *general region* of "queen"
- We're finding the **nearest neighbor**, not an exact match

**Real similarity scores you'll see:**
- `0.85-0.95`: Great match (like king→queen)
- `0.75-0.84`: Good match
- `0.60-0.74`: Decent match
- `< 0.60`: Weak match

This is why RAG works:

1. User query → vector
2. Documents → vectors
3. Find closest vectors (using cosine similarity)
4. Return matching documents

**The math handles the "understanding"!** Even though matches aren't perfect, they're good enough to find relevant information.

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

**Submit Your Work:**
- **[Video Submission - Week 1](https://tally.so/form/NdVcsThQ/create)**
- **[Code Submission - Week 1](https://tally.so/form/A0pGKPqU/create)** (submit your word math experiments)

**Due:** Before Module 4

**Why This Matters:** Being able to explain technical concepts simply is a critical skill. Understanding dot products deeply will help you debug and improve RAG systems.

---

## What's Next

You now understand the math! Time to build the actual Pinecone integration.
