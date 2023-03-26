import { ChatOpenAI } from "langchain/chat_models";
import {
    ChatAgent,
    createVectorStoreAgent,
    initializeAgentExecutor,
} from "langchain/agents";
import {
    RequestsGetTool,
    RequestsPostTool,
    AIPluginTool,
    ChainTool,
    Calculator,
    DynamicTool,
} from "langchain/tools";
import { HNSWLib } from "langchain/vectorstores";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { OpenAIEmbeddings } from "langchain/embeddings";

import {
    GithubRepoLoader,
    TextLoader,
    UnstructuredLoader,
} from "langchain/document_loaders";
import { ChatVectorDBQAChain, LLMChain } from "langchain/chains";
import { OpenAI } from "langchain";
import { CallbackManager } from "langchain/callbacks";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";

const cwd = process.cwd();

export const getAgent = async () => {
    const model = new ChatOpenAI({
        temperature: 0.7,
        streaming: true,
        callbackManager: CallbackManager.fromHandlers({
            // @ts-ignore
            // handleLLMNewToken(token) {
            //   console.log(token);
            // },
            // // @ts-ignore
            // handleLLMEnd(output, verbose) {
            //   console.log(output);
            // },
            // // @ts-ignore
            // handleLLMError(error) {
            // }
        }),
        concurrency: 10,
        modelName: "gpt-3.5-turbo-0301",
    });

    const vectorStore = await HNSWLib.fromTexts(
        [
            `Following is personal information about Hanwen.
      age: 28
      country: China
      
      
      Following is a conversation between Hanwen and his friend.
      
      Q: hi hanwen, what do you like to do in weekends?
      Hanwen: I like to go hiking.`,
        ],
        [{ id: 1 }],
        new OpenAIEmbeddings()
    );

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
            "You are a helpful assistant that translates {input_language} to {output_language}."
        ),
        HumanMessagePromptTemplate.fromTemplate("{text}"),
    ]);

    // await vectorStore.save(path.join(path.dirname(fileURLToPath(import.meta.url)), "../data", "hnswlib"));
    const chain = ChatVectorDBQAChain.fromLLM(model, vectorStore);

    const qaTool = new ChainTool({
        name: "kownledge-about-hanwen",
        description:
            "Personal information about Hanwen, including his age, and location and some conversations between he and his friend.",
        chain: chain,
    });

    createVectorStoreAgent;

    const tools = [
        new Calculator(),
        qaTool,
        new RequestsGetTool(),
        new RequestsPostTool(),
        await AIPluginTool.fromPluginUrl(
            "https://www.klarna.com/.well-known/ai-plugin.json"
        ),
        new DynamicTool({
          name: 'get-weather-info',
          description: 'Get weather info from openweather',
          // @ts-ignore
          func() {
            return 'today is a sunny day, and the temperature is 30 degrees'
          },
        })
    ];

    const executor = await initializeAgentExecutor(
        tools,
        model,
        "chat-zero-shot-react-description"
    );

    return executor;
};
