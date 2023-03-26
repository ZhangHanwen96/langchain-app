import { ChatOpenAI } from "langchain/chat_models";
import { initializeAgentExecutor } from "langchain/agents";
import {
    RequestsGetTool,
    RequestsPostTool,
    AIPluginTool,
    ChainTool,
    Calculator,
} from "langchain/tools";
import { HNSWLib } from "langchain/vectorstores";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAIEmbeddings } from "langchain/embeddings";

import {
    GithubRepoLoader,
    TextLoader,
    UnstructuredLoader,
} from "langchain/document_loaders";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAI } from "langchain";

export const getAgent = async () => {
    const model = new OpenAI({ temperature: 0.7 });
    const loader = new TextLoader(
        path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            "../data",
            "chat.txt"
        )
    );
    console.log(path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            "../data",
            "chat.txt"
        ))
    const docs = await loader.load();
    const vectorStore = await HNSWLib.fromDocuments(
       docs,
      new OpenAIEmbeddings()
    );
    // await vectorStore.save(path.join(path.dirname(fileURLToPath(import.meta.url)), "../data", "hnswlib"));
    const chain = VectorDBQAChain.fromLLM(model, vectorStore);

    const qaTool = new ChainTool({
        name: "kownledge-about-hanwen",
        description:
            "Personal information about Hanwen, including his age, and location and some conversations between he and his friend.",
        chain: chain,
    });

    const tools = [new Calculator(), qaTool];

    const executor = await initializeAgentExecutor(
        tools,
        model,
        "zero-shot-react-description"
    );

    return executor;
};
