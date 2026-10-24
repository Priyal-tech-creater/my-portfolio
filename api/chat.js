
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Only POST requests are allowed."
        });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "Gemini API key is missing in Vercel."
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
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": apiKey
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{
                            text: `You are a friendly chatbot for a student's portfolio.
The student studies BTech Computer Science Engineering with an AI and Machine Learning specialization.
Skills: Python, HTML, CSS, NumPy, pandas, and scikit-learn basics.
Projects: House Price Prediction and Email Spam Classification using TF-IDF and Naive Bayes.
Answer in simple, friendly language. Keep replies concise.
Never invent experience, results, links, or contact details.
If information is missing, say it is not listed in the portfolio.`
                        }]
                    },
                    contents: [{
                        parts: [{ text: message.trim() }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 250
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", response.status, data);
            return res.status(502).json({
                error: "Gemini could not answer. Check your API key, model access, and usage limits."
            });
        }

        const reply = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        return res.status(200).json({
            reply: reply || "Sorry, I couldn't generate a reply. Please try again."
        });
    } catch (error) {
        console.error("Gemini connection error:", error.message);
        return res.status(500).json({
            error: "Connection error. Please try again."
        });
    }
}

