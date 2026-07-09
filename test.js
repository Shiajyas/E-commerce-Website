const ollama = require("ollama");

(async () => {
    try {

        console.log("Connecting...");

        const client = new ollama.Ollama({
            host: "http://localhost:11434"
        });

        const res = await client.chat({
            model: "llama3.2:3b",
            messages: [
                {
                    role: "user",
                    content: "Hello"
                }
            ]
        });

        console.log(res);

    } catch (err) {
        console.error(err);
    }
})();