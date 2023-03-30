import { OpenAI } from "langchain";
import { initializeAgentExecutor } from "langchain/agents";
import { DynamicTool, Tool } from "langchain/tools";
import { CallbackManager } from "langchain/callbacks";
import { renderTemplate, StringPromptValue } from "langchain/prompts";
import { funcPromptTempalte } from "./func-tool-prompt";
import { ChatOpenAI } from "langchain/chat_models";
import prompts from 'prompts';
import { HumanTool } from "./tools/human";
import { getLlmBashChain } from "./chat";



type SendEmailArgs = { 
    /**
     * @description the address(es) of the receiver(s)
     */
    to: string | string[]; 
    /**
     * @description the subject of the email
     */
    subject: string;
    /**
     * @description the content of the email
     */
    content: string 
}

interface TezignFunctions {
    /**
     *
     * @description show data analytics for a portal
     */
    showPortalAnalytics: (portalId: number) => void;
    /**
     *
     * @description create a new post in tezign platform
     */
    createNewPost: (args: { title: string; content: string }) => void;
    /**
     * @desctiprion send email to user(s)
     * 
     */
    sendEmail: (args: SendEmailArgs) => void;
    /**
     * @description get email address of user(s) by their user id in Tezign database system
     * 
     */
    getEmailAddressByUserId: (userId: number | number[] | string[] | string) => string[] | string;
}

export class FunctionSpecsTool extends Tool {
    name = "tezigb-functions-specs-tool";

    verbose = true;

    constructor() {
        super();
    }

    async _call() {
        return this.functionSpecs;
    }

    description = `Call this tool to get the functions spec defined with typescript typings for passing to Tezign actions function. You should only call this ONCE! What is the Tezign actions useful for?\
`;

    functionSpecs = `Use the following typescript typings which defines tezign actions function,
type SendEmailArgs = { 
    /**
     * @description the email address(es) of the receiver(s)
     */
    to: string | string[]; 
    /**
     * @description the subject of the email
     */
    subject: string;
    /**
     * @description the content of the email
     */
    content: string 
}

interface TezignFunctions {
    /**
     *
     * @description show data analytics for a portal
     */
    showPortalAnalytics: (portalId: number) => void;
    /**
     *
     * @description create a new post in tezign platform
     */
    createNewPost: (args: { title: string; content: string }) => void;
    /**
     * @desctiprion send email to user(s)
     * 
     */
    sendEmail: (args: SendEmailArgs) => void;
    /**
     * @description get email address of user(s) by their user id in Tezign database system
     * 
     */
    getEmailAddressByUserId: (userId: number[] | string[]) => string[];
}
    `;
}

export class FunctionExecutor extends Tool {
    name = "tezign-function-executor";

    verbose = true;

    async _call(input: string) {
        try {
            const args = JSON.parse(input);
            console.log('parsed arguments: ---------', args);
            // @ts-ignore
            const {methodName, arguments: params} = args;
            switch(methodName) {
                case "showPortalAnalytics":
                    return 'Portal Analytics has shown.'
                case 'createNewPost':
                    return 'New post has been created.'
                case 'sendEmail':
                    return 'Email has been sent.'
                case 'getEmailAddressByUserId':
                    const ids =  Array.from({length: params.length}).map((_, index) => `user_${index}`);
                    return `Here is the user ids: ${ids}`
                default:
                    return 'unexpected method name'
            }
        } catch (error) {
            return error.stack || error.message;
        }
    }

    description = `This tool is used specifictly to validate the input of the Tezign actions function and executing tezign actions function.
    Input should be a json string with two keys: "methodName" and "arguments"
    The value of "methodName" should be a string, and the value of "arguments" should be a dictionary of
    key-value pairs or a list you want to pass to as function's arguments JSON body.
    Be careful to always use double quotes for strings in the json string
    The output will be the text response of the function execution.
    `;
}

const model = new ChatOpenAI({
    temperature: 0,
    verbose: true,
});


// AgentExecutor.fromAgentAndTools({
//     agent: ChatAgent.fromLLMAndTools(llm, tools),
//     tools,
//     returnIntermediateSteps: true,
//     verbose,
//     callbackManager,
//   })

const bashChain = getLlmBashChain();

const bashChainTool = new DynamicTool({
    description: 'You can use this tool for processing and executing bash script (command).The input to this tool is a natural language instruction.',
    func(arg: string) {
        return bashChain.run(arg)
    },
    name: 'bash-script-tool'
})

export const getFuncAgent = async () => {
    const funcAgent = await initializeAgentExecutor(
        [new HumanTool(), new FunctionSpecsTool(), new FunctionExecutor()],
        model,
        "chat-zero-shot-react-description",
        true,
        CallbackManager.fromHandlers({
            // @ts-ignore
            handleAgentAction: (action) => {
                console.log(`Agent action: `, action);
            },
            // @ts-ignore
            handleAgentEnd: (action) => {
                console.log("Agent ended. ", action);
            },
            // @ts-ignore
            handleChainStart(chain, inputs, verbose) {
                console.log("Chain started.", chain, inputs, verbose);
            },
            // @ts-ignore
            handleLLMStart(llm, prompts, verbose) {
                console.log("LLM started.", llm, prompts, verbose);
            },
            // @ts-ignore
            handleLLMNewToken(token, verbose) {
                console.log("LLM got new token.", token, verbose);
            },
            handleChainEnd(outputs, verbose) {
                console.log("Chain ended.", JSON.stringify(outputs, null, 2));
            },
            handleLLMEnd(outputs, verbose) {
                console.log("LLM ended.", outputs, verbose);
            },
            handleToolEnd(output, verbose) {
                console.log("Tool ended.", output, verbose);
            },

        })
    );
    
    funcAgent.maxIterations = 8;

    return funcAgent
};
