## Capstone Extension: Multi-Source RAG System

Extend the existing RAG project by adding **one additional data source**, indexed separately and handled by a **new agent**.

---

## Requirements

### Data

-   Add **one new data source** of your choice  
    (articles, blog posts, docs, repos, posts, etc.)
-   Create a **new vector index** for this data
-   Data must be:
    -   Public
    -   Properly chunked
    -   Embedded and uploaded successfully

---

### Agents

-   Add **one new agent** responsible for the new data source
-   Update routing so the correct agent is selected
-   The new agent must:
    -   Query the new index
    -   Return grounded, relevant responses

---

### Testing

-   Add tests that verify:
    -   The new agent is selected correctly
    -   Retrieval works for the new data source
    -   Existing functionality is not broken

---

### Documentation

Your `README.md` must explain:

-   What data you added and how you collected it
-   How the new index is structured
-   What the new agent does
-   How routing works at a high level

---

### Presentation

Record a **short video (≈ 3–5 minutes)** showing:

1. The original system
2. The new data source
3. The new agent in action
4. Example queries that hit the new index

---

## Bonus Challenges (Optional)

Want to go beyond the requirements? Here are some advanced options:

### Option A: Use an Agent Framework

Refactor your implementation using an agent framework:

**LangGraph** (Recommended)

-   Implement your agent system as a state graph
-   Use built-in tools and persistence
-   See Module 14 for LangGraph examples
-   [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)

**Other Frameworks:**

-   [CrewAI](https://github.com/joaomdmoura/crewAI) - Role-based agent orchestration
-   [AutoGen](https://microsoft.github.io/autogen/) - Multi-agent conversations
-   [LlamaIndex](https://www.llamaindex.ai/) - Data framework with agent support

**What to show:**

-   Clear explanation of why you chose the framework
-   How it improved your architecture
-   What trade-offs you encountered

---

### Option B: Build Your Own App from Scratch

Create a completely new RAG application with a unique use case:

**💡 Project Ideas:**

**1. YouTube Wisdom Extractor**

-   Scrape transcripts from famous YouTubers (use `youtube-transcript-api` Python library)
-   Create a RAG agent that gives advice in their style
-   Examples: Business advice (Gary Vee), Tech tutorials (Fireship), Life advice (Jordan Peterson)
-   **Agent idea:** Query by topic and get responses citing specific videos

**2. Lyrics Writing Assistant**

-   Scrape lyrics from popular artists (use Genius API or web scraping)
-   Build a RAG agent that writes lyrics in specific artist styles
-   Index by genre, artist, era, or theme
-   **Agent idea:** "Write a chorus in the style of Taylor Swift about heartbreak"

**3. Gmail Response Drafter**

-   Use Gmail API to access your emails
-   Build a RAG agent that drafts contextual responses
-   Index past emails to learn your communication style
-   **Agent idea:** "Draft a professional response to meeting requests" or "Reply to customer support emails"

**4. Personal Knowledge Base**

-   Aggregate your notes, bookmarks, saved articles
-   Build a unified search across all your knowledge
-   **Agent idea:** Different agents for different content types (technical docs, personal notes, saved articles)

**5. Recipe Remix Agent**

-   Scrape recipes from cooking sites
-   Create agents that suggest substitutions or fusion recipes
-   **Agent idea:** "Make this recipe vegan" or "Combine Italian and Indian cuisine"

**What to show:**

-   Clear problem statement and user persona
-   How your RAG system solves a real need
-   Data collection strategy and ethics considerations
-   Demo with real-world usage

---

**Bonus Points Awarded For:**

-   Novel data source or creative use case
-   Production-ready features (error handling, rate limiting, caching)
-   Thoughtful data privacy/ethics considerations
-   Performance optimizations (caching, batch processing, etc.)
-   Creative agent interactions or multi-agent collaboration

---

## Submission

**Submit Your Final Project:**
- **[Video Submission - Week 5](https://tally.so/form/SF6b6edL/create)**
- **[Code Submission - Week 5](https://tally.so/form/TXjlfrlr/create)**

**What to Include:**
-   Deployed URL
-   GitHub repository
-   Video link (3-5 minutes)
-   (Optional) Bonus challenge description

---

## Evaluation Criteria

-   Correct use of embeddings and chunking
-   Clear separation of indexes and agents
-   Clean, readable code
-   Clear explanation of design decisions
