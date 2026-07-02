import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {

    try {

        const history = req.body.messages || [];

        const response = await openai.chat.completions.create({

            model: "gpt-4o-mini",

            messages: history,

            temperature: 0.7

        });

        res.json({

            reply: response.choices[0].message.content

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            error: err.message

        });

    }

});

app.listen(process.env.PORT || 7000, () => {

    console.log("===================================")
    console.log("Floating AI Chat")
    console.log("Server Running")
    console.log("http://localhost:7000")
    console.log("===================================")

});
