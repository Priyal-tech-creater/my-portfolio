
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Only POST requests are allowed."
        });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "Chatbot is not configured yet."
        });
    }

    const { message } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            error: "Please enter a question."
        });
    }

    if (message.length > 1000) {
        return res.status(400).json({
            error: "Please keep your question under 1000 characters."
        });
    }

    try {
        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    instructions: "You are a friendly portfolio assistant for a BTech CSE student specializing in AI and Machine Learning. Skills include Python, HTML, CSS, NumPy, pandas, and scikit-learn basics. Projects include House Price Prediction and Email Spam Classification using TF-IDF and Naive Bayes. Answer concisely and never invent missing details.",
                    input: message,
                    max_output_tokens: 250
                })
            }
        );

        if (!response.ok) {
            console.error("OpenAI API status:", response.status);
            return res.status(502).json({
                error: "AI service unavailable. Check your API key and API account."
            });
        }

        const data = await response.json();

        return res.status(200).json({
            reply: data.output_text ||
                "Sorry, I couldn't generate a reply."
        });
    } catch (error) {
        console.error("Chatbot error:", error.message);
        return res.status(500).json({
            error: "Connection error. Please try again."
        });
    }
}
