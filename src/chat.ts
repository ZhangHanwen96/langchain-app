import {DataSource} from 'typeorm'
import { ChatOpenAI } from "langchain/chat_models";
import {
    ChatAgent,
    createVectorStoreAgent,
    initializeAgentExecutor,
    ChatConversationalAgent,

} from "langchain/agents";
import {
    RequestsGetTool,
    RequestsPostTool,
    AIPluginTool,
    ChainTool,
    Calculator,
    DynamicTool,
} from "langchain/tools";
import { SqlDatabase } from "langchain/sql_db";
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
import { ChatVectorDBQAChain, ConversationChain, LLMChain, SqlDatabaseChain, VectorDBQAChain } from "langchain/chains";
import { OpenAI } from "langchain";
import { CallbackManager } from "langchain/callbacks";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { BufferMemory } from 'langchain/dist/memory';

const cwd = process.cwd();


// const datasource = new DataSource({
//   type: "sqlite",
//   database: "Chinook.db",
// });






export const getAgent = async () => {
    // const db = await SqlDatabase.fromDataSourceParams({
    //   appDataSource: datasource,
    // });

    const model = new OpenAI({
        temperature: 0.7,
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
    const chain = VectorDBQAChain.fromLLM(model, vectorStore);

    // const dbChain = new SqlDatabaseChain({
    //   llm: new OpenAI({ temperature: 0.7 }),
    //   database: db,
    // });

    const qaTool = new ChainTool({
        name: "kownledge-about-hanwen",
        description:
            "Personal information about Hanwen, including his age, and location and some conversations between he and his friend.",
        chain: chain,
    });

    // const dbTool = new ChainTool({
    //   name: 'db-tool',
    //   description: 'This tool uses Chinook database, which is a sample database available for SQL Server, Oracle, MySQL. This tool contains infomation regarding the Chinook database. Do not use this tool unless I specifically mention about Chinook database.',
    //   chain: dbChain,
    // })

    createVectorStoreAgent;

    const tools = [
        new Calculator(),
        qaTool,
        // dbTool,
        // new RequestsGetTool(),
        // new RequestsPostTool(),
        // await AIPluginTool.fromPluginUrl(
        //     "https://www.klarna.com/.well-known/ai-plugin.json"
        // ),
        new DynamicTool({
          name: 'get-weather-info',
          description: 'Use this tool to get latest weather info from openweather',
          // @ts-ignore
          func() {
            return 'today is a sunny day, and the temperature is 30 degrees'
          },
        }),

    ];



    const executor = await initializeAgentExecutor(
        tools,
        model,
        "zero-shot-react-description"
    );

    return executor;
};
