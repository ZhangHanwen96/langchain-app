import { ChatOpenAI } from "langchain/chat_models";
import { initializeAgentExecutor } from "langchain/agents";
import {
  RequestsGetTool,
  RequestsPostTool,
  AIPluginTool,
} from "langchain/tools";

export const getAgent = async () => {
    const tools = [
      new RequestsGetTool(),
      new RequestsPostTool(),
      await AIPluginTool.fromPluginUrl(
        "https://www.klarna.com/.well-known/ai-plugin.json"
      ),
    ];
    const agent = await initializeAgentExecutor(
      tools,
      new ChatOpenAI({ temperature: 0.7, modelName: 'gpt-3.5-turbo-0301' }),
      "chat-zero-shot-react-description",
      true
    );

    return agent;
};
  
  