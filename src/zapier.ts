import { OpenAI } from "langchain";
import { initializeAgentExecutor, ZapierToolKit } from "langchain/agents";
import { CallbackManager } from "langchain/callbacks";
import { ZapierNLAWrapper } from "langchain/tools";

export const getZapierAgent = async () => {
    const model = new OpenAI({ temperature: 0, verbose: true });
    const zapier = new ZapierNLAWrapper();
    const toolkit = await ZapierToolKit.fromZapierNLAWrapper(zapier);

    const executor = await initializeAgentExecutor(
        toolkit.tools,
        model,
        "zero-shot-react-description",
        true,
        CallbackManager.fromHandlers({
            // @ts-ignore
            handleAgentAction: (action) => {
                console.log(`Agent action: `, action);
            },
            // @ts-ignore
            handleAgentEnd: (action) => {
                console.log('Agent ended. ', action);
            },
            // @ts-ignore
            handleChainStart(chain, inputs, verbose) {
                console.log('Chain started.', chain, inputs, verbose);
            },
            // @ts-ignore
            handleLLMStart(llm, prompts, verbose) {
                console.log('LLM started.', llm, prompts, verbose);
            },
            // @ts-ignore
            handleLLMNewToken(token, verbose) {
                console.log('LLM got new token.', token, verbose);
            },
            handleChainEnd(outputs, verbose) {
                console.log('Chain ended.', outputs, verbose);
            },
            handleLLMEnd(outputs, verbose) {
                console.log('LLM ended.', outputs, verbose);
            },
            handleToolEnd(output, verbose) {
                console.log('Tool ended.', output, verbose);
            },
        })
    );
    console.log("Loaded agent.");

    const input = `I want to send a email to the address '727539601@qq.com', the content is regarding the new AI development project`;

    console.log(`Executing with input "${input}"...`);

    const result = await executor.call({ input });

    console.log(`Got output ${result.output}`);
};
