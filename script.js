
const themeButton = document.getElementById("themeToggle");

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeButton.textContent = "Switch to Light Mode";
    } else {
        themeButton.textContent = "Switch to Dark Mode";
    }
});

const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatSend = document.getElementById("chatSend");

function addChatMessage(message, className) {
    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = message;
    chatMessages.appendChild(paragraph);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    addChatMessage(message, "user-message");
    chatInput.value = "";
    chatSend.disabled = true;
    chatSend.textContent = "Sending...";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "The request failed."
            );
        }

        addChatMessage(data.reply, "bot-message");

    } catch (error) {
        addChatMessage(
            error.message ||
            "Sorry, the chatbot is unavailable. Please try again.",
            "bot-message"
        );
    } finally {
        chatSend.disabled = false;
        chatSend.textContent = "Send";
        chatInput.focus();
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("weatherBtn");
    const input = document.getElementById("weatherCity");
    const result = document.getElementById("weatherResult");

    if (!button || !input || !result) {
        console.error("Weather elements not found");
        return;
    }

    button.addEventListener("click", async () => {
        const city = input.value.trim();

        if (!city) {
            result.textContent = "Please enter a city name.";
            return;
        }

        result.textContent = "Loading weather...";

        try {
            const response = await fetch(
                `https://wttr.in/${encodeURIComponent(city)}?format=j1`
            );

            if (!response.ok) throw new Error("Weather request failed");

            const data = await response.json();
            const current = data.current_condition[0];

            result.textContent =
                `${city}: ${current.temp_C}°C, ` +
                `${current.weatherDesc[0].value}. ` +
                `Feels like ${current.FeelsLikeC}°C. ` +
                `Humidity: ${current.humidity}%.`;
        } catch (error) {
            console.error("Weather error:", error);
            result.textContent = "Unable to load weather. Please try again.";
        }
    });
});


