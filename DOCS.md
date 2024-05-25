Future plans:

    a. Problem: the current way of storing chats for context isn't efficient for memory/space in the database
    a. Solution: use vector database to store chat messages then use vector search to find the K nearest neighbours of the 
                input vector and then use the K neighbours found as the context for the model 
                Note: Could also provide better LLM outputs then your current summary method 

    b. Problem: API keys are exposed
    b. Solution: Use env file