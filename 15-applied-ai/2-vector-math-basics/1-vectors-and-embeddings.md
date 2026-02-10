# Vectors and Embeddings: Words to Numbers

Understanding vectors is crucial for RAG systems. Don't worry - we'll keep it practical and visual!

---

## Video Walkthrough

Watch these introductions to vectors and embeddings:

**Vectors and Embeddings Explained:**

<iframe src="https://share.descript.com/embed/zz3e0kMLiO6" width="640" height="360" frameborder="0" allowfullscreen></iframe>

---

## What You'll Learn

-   What vectors are and why they matter
-   How text becomes numbers (embeddings)
-   Why cosine similarity works
-   Basic vector operations

---

## Why Vector Math for RAG?

RAG systems need to find similar content. To do that:

```
Text → Vectors → Measure Similarity → Find Matches
```

The math makes similarity measurable!

---

## What is a Vector?

A vector is just a list of numbers:

```typescript
// 2D vector (x, y coordinates)
const vector2D = [3, 4];

// 3D vector (x, y, z)
const vector3D = [1, 2, 3];

// Text embedding (512 dimensions!)
const embedding = [0.1, -0.3, 0.8, 0.2, ...];
```

**Think of it as:** A point in space, or a direction from the origin.

---

## From Text to Vectors

### How Embeddings Work

```
"artificial intelligence"
        ↓
Embedding Model
        ↓
[0.1, -0.3, 0.8, ..., 0.2]  (512 numbers)
```

**The magic:** Similar concepts → similar vectors

```typescript
"dog"   → [0.1, 0.5, -0.2, ...]
"puppy" → [0.2, 0.4, -0.1, ...]  // Close to "dog"!
"car"   → [-0.3, 0.1, 0.8, ...]  // Far from "dog"
```

### Using OpenAI's Embedding API

```typescript
const response = await openai.embeddings.create({
	model: 'text-embedding-3-small',
	input: 'artificial intelligence',
});

const embedding = response.data[0].embedding;
// [0.1, -0.3, 0.8, ..., 0.2] (512 numbers)
```

---

## Measuring Similarity

### The Dot Product

The dot product is our first tool for measuring similarity. Here's what it does:

**Take two vectors and multiply matching positions, then add everything up:**

```typescript
function dotProduct(a: number[], b: number[]): number {
	return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

const v1 = [1, 2, 3];
const v2 = [4, 5, 6];
dotProduct(v1, v2); // (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32
```

**Let's break down that calculation:**

| Position | v1 value | v2 value | Multiply |
|----------|----------|----------|----------|
| 0        | 1        | 4        | 1 × 4 = 4 |
| 1        | 2        | 5        | 2 × 5 = 10 |
| 2        | 3        | 6        | 3 × 6 = 18 |
| **Sum**  |          |          | **32** |

**Why does this measure similarity?**

Think of it like comparing two opinions on a scale:
- If both vectors have big positive numbers in the same positions → big positive result (similar!)
- If both have big negative numbers in the same positions → big positive result (also similar!)
- If one has positive and one has negative → negative result (opposite!)
- If the numbers don't line up → small result (unrelated)

**Example with meaning:**

```typescript
// Vector representing "technical programming content"
const technical = [5, 1, 0];  // [technical, casual, food]

// Similar document
const coding = [4, 2, 0];     // Also technical!
dotProduct(technical, coding) // 5×4 + 1×2 + 0×0 = 22 ✅ High!

// Different document
const recipes = [1, 3, 5];    // About food
dotProduct(technical, recipes) // 5×1 + 1×3 + 0×5 = 8 ❌ Low
```

**Interpretation:**

-   Higher value = more similar (vectors point in same direction)
-   Zero = unrelated (vectors are perpendicular)
-   Negative = opposite (vectors point in opposite directions)

### Cosine Similarity (The Standard)

**Problem with dot product alone:** Vector length affects the result!

```typescript
const short = [1, 2];    // Short vector
const long = [10, 20];   // Long vector (same direction!)

dotProduct(short, short); // 1×1 + 2×2 = 5
dotProduct(long, long);   // 10×10 + 20×20 = 500

// Same direction, but VERY different scores! 😕
```

**Solution:** Normalize by dividing by the vectors' lengths (magnitudes).

**First, calculate magnitude (length):**

```typescript
function magnitude(v: number[]): number {
	return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}

// Example: What's the length of [3, 4]?
magnitude([3, 4]);
// √(3² + 4²) = √(9 + 16) = √25 = 5
```

**This is the Pythagorean theorem!**

```
    |
  4 |    /
    |   / length = 5
    |  /
    |_/___
      3
```

**Now, cosine similarity:**

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
	const dot = dotProduct(a, b);
	const magA = magnitude(a);
	const magB = magnitude(b);

	return dot / (magA * magB);
}
```

**What does this do?**

Dividing by the magnitudes "normalizes" the result to always be between -1 and 1, regardless of vector length.

**Example with our short/long vectors:**

```typescript
const short = [1, 2];
const long = [10, 20];  // 10× bigger, same direction

cosineSimilarity(short, long);
// dot = 1×10 + 2×20 = 50
// magnitude(short) = √5 ≈ 2.236
// magnitude(long) = √500 ≈ 22.361
// 50 / (2.236 × 22.361) = 1.0 ✅ Perfect match!
```

**Now the result focuses on DIRECTION, not length!**

**Scale:**

-   `1.0` = Identical direction (perfectly similar)
-   `0.0` = Unrelated (perpendicular - 90° angle)
-   `-1.0` = Opposite direction (completely opposite)
-   `0.8-0.99` = Very similar (small angle)
-   `0.5-0.79` = Somewhat similar (medium angle)

---

## Visual Intuition

```
     Vector A
        /
       /
      /_____ Vector B

Small angle = High similarity
Large angle = Low similarity
```

Cosine similarity measures the angle between vectors:

-   Same direction → angle 0° → similarity = 1
-   Perpendicular → angle 90° → similarity = 0
-   Opposite → angle 180° → similarity = -1

---

## Why 512 Dimensions?

Embeddings have many dimensions (512, 1536, 3072). Why so many?

**Think of dimensions as "features" or "traits":**

Imagine describing a person with just 3 numbers:
```typescript
const person = [height, age, weight];  // 3 dimensions - not much info!
```

Now imagine 512 numbers describing them:
```typescript
const person = [
  height, weight, age, hairColor, eyeColor,
  likesMusic, lovesPizza, speaksSpanish,
  enjoysHiking, hasChildren, worksInTech,
  ... 501 more traits
];  // 512 dimensions - MUCH richer picture!
```

**Same with text embeddings:**

-   **Dim 0:** "How technical is this?"
-   **Dim 1:** "How positive/negative?"
-   **Dim 2:** "Related to technology?"
-   **Dim 3:** "Is this about people?"
-   **Dim 4:** "Past tense or future tense?"
-   **Dim 5:** "Formal or casual tone?"
-   ... **507 more semantic features!**

**Example:**
```typescript
// "The cat sat on the mat"
[0.1, 0.8, 0.0, 0.9, 0.1, ...]
// ↑    ↑    ↑    ↑    ↑
// not  very not  about casual
// tech happy tech living tone
//            beings

// "Machine learning algorithms optimize neural networks"
[0.9, 0.3, 0.9, 0.1, 0.6, ...]
// ↑    ↑    ↑    ↑    ↑
// very neutral tech not  formal
// tech         about tone
//              living
//              beings
```

**The tradeoff:**

-   **512 dimensions:** Fast, good quality ← Most common
-   **1536 dimensions:** Better quality, slower, more expensive
-   **3072 dimensions:** Best quality, slowest, priciest

It's a balance:

-   More dimensions = richer meaning, better matching
-   Fewer dimensions = faster computation, lower cost

---

## Finding Similar Documents

```typescript
// Documents
const docs = [
	'Python is a programming language',
	'JavaScript is for web development',
	'Machine learning uses algorithms',
	'Dogs are loyal pets',
];

// Get embeddings for all
const docEmbeddings = await Promise.all(docs.map((doc) => getEmbedding(doc)));

// Query
const query = 'What programming languages exist?';
const queryEmbedding = await getEmbedding(query);

// Calculate similarities
const similarities = docEmbeddings.map((docEmbed) =>
	cosineSimilarity(queryEmbedding, docEmbed)
);

// Results: [0.8, 0.7, 0.3, 0.1]
// "Python is a programming language" wins!
```

---

## Essential Watching

For beautiful visual explanations:

**3Blue1Brown's Linear Algebra Series:**

1. [Vectors, what even are they?](https://www.youtube.com/watch?v=fNk_zzaMoSs)
2. [Dot products and duality](https://www.youtube.com/watch?v=LyGKycYT2v0)

These videos make the concepts crystal clear!

---

## Quick Quiz

Which pairs would have high cosine similarity?

1. "I love pizza" vs "Pizza is delicious"
2. "Machine learning algorithms" vs "AI and neural networks"
3. "The weather is sunny" vs "Database optimization"

<details>
<summary>Answers</summary>

1. ✅ **High** - Both about pizza, positive sentiment
2. ✅ **High** - Both about AI/ML concepts
3. ❌ **Low** - Completely different topics

</details>

---

## What You Learned

✅ Vectors are lists of numbers
✅ Embeddings convert text to vectors
✅ Similar text → similar vectors
✅ Cosine similarity measures angle between vectors
✅ This is how RAG finds relevant documents

---

## 📝 Homework Assignment: Explain Dot Products for LLMs

**Assignment:** Create a short video (3-5 minutes) or written explanation answering:

**"Explain the dot product to a non-math person who is interested in LLMs and why the dot product matters to LLMs."**

**Requirements:**
- Avoid heavy mathematical notation
- Use analogies and visual examples
- Explain why dot products are foundational to embeddings
- Connect it to how LLMs understand similarity
- Include at least one concrete example

**Tips:**
- Think about the 3Blue1Brown video you watched (dot products as projection)
- Use real-world analogies (shopping preferences, recipe similarity, etc.)
- Show how higher dot product = more similar meanings
- Explain why we use cosine similarity (normalized dot product)

**What to Submit:**
- Video link (YouTube/Loom) OR
- Written explanation (500-800 words) with diagrams/examples

**Submit Your Work:**
- **[Video Submission - Week 1](https://tally.so/form/NdVcsThQ/create)**
- **[Code Submission - Week 1](https://tally.so/form/A0pGKPqU/create)** (if you wrote any code examples)

**Due:** Before starting Module 4

**Why This Matters:** Teaching is the best way to learn. If you can explain dot products simply, you deeply understand the foundation of RAG.

---

## What's Next

Now let's implement similarity calculations and do some word math!
